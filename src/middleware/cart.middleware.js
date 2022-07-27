const { cartFormatError } = require('../constant/err.type')
const validator = async (ctx, next) => {
  try {
    ctx.verifyParams({
      goods_id: 'number',
    })
  } catch (error) {
    console.error(error)
    cartFormatError.result = error
    return ctx.app.emit('error', cartFormatError, ctx)
  }
  await next()
}
module.exports = {
  validator,
}
