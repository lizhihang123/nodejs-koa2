const Goods = require('../model/goods.model')
class GoodsService {
  async createGoods(goods) {
    try {
      const res = await Goods.create(goods)
      return res.dataValues
    } catch (error) {
      console.error('数据库 创建商品失败', error)
    }
  }

  async updateGoods(id, goods) {
    try {
      const newObj = {}
      const whereOpt = { id }
      const { goods_name, goods_price, goods_num, goods_img } = goods
      goods_name && Object.assign(newObj, { goods_name })
      goods_price && Object.assign(newObj, { goods_price })
      goods_num && Object.assign(newObj, { goods_num })
      goods_img && Object.assign(newObj, { goods_img })
      const res = await Goods.update(newObj, {
        where: whereOpt,
      })
      console.log(res[0])
      return res[0] > 0 ? true : false
    } catch (error) {
      return console.error('数据库 更新商品失败', error)
    }
  }

  // 删除商品 硬
  async removeGoods(id) {
    const whereOpt = { id }
    try {
      const res = await Goods.destroy({
        where: whereOpt,
      })
      return res > 0 ? true : false
    } catch (error) {
      console.error('数据库操作失败', error)
    }
  }

  // 删除商品(软)
  async restoreGoods(id) {
    const whereOpt = { id }

    const res = await Goods.restore({
      where: whereOpt,
    })
    // res是数字
    return res > 0 ? true : false
  }

  async findAllGoods({ pageSize, pageNum }) {
    try {
      const offset = (pageNum - 1) * pageSize
      const { count, rows } = await Goods.findAndCountAll({
        // 为什么要 * 1
        limit: pageSize * 1,
        offset: offset,
      })
      // const count = await Goods.count()
      // const rows = await Goods.findAll({
      //   limit: pageSize * 1,
      //   offset: offset,
      // })
      return {
        list: rows,
        total: count,
        pageSize,
        pageNum,
      }
    } catch (error) {
      console.error('商品查询失败', error)
    }
  }
}

module.exports = new GoodsService()
