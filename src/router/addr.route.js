// 1 引入中间件
const Router = require('koa-router')

// 引入中间件
const { auth } = require('../middleware/auth.middleware')
const { validator } = require('../middleware/addr.middleware')

// 引入控制器
const {
  add,
  findAll,
  update,
  remove,
  setDefault,
} = require('../controller/addr.controller')

// 2 创建实例
const router = new Router({
  prefix: '/addr',
})

// 增加地址
router.post(
  '/add',
  auth,
  validator({
    consignee: 'string',
    phone: { type: 'string', format: /^1\d{10}$/ },
    address: 'string',
  }),
  add
)
// 查询地址
router.get('/find', auth, findAll)

// 修改地址
router.put(
  '/update/:id',
  auth,
  validator({
    consignee: 'string',
    phone: { type: 'string', format: /^1\d{10}$/ },
    address: 'string',
  }),
  update
)

// 删除接口
router.delete('/delete/:id', auth, remove)

// 设置默认值
router.patch('/:id', auth, setDefault)

// 3 导出实例
module.exports = router
