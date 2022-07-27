const jwt = require('jsonwebtoken')
const {
  createUser,
  getUserInfo,
  updateById,
} = require('../service/user.service')
const {
  userFormateError,
  userAlreadyExited,
  userRegisterError,
} = require('../constant/err.type')
const { JWT_SECRET } = require('../config/config.default')

class UserController {
  async register(ctx, next) {
    const { user_name, password } = ctx.request.body
    console.log(password)
    try {
      // 1 验证合法性 前面的中间件会操作
      // 2 操作数据库
      const res = await createUser(user_name, password)
      // 3 返回结果
      // ctx.body = res
      ctx.body = {
        code: 0,
        message: '用户注册成功',
        result: {
          id: res.id,
          user_name: res.user_name,
        },
      }
    } catch (error) {
      console.error('注册错误', error)
      ctx.app.emit('error', userRegisterError, ctx)
    }
  }
  // 登录
  async login(ctx, next) {
    const { user_name } = ctx.request.body

    // 获取用户信息 在token的payload中 记录 id user_name is_admin
    try {
      // 疑惑
      // 从返回结果中 剔除password属性，剩下属性放到res
      const { password, ...res } = await getUserInfo({ user_name })
      ctx.body = {
        code: '0',
        message: '用户登录成功',
        // 疑惑
        result: {
          token: jwt.sign(res, JWT_SECRET, {
            expiresIn: '1d',
          }),
        },
      }
    } catch (error) {
      console.log('用户登录失败', error)
    }
  }

  // 修改密码
  async changePassword(ctx, next) {
    try {
      const id = ctx.state.user.id
      // 请求体里面获取用户名
      // 可以同时修改账号和密码
      const user_name = ctx.request.body.user_name
      const password = ctx.request.body.password
      await updateById({ id, user_name, password })
      ctx.body = {
        code: 0,
        message: '修改密码成功',
        result: '',
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        code: '10007',
        message: '修改密码失败',
        result: '',
      }
    }
  }
}

module.exports = new UserController()
