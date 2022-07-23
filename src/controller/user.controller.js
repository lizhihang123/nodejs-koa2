const { createUser, getUserInfo } = require('../service/user.service')

class UserController {
  async register(ctx, next) {
    // ctx.body = '用户注册成功'
    // 1 获取数据
    const { user_name, password } = ctx.request.body
    // 1 错误处理 密码或者账号为空【合法性】
    if (!user_name || !password) {
      console.error('用户名或者密码为空')
      ctx.status = 400
      ctx.body = {
        code: '10001',
        messag: '用户名或者密码为空',
        result: '',
      }
      return
    }
    // 1 错误处理 用户名已经存在【合理性】
    // 返回的是一个promise对象 如果没有用await接受 一个{} if语句判断一定是true
    // console.log(getUserInfo({ user_name }))
    if (await getUserInfo({ user_name })) {
      console.error('用户名或密码已经存在')
      ctx.status = 409
      ctx.body = {
        code: '10002',
        message: '用户名已经存在',
        result: '',
      }
      return
    }
    // // 2 操作数据库
    const res = await createUser(user_name, password)
    // // 3 返回结果
    // ctx.body = res
    console.log('第34行', ctx)
    ctx.body = {
      code: 0,
      message: '用户注册成功',
      result: {
        id: res.id,
        user_name: res.user_name,
      },
    }
  }
  async login(ctx, next) {
    ctx.body = '用户登录成功111'
  }
}

module.exports = new UserController()
