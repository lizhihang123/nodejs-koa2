const path = require('path')
const Koa = require('koa')
const KodBody = require('koa-body')
const KoaStatic = require('koa-static')
// 服务器实例
const app = new Koa()
// 路由实例
const router = require('../router/index')
const errhandler = require('./errHandler')

// koa-parameter参数校验
const parameter = require('koa-parameter')

// 注册中间件 一定在路由之前使用 能够获取请求体的数据的中间件 [文件上传 ……很多功能]
app.use(
  KodBody({
    multipart: true,
    formidable: {
      // \heima\front\6 nodejs的学习\koa+nodejs\project\upload
      // uploadDir值如果直接是路径 会从process.cwd()里面进行
      // process.cwd()项目的根目录
      uploadDir: path.join(__dirname, '../upload'),
      keepExtensions: true,
    },
  })
)
app.use(parameter(app))
app.use(router.routes())
/* 
1 为什么这里加的是两个..而不是一个.
*/
app.use(KoaStatic(path.join(__dirname, '.../upload')))

// 统一处理 错误信息
app.on('error', errhandler)

module.exports = app
