const { goodsFormatError } = require('../constant/err.type')
const validator = (rules) => {
  return async (ctx, next) => {
    try {
      // rules使用外层的变量 是闭包
      ctx.verifyParams(rules)
    } catch (error) {
      // 赋值 更加精准的定位到是哪个参数出错了
      goodsFormatError.result = error
      console.error('商品格式错误')
      return ctx.app.emit('error', goodsFormatError, ctx)
    }
    await next()
  }
}

module.exports = {
  validator,
}
