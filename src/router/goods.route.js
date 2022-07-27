/* 
思考 route.js文件怎么写
0 导入koa-router组件 -》要写路由
1 需要挂载前缀
2 需要导出实例

*/

const Router = require('koa-router')
const { auth, hadAdminPermission } = require('../middleware/auth.middleware')
const { validator } = require('../middleware/goods.middleware')
const {
  upload,
  create,
  update,
  remove,
  restore,
  findAll,
} = require('../controller/goods.controller')

const router = new Router({
  prefix: '/goods',
})

// 上传商品接口
// 先判断登录 再判断是否有权限
router.post('/upload', auth, hadAdminPermission, upload)

// 发布商品接口
router.post('/add', auth, hadAdminPermission, validator, create)

// 更新商品
router.put('/update/:id', auth, hadAdminPermission, validator, update)

/* 
// 硬删除 必须没有paranoid: true
1 remove -> controller remove方法是否定义好
2 service -> removeGoods是否定义好
3 removeGoods -> 调用model的destroy方法
*/
// router.delete('/delete/:id', auth, hadAdminPermission, remove)
// 软删除 下架商品
router.post('/:id/off', auth, hadAdminPermission, remove)
// 上架商品
router.post('/:id/on', auth, hadAdminPermission, restore)

router.get('/', findAll)

module.exports = router
