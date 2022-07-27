// 1 路由
const Router = require('koa-router')

// 2 中间件
const { auth } = require('../middleware/auth.middleware')
const { validator } = require('../middleware/cart.middleware')

// 前缀
const router = new Router({
  prefix: '/carts',
})

// 3 控制器
const { add } = require('../controller/carts.controller')
// 4 路由挂载
router.post('/add', auth, validator, add)

module.exports = router
