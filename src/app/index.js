const Koa = require('koa')
const KodBody = require('koa-body')
// 服务器实例
const app = new Koa()
// 路由实例
const userRouter = require('../router/user.route')

app.use(KodBody())
app.use(userRouter.routes())

module.exports = app
