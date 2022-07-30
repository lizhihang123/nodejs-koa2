const app = require('../app')
const { addrFormatError } = require('../constant/err.type')

const validator = (rules) => {
  return async (ctx, next) => {
    try {
      await ctx.verifyParams(rules)
    } catch (error) {
      console.error('参数校验失败', error)
      addrFormatError.result = error
      return ctx.app.emit('error', addrFormatError, ctx)
    }
    await next()
  }
}

module.exports = {
  validator,
}
