const { cartFormatError } = require('../constant/err.type')
const Goods = require('../model/goods.model')

// const validator = async (ctx, next) => {
//   try {
//     ctx.verifyParams({
//       goods_id: 'number',
//     })
//   } catch (error) {
//     console.error(error)
//     cartFormatError.result = error
//     return ctx.app.emit('error', cartFormatError, ctx)
//   }
//   await next()
// }
const validator = (rules) => {
  return async (ctx, next) => {
    try {
      ctx.verifyParams(rules)
    } catch (error) {
      console.error(error)
      cartFormatError.result = error
      return ctx.app.emit('error', cartFormatError, ctx)
    }
    await next()
  }
}

// 判断是否有指定的商品 如果没有 就不能添加
const GoodsValidator = async (ctx, next) => {
  // 能够获取到商品id 拿着id 去商品的数据库里面查询
  try {
    const goods_id = ctx.request.body.goods_id
    const res = await Goods.findAll({
      where: goods_id,
    })
    let flag = res.some((item) => {
      return item.dataValues.id === goods_id
    })
    return flag ? await next() : ctx.app.emit('error', cartFormatError, ctx)
  } catch (error) {
    console.error('使用购物车时查询商品失败', error)
    return ctx.app.emit('error', cartFormatError, ctx)
  }
}
module.exports = {
  validator,
  GoodsValidator,
}
