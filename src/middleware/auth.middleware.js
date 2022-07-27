const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/config.default')
const {
  TokenExpiredError,
  invalidToken,
  hasNotAdminPermission,
} = require('../constant/err.type')

// 验证用户token 是否登录
const auth = async (ctx, next) => {
  try {
    const { authorization = '' } = ctx.request.header
    const token = authorization.replace('Bearer ', '')
    const user = jwt.verify(token, JWT_SECRET)
    ctx.state.user = user
  } catch (err) {
    console.log(err)
    switch (err.name) {
      case 'TokenExpiredError':
        console.error('token已经过期', err)
        return ctx.app.emit('error', TokenExpiredError, ctx)
      case 'JsonWebTokenError':
        console.error('token无效', err)
        return ctx.app.emit('error', invalidToken, ctx)
    }
    return
  }
  await next()
}

// 验证是否有管理员的权限
const hadAdminPermission = async (ctx, next) => {
  const { is_admin } = ctx.state.user
  if (!is_admin) {
    console.error('该用户没有管理员权限')
    ctx.app.emit('error', hasNotAdminPermission, ctx)
    return
  }
  await next()
}
module.exports = {
  auth,
  hadAdminPermission,
}
