// 1 引入数据库配置
const seq = require('../db/seq')
// 2 引入数据类型
const { DataTypes } = require('sequelize')

const Address = seq.define('zd_addr', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户id',
  },
  consignee: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '收货人姓名',
  },
  phone: {
    type: DataTypes.CHAR(11),
    allowNull: false,
    comment: '收货人的手机号',
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '收货人的地址',
  },
  is_default: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: false,
    comment: '是否为默认地址, 0:不是(默认值) 1: 是',
  },
})
// Address.sync({
//   force: true,
// })

module.exports = Address
