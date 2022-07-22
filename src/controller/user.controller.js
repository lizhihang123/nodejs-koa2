const { createUser } = require('../service/user.service')

class UserController {
  async register(ctx, next) {
    ctx.body = '用户注册成功'
    // // 1 获取数据
    // const { user_name, password } = ctx.request.body
    // // 2 操作数据库
    // const res = await createUser(user_name, password)
    // // 3 返回结果
    // ctx.body = res.request.body
  }
  async login(ctx, next) {
    ctx.body = '用户登录成功111'
  }
}

module.exports = new UserController()
