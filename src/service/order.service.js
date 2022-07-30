const { orderFormatError } = require('../constant/err.type')
const Orders = require('../model/order.model')

class OrderService {
  // 创建订单
  async createOrder({ user_id, address_id, goods_info, total, order_number }) {
    try {
      const res = await Orders.create({
        user_id,
        address_id,
        goods_info,
        total,
        order_number,
      })
      return res
    } catch (error) {
      console.error('操作数据库失败 添加订单失败', error)
    }
  }

  // 查询订单
  async findAllOrder({ pageSize, pageNum, status }) {
    try {
      const { count, rows } = await Orders.findAndCountAll({
        attributes: ['id', 'goods_info', 'total', 'order_number', 'status'],
        where: {
          status: status,
        },
        offset: (pageNum - 1) * pageSize,
        limit: pageSize * 1,
      })
      return {
        pageSize,
        pageNum,
        total: count,
        list: rows,
      }
    } catch (error) {
      console.error('查询订单失败 service', error)
    }
  }

  // 修改所有的订单
  async updateOrder(id, status) {
    try {
      const res = await Orders.update(
        { status },
        {
          where: {
            id,
          },
        }
      )
      return res.length
    } catch (error) {
      console.error('修改订单失败 service', error)
      ctx.app.emit('error', orderFormatError, ctx)
    }
  }
}

module.exports = new OrderService()
