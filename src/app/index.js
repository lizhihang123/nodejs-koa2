const Koa = require('koa')
const KodBody = require('koa-body')
// 服务器实例
const app = new Koa()
// 路由实例
const userRouter = require('../router/user.route')

// 注册中间件 一定在路由之前使用 能够获取请求体的数据的中间件 [文件上传 ……很多功能]
app.use(KodBody())
app.use(userRouter.routes())

module.exports = app
