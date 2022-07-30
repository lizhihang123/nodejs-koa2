const Address = require('../model/addr.model.js')

class addrService {
  // 创建地址
  async createAddress({ consignee, phone, address, user_id }) {
    try {
      const res = await Address.create({
        consignee,
        phone,
        address,
        user_id,
      })
      return res
    } catch (error) {
      console.error('添加地址失败 数据库内', error)
    }
  }
  // 查询地址接口
  async findAllAddress() {
    try {
      const res = await Address.findAll({
        attributes: ['id', 'consignee', 'address', 'is_default'],
      })
      console.log(res)
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // 更新地址
  async updateAddress({ consignee, phone, address, id }) {
    console.log(consignee, phone, address, id)
    const res = await Address.update(
      { consignee, phone, address },
      {
        where: {
          id: id,
        },
      }
    )
    console.log(res)
    return res
  }

  // 删除地址
  async removeAddress(id) {
    try {
      const res = await Address.destroy({
        where: {
          id: id,
        },
      })
      return res
    } catch (error) {
      console.error(error, '删除地址失败 数据库')
    }
  }

  // 设置默认值
  async setDefaultAddr({ user_id, id }) {
    try {
      await Address.update(
        {
          is_default: false,
        },
        {
          where: { user_id },
        }
      )

      return Address.update(
        {
          is_default: true,
        },
        {
          where: { id },
        }
      )
    } catch (error) {
      console.error('设置默认值失败service', error)
    }
  }
}

module.exports = new addrService()
