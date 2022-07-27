const { DataTypes } = require('sequelize')
const seq = require('../db/seq')
const Goods = seq.define(
  'zd_goods',
  {
    goods_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '商品名, 唯一',
    },
    goods_price: {
      // DECIMAL(10, 2) 2位小数 8位整数 精度非常的高
      // DOUBLE和FLOAT都是近似存储 精度不高s
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '价格',
    },
    goods_num: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品数量',
    },
    goods_img: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '商品图片',
    },
  },
  {
    // 硬删除：直接删除记录
    // 软删除：增加一个标识“is_delete”表示这个记录被删除了，但实际上并没有要删除
    // paranoid -> 表示要硬删除
    paranoid: true,
  }
)

// Goods.sync({
//   force: true,
// })
module.exports = Goods
