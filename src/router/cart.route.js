// 1 路由
const Router = require('koa-router')

// 2 中间件
const { auth } = require('../middleware/auth.middleware')
const { validator, GoodsValidator } = require('../middleware/cart.middleware')

// 前缀
const router = new Router({
  prefix: '/carts',
})

// 3 控制器
const {
  add,
  findAll,
  update,
  remove,
  selectedAll,
  unSelectedAll,
} = require('../controller/carts.controller')

// 4 路由挂载
// 增加购物车
router.post(
  '/add',
  auth,
  validator({
    goods_id: { type: 'number', required: true },
  }),
  GoodsValidator,
  add
)

// 5. 查询购物车列表
router.get('/', auth, findAll)

// 6. 更新购物车
router.patch(
  '/:id',
  auth,
  validator({
    number: { type: 'number', required: false },
    selected: { type: 'boolean', required: false },
  }),
  update
)

// 7. 删除购物车
router.delete('/delete', auth, validator({ ids: 'array' }), remove)

// 8. 全选与全不选
router.post('/selectedAll', auth, selectedAll)
router.post('/unSelectedAll', auth, unSelectedAll)

module.exports = router
