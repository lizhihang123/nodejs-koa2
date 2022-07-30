const {
  createOrUpdate,
  findCarts,
  updateGoods,
  removeCarts,
  selectedAllCarts,
} = require('../service/carts.service')
const {
  cartFormatError,
  selectedAllFalse,
  unSelectedAllFalse,
} = require('../constant/err.type')
class CartController {
  // 增加购物车商品
  async add(ctx) {
    // 1 解析数据
    const user_id = ctx.state.user.id
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

  // 查询购物车所有列表
  async findAll(ctx, next) {
    // 1 解析请求参数
    // get获取参数
    const { pageSize = 10, pageNum = 1 } = ctx.request.query
    // console.log(ctx.request.query, 'ctx.request.query')
    // console.log(ctx.request.params, 'ctx.request.params')
    // console.log(ctx.body, 'ctx.body')
    // 2 操作数据库
    const res = await findCarts(pageSize, pageNum)
    // 3 返回结果
    ctx.body = {
      code: 0,
      message: '查询购物车列表成功',
      result: res,
    }
    await next()
  }

  async update(ctx, next) {
    try {
      // 1 解析数据
      const { number, selected } = ctx.request.body
      const id = ctx.request.params.id

      // number和selected不能同时为空
      if (number === undefined && selected === undefined) {
        cartFormatError.message = 'number和selected不能同时为空'
        return ctx.app.emit('error', cartFormatError, ctx)
      }
      // 2 查询数据库
      // 为什么传递参数 这里用{} 因为用{} 可以传递空的值 undefined,如果不用 就不行
      const res = await updateGoods({ number, selected, id })
      // 3 返回数据
      ctx.body = {
        code: 0,
        message: '更新购物车成功',
        result: res,
      }
    } catch (error) {
      console.error('数据库查询出错', error)
      ctx.app.emit('error', cartFormatError, ctx)
    }
  }

  // 删除购物车
  // 记得delete是关键字 要用remove
  async remove(ctx) {
    try {
      const { ids } = ctx.request.body
      const res = await removeCarts(ids)
      ctx.body = {
        code: 0,
        message: '删除购物车商品成功',
        result: res,
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 全选
  async selectedAll(ctx) {
    try {
      const { id } = ctx.state.user
      const res = await selectedAllCarts(id)
      ctx.body = {
        code: 0,
        message: '全选成功',
        result: res,
      }
    } catch (error) {
      console.error(error, '全选失败')
      ctx.app.emit('error', selectedAllFalse, ctx)
    }
  }
  async unSelectedAll(ctx) {
    try {
      const { id } = ctx.state.user
      const res = await selectedAllCarts(id)
      ctx.body = {
        code: 0,
        message: '全不选成功',
        result: res,
      }
    } catch (error) {
      console.error(error, '全不选失败')
      ctx.app.emit('error', unSelectedAllFalse, ctx)
    }
  }
}

module.exports = new CartController()
