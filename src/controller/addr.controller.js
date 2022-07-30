const {
  createAddress,
  findAllAddress,
  updateAddress,
  removeAddress,
  setDefaultAddr,
} = require('../service/addr.service')
const { AddressParamsFalse } = require('../constant/err.type')
class addrController {
  // 增加地址
  async add(ctx) {
    try {
      const user_id = ctx.state.user.id
      const { phone, consignee, address } = ctx.request.body
      const { dataValues } = await createAddress({
        user_id,
        phone,
        consignee,
        address,
      })
      ctx.body = {
        code: 0,
        message: '添加地址成功',
        result: {
          id: dataValues.id,
          consignee: dataValues.consignee,
          address: dataValues.address,
          is_default: dataValues.is_default ? 1 : 0,
        },
      }
    } catch (error) {
      console.error('添加地址失败 控制器内', error)
    }
  }

  // 查询地址
  async findAll(ctx) {
    const res = await findAllAddress()
    ctx.body = {
      code: 0,
      message: '查询地址成功',
      result: res,
    }
  }

  // 更新地址
  async update(ctx) {
    // ctx.params.id 的 id和前面的router的id对应
    const id = ctx.request.params.id
    const { consignee, phone, address } = ctx.request.body
    const res = await updateAddress({
      consignee,
      phone,
      address,
      id,
    })
    ctx.body = {
      code: 0,
      message: '更新购物车成功',
      result: res,
    }
  }

  // 删除地址
  async remove(ctx) {
    try {
      const id = ctx.request.params.id
      const res = await removeAddress(id)
      ctx.body = {
        code: 0,
        message: '删除地址成功',
        result: res,
      }
    } catch (error) {
      console.error(error, '删除地址失败 error')
      ctx.app.emit('error', AddressParamsFalse, ctx)
    }
  }

  // 设置默认值
  async setDefault(ctx) {
    try {
      const id = ctx.request.params.id
      const user_id = ctx.state.user.id
      const res = await setDefaultAddr({ user_id, id })
      ctx.body = {
        code: 0,
        message: '设置默认值成功',
        result: res,
      }
    } catch (error) {
      console.error('设置默认值失败 controller', error)
    }
  }
}

module.exports = new addrController()
