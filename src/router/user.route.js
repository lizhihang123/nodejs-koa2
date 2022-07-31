const Router = require('koa-router')
const {
  login,
  register,
  changePassword,
} = require('../controller/user.controller')
const {
  userValidator,
  verifyUser,
  crpytPassword,
  verifyLogin,
} = require('../middleware/user.middleware')
const { auth } = require('../middleware/auth.middleware')
const router = new Router({
  prefix: '/user',
})

// 用作测试使用
router.get('/article/:id', (ctx) => {
  console.log(ctx.params)
  // 没有通过ctx.body返回数据时, 默认koa返回404错误
  // console.log(aaa)
  if (false) {
    ctx.body = { id: 1, title: '文章1', content: '文章1' }
  } else {
    ctx.throw(422, '参数格式不正确')
  }
})
router.get('/', (ctx, next) => {
  ctx.body = 'hello users'
})
// 注册
// 先测试userValidator 通过 再走login
router.post('/register', userValidator, verifyUser, crpytPassword, register)
// 登录
// 先测试userValidator 通过 再走login
router.post('/login', userValidator, verifyLogin, login)

// 修改密码
// auth 是否有权限
// crpytPassword密码是否和原来的一致
// changePassword 修改密码
router.patch(
  '/updatePassword',
  auth,
  crpytPassword,
  changePassword,
  (ctx, next) => {
    ctx.body = '111'
  }
)
module.exports = router
