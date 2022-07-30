const { OrderParamsFalse } = require('../constant/err.type')

const validator = (rules) => {
  return async (ctx, next) => {
    try {
      ctx.verifyParams(rules)
      await next()
    } catch (error) {
      ctx.app.emit('error', OrderParamsFalse, ctx)
      return console.error('校验路由规则失败', error)
    }
  }
}

module.exports = {
  validator,
}
