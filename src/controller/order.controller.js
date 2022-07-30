const {
  createOrder,
  findAllOrder,
  updateOrder,
} = require('../service/order.service')
class OrderController {
  // 创建订单
  async create(ctx, next) {
    try {
      const user_id = ctx.state.user.id
      const { address_id, goods_info, total } = ctx.request.body
      const order_number = 'XZD' + Date.now()
      const res = await createOrder({
        user_id,
        address_id,
        goods_info,
        total,
        order_number,
      })
      ctx.body = {
        code: 0,
        message: '添加订单成功',
        result: res,
      }
    } catch (error) {
      console.error('controller 添加订单失败', error)
    }
  }

  // 查询所有订单
  async findAll(ctx) {
    const { pageSize = 10, pageNum = 1, status = 0 } = ctx.request.body
    try {
      const res = await findAllOrder({
        pageSize,
        pageNum,
        status,
      })
      ctx.body = {
        code: 0,
        message: '查询订单成功',
        result: res,
      }
    } catch (error) {
      return console.error('查询订单失败 controller', error)
    }
  }

  // 修改所有订单
  async update(ctx) {
    try {
      const { id } = ctx.request.params
      const { status } = ctx.request.body
      const res = await updateOrder(id, status)
      ctx.body = {
        code: 0,
        message: '修改订单成功',
        result: res,
      }
    } catch (error) {
      console.error(error, '修改订单失败 controller')
    }
  }
}

module.exports = new OrderController()
