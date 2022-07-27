const { getUserInfo } = require('../service/user.service')
const {
  userFormateError,
  userAlreadyExited,
  userRegisterError,
  userDoesNotExist,
  invalidPassword,
  userLoginError,
} = require('../constant/err.type')

const bcryptjs = require('bcryptjs')
// 1 错误处理 用户名或者密码为空
const userValidator = async (ctx, next) => {
  const { user_name, password } = ctx.request.body
  // 1 错误处理 密码或者账号为空【合法性】
  if (!user_name || !password) {
    console.error('用户名或者密码为空')
    ctx.status = 400
    // 触发错误处理
    ctx.app.emit('error', userFormateError, ctx)
    return
  }
  // 执行下一个中间件【如果账号和密码都不为空】
  await next()
}
// 2 错误处理 用户名已经存在【合理性】
// 返回的是一个promise对象 如果没有用await接受 一个{} if语句判断一定是true
// console.log(getUserInfo({ user_name }))
const verifyUser = async (ctx, next) => {
  const { user_name } = ctx.request.body
  try {
    // 如果查不到用户信息 res是null
    // 应该是null不进入逻辑判断
    const res = await getUserInfo({ user_name })
    if (res) {
      ctx.app.emit('error', userAlreadyExited, ctx)
      return
    }
  } catch (error) {
    console.error('获取用户信息错误', error)
    ctx.app.emit('error', userRegisterError, ctx)
    return
  }
  // 【如果用户名没有重复的话】
  await next()
}

// 3 密码加密中间件
const crpytPassword = async (ctx, next) => {
  const password = ctx.request.body.password
  const saltRounds = 10
  // abc => 用户的密码
  // 123abc=> 123是额外的数字
  // salt就是生成salt
  // hash就是对123abc进行二次加密
  // 这样的流程还会再次拼接一次
  const salt = bcryptjs.genSaltSync(saltRounds)
  const hash = bcryptjs.hashSync(password, salt)
  // 传递给服务器的密码就是hash值
  // 后续查找 也会进行加密 再比对
  ctx.request.body.password = hash
  await next()
}

// 4 登录校验中间件
const verifyLogin = async (ctx, next) => {
  try {
    // 从用户提交的对象里提取用户名和密码
    const { user_name, password } = ctx.request.body
    // 判断用户名是否存在 不存在 提示错误信息(错误日志+提示用户)
    const res = await getUserInfo({ user_name })
    // 用户不存在判断 res => null
    if (!res) {
      console.error(user_name, '用户不存在')
      ctx.app.emit('error', userDoesNotExist, ctx)
      return
    }
    // 判断用户提交的密码和服务器查到的密码是否一致 如果不一致 提示错误信息
    // hash -> 来自数据库
    if (!bcryptjs.compareSync(password, res.password)) {
      console.error('用户输入的密码错误，请重试')
      return ctx.app.emit('error', invalidPassword, ctx)
    }
  } catch (err) {
    console.error(err)
    ctx.app.emit('error', userLoginError, ctx)
    return
  }
  await next()
}
module.exports = {
  userValidator,
  verifyUser,
  crpytPassword,
  verifyLogin,
}
