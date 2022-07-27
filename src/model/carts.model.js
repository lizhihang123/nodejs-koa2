const { DataTypes } = require('sequelize')
const seq = require('../db/seq')
const Carts = seq.define(zd_carts, {
  goods_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '商品的id',
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户的id',
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '商品的数量',
  },
  selected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '商品的id',
  },
})

// 同步数据 建表
Carts.sync({
  force: true,
})

// 表的属于关系
Carts.belongsTo(Goods, {
  foreignKey: 'goods_id',
  as: 'goods_info',
})

// 导出
module.exports = Carts
