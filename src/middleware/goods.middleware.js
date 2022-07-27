const { goodsFormatError } = require('../constant/err.type')
const validator = async (ctx, next) => {
  try {
    ctx.verifyParams({
      goods_name: { type: 'string', require: true },
      goods_price: { type: 'number', require: true },
      goods_num: { type: 'number', require: true, max: 10 },
      goods_img: { type: 'string', require: true },
    })
  } catch (error) {
    // 赋值 更加精准的定位到是哪个参数出错了
    goodsFormatError.result = error
    console.error('商品格式错误')
    return ctx.app.emit('error', goodsFormatError, ctx)
  }
  await next()
}

module.exports = {
  validator,
}
