const Router = require('koa-router')
const { login, register } = require('../controller/user.controller')
const router = new Router({
  prefix: '/user',
})
router.get('/', (ctx, next) => {
  ctx.body = 'hello users'
})
// 注册
router.post('/login', login)
// 登录
router.post('/register', register)

module.exports = router
