const path = require('path')
const {
  unSupportedFileType,
  fileUploadError,
  goodsFormatError,
  invalidGoodsID,
} = require('../constant/err.type')
const Goods = require('../service/goods.service')

class GoodsController {
  // 上传商品
  async upload(ctx, next) {
    // 获取文件的数据
    const { file } = ctx.request.files
    // 这里的file 和 postman里面的key对应
    // 声明可以有的文件类型
    // console.log(path.join(__dirname, '../upload'))
    const fileList = ['image/jpeg', 'image/png', 'image/jpg']
    // 判断是否有文件
    if (file) {
      // 判断文件的类型是否正确 不正确 报错
      if (!fileList.includes(file.mimetype)) {
        console.error('文件的类型不正确')
        return ctx.app.emit('error', unSupportedFileType, ctx)
      }
      // 返回信息
      ctx.body = {
        code: 0,
        message: '商品图片上传成功',
        result: {
          goods_img: path.basename(file.filepath),
        },
      }
    } else {
      // 没有文件 报错
      console.error('没有上传文件')
      return app.ctx.emit('error', fileUploadError, ctx)
    }
    await next()
  }

  // 发布/创建商品
  async create(ctx, next) {
    try {
      const goods = ctx.request.body
      console.log(goods)
      const { updatedAt, createdAt, ...res } = await Goods.createGoods(goods)
      if (res) {
        ctx.body = {
          code: 0,
          messgae: '发布商品成功',
          result: res,
        }
      }
    } catch (error) {
      console.error('发布商品失败')
      ctx.app.emit('emit', goodsFormatError, ctx)
    }
  }

  // 修改商品
  async update(ctx) {
    try {
      const id = ctx.params.id
      const body = ctx.request.body
      const res = await Goods.updateGoods(id, body)
      if (res) {
        ctx.body = {
          code: 0,
          message: '更新商品成功',
          result: res,
        }
      } else {
        console.error('无效商品id', invalidGoodsID)
        return ctx.app.emit('error', invalidGoodsID, ctx)
      }
    } catch (error) {
      console.error('更新商品失败', error)
    }
  }

  // 删除商品
  async remove(ctx) {
    const res = await Goods.removeGoods(ctx.params.id)
    if (res) {
      ctx.body = {
        code: 0,
        message: '下架商品成功',
        result: '',
      }
    } else {
      return ctx.app.emit('error', invalidGoodsID, ctx)
    }
  }

  // 删除商品(软)
  async restore(ctx) {
    try {
      const res = await Goods.restoreGoods(ctx.params.id)
      if (res) {
        ctx.body = {
          code: 0,
          message: '上架商品成功',
          result: '',
        }
      } else {
        // 如果商品已经上架了 再次上架报错id无效
        ctx.app.emit('error', invalidGoodsID, ctx)
      }
    } catch (error) {
      console.error('上架商品失败', error)
    }
  }

  // 商品列表查询
  async findAll(ctx) {
    try {
      // 这两个 给默认值
      const { pageSize = 10, pageNum = 1 } = ctx.request.query
      const res = await Goods.findAllGoods({
        pageSize,
        pageNum,
      })
      ctx.body = {
        code: 0,
        message: '查询到所有的商品信息',
        result: res,
      }
    } catch (error) {
      console.error('商品查询失败', error)
      ctx.app.emit('商品查询失败', serveParametersFalse, ctx)
    }
  }
}

module.exports = new GoodsController()
