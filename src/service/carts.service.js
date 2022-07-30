const { Op } = require('sequelize')
const Cart = require('../model/carts.model')
const Goods = require('../model/goods.model')
const { cartFormatError } = require('../constant/err.type')
class GoodsService {
  // 创建 / 更新购物车
  async createOrUpdate(user_id, goods_id) {
    console.log(user_id, goods_id)
    try {
      let res = await Cart.findOne({
        where: {
          [Op.and]: {
            user_id,
            goods_id,
          },
        },
      })
      console.log(res)
      if (res) {
        // 如果存在 就数量 自增1
        // increment({'number': 1}, {by: 2})
        await res.increment('number')
        // 重新加载
        return await res.reload()
      } else {
        // 如果数量不存在 就根据 user_id和goods_id创建一个商品
        return await Cart.create({
          user_id,
          goods_id,
        })
      }
    } catch (error) {
      console.error('添加购物车失败', error)
      ctx.app.emit('error', cartFormatError, ctx)
    }
  }

  // 查询购物车
  async findCarts(pageSize, pageNum) {
    const offset = (pageNum - 1) * pageSize
    const { rows, count } = await Cart.findAndCountAll({
      // 这里的attribute指的是 指定的carts里面的表
      attributes: ['id', 'number', 'selected'],
      offset: offset,
      limit: pageSize * 1,
      // 因为有关联 才能够查询到对应的id的商品信息
      include: {
        model: Goods,
        as: 'goods_info',
        attributes: ['goods_num', 'goods_price', 'goods_img', 'id'],
      },
    })
    console.log(rows)
    console.log(count)
    return {
      list: rows,
      total: count,
      pageNum,
      pageSize,
    }
  }

  // 更新购物车
  async updateGoods(params) {
    const { id, selected, number } = params
    try {
      const res = await Cart.findByPk(id)
      // console.log('res', res.number, res.selected)
      if (!res) {
        return ''
      }
      // 给返回值 res进行赋值 代表修改记录的值
      // 但是注意 这样的修改不能同步到数据库上面
      // 因此要使用res.save方法
      if (number !== undefined) {
        res.number = number
      }
      if (selected !== undefined) {
        res.selected = selected
      }
      // 进行缓存
      return await res.save()
    } catch (error) {
      console.error('error', error)
    }
  }

  // 删除购物车
  async removeCarts(ids) {
    try {
      // [Op.in]: [1, 2, 3]等同于
      console.log(ids)
      const res = await Cart.destroy({
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // 全选购物车
  async selectedAllCarts(user_id) {
    try {
      const whereOpt = { user_id }
      const newObj = { selected: true }
      const res = await Cart.update(newObj, {
        where: whereOpt,
      })

      return res.length
    } catch (error) {
      console.error(error, '全选失败')
    }
  }

  // 全不选购物车
  async unselectedAll(user_id) {
    try {
      const whereOpt = { user_id }
      const newObj = { selected: true }
      const res = await Cart.update(newObj, {
        where: whereOpt,
      })

      return res.length
    } catch (error) {
      console.error(error, '全不选失败')
    }
  }
}

module.exports = new GoodsService()
