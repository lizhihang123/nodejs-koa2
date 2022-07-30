// 1 引入中间件
const Router = require('koa-router')

// 1 创建路由对象
const router = new Router({
  prefix: '/orders',
})

// 2 controller

const { create, findAll, update } = require('../controller/order.controller')

// 3 中间件

const { auth } = require('../middleware/auth.middleware')
const { validator } = require('../middleware/common.middleware')
const { orderFormatError } = require('../constant/err.type')

// 3 挂载路由

// 生成订单
router.post(
  '/create',
  auth,
  validator(
    {
      address_id: { type: 'number', required: true },
      goods_info: { type: 'string', required: true },
      total: { type: 'string', required: true },
    },
    orderFormatError
  ),
  create
)

// 获取所有的订单信息
router.get('/', auth, findAll)

// 修改订单信息
router.patch(
  '/:id',
  auth,
  validator(
    {
      status: 'number',
    },
    orderFormatError
  ),
  update
)

// 4 导出路由对象
module.exports = router
