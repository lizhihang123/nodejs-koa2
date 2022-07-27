const { createOrUpdate } = require('../service/carts.service')
class CartController {
  async add(ctx) {
    // 1 解析数据
    const user_id = ctx.state.user.body
    const goods_id = ctx.request.body.goods_id
    // 2 操作数据库
    const res = await createOrUpdate(user_id, goods_id)
    // 3 返回数据
    ctx.body = {
      code: 0,
      message: '增加购物车成功',
      result: res,
    }
  }
}

module.exports = new CartController()
