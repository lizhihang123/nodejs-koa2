

# 8. 创建User模型

## 1  拆分model层

用户通过不同路由 获取不同的数据 => router/user.route.js

user.route.js => 里面通过从控制器里面引入方法 => user.controller.js里面进行相应的业务操作

user.controller.js => 从service/user.service.js里面引入 => user.service.js里面进行数据库操作

user.service.js => 从model/user.model.js里面引入对象

这个文件就是我们要建立的model模型



```js
为什么要建立model模型?
```

sequelize.js是`ORM-对象关系映射`的一个数据库工具

ORM：

​	一个数据表对应一个类

​	一行 就是一个对象

​	一个字段就是一个属性

​	数据表的操作就是一个对应对象的方法



`model/user.model.js`



```js
const { DataTypes } = require('sequelize')
const seq = require('../../db/seq')

// 创建模型 Model zd_user -> zd_users
// define是定义用

/*
seq.define => 定义一个数据表的方法

Datatypes里面存储所有的数值类型

id会有默认值 我们不用管

allowNull是否允许空

unique是否是要求唯一值

user.sync({})强制关联数据表
*/
const User = seq.define('zd_user', {
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '用户名, 唯一',
  },
  password: {
    type: DataTypes.CHAR(64),
    allowNull: false,
    comment: '密码',
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0,
    comment: '是否为管理员, 0: 不是管理员(默认), 1: 是管理员',
  },
})

// 强制同步数据库 创建数据表
User.sync({
  force: true,
})
module.exports = User
```



>默认会插入：
>
>1 时间戳 createdAt 和 updatedAt 记录表创建时间和更新时间 留着有好处





# 9. 添加用户入库

路由 => 控制器 => service => model

路由访问 => 控制器执行业务操作 => service操作数据库 => 使用model的User类的create方法

`service/user.service.js`

```diff
const User = require('../model/user.model')

class UserService {
+  async createUser(user_name, password) {
    // ES6简写
    // 使用User类的create方法
+    const res = await User.create({
      user_name,
      password,
    })
    console.log(res.dataValues)
+    return res.dataValues
  }
}

module.exports = new UserService()

```



`controller/user.controller.js`

```diff
const { createUser } = require('../service/user.service')

class UserController {
  async register(ctx, next) {
    // ctx.body = '用户注册成功'
    // // 1 获取数据
+    const { user_name, password } = ctx.request.body
    // // 2 操作数据库
+    const res = await createUser(user_name, password)
    // // 3 返回结果
    // ctx.body = res
+    ctx.body = {
      code: 0,
      messgage: '用户注册成功',
      result: {
        id: res.id,
        user_name: res.user_name,
      },
    }
  }
```





# 10. 错误处理

如果重复，但是没有做错误处理，调用接口就会报错，且找不到错误在哪里

```js
    // 1 错误处理 密码或者账号为空【合法性】
    if (!user_name || !password) {
      console.error('用户名或者密码为空')
      ctx.status = 400
      ctx.body = {
        code: '10001',
        messag: '用户名或者密码为空',
        result: '',
      }
      return
    }
    // 1 错误处理 用户名已经存在【合理性】
    // 返回的是一个promise对象 如果没有用await接受 一个{} if语句判断一定是true
    // console.log(getUserInfo({ user_name }))
    if (await getUserInfo({ user_name })) {
      console.error('用户名或密码已经存在')
      ctx.status = 409
      ctx.body = {
        code: '10002',
        message: '用户名已经存在',
        result: '',
      }
      return
    }
```

>特别关注 getUserInfo的返回的是一个promise对象 if语句判断必须await

在service层里面

`User.findOne`的意思是根据一个属性或者多个属性去查询记录，查到的值一定是唯一的值

如果查到了res就有值，返回它的dataValues否则返回null值

```js
async getUserInfo({ id, user_name, password, is_admin }) {
    const whereOpt = {}

    id && Object.assign(whereOpt, { id })
    user_name && Object.assign(whereOpt, { user_name })
    password && Object.assign(whereOpt, { password })
    is_admin && Object.assign(whereOpt, { is_admin })
    
    const res = User.findOne({
      attributes: ['id', 'user_name', 'password', 'is_admin'],
      where: whereOpt,
    })

    return res ? res.dataValues : null
  }
```

控制器里面的操作都是async和await 因为数据库的操作基本都是异步的

>响应码 409 来自 MDN可以搜到



# 11. 中间件的抽离

![image-20210524154353520](D:/heima/front/6%20nodejs%E7%9A%84%E5%AD%A6%E4%B9%A0/koa+nodejs/project/2%20body%20sequelize%20User%E6%A8%A1%E5%9E%8B.assets/image-20210524154353520.png)

为什么抽离中间件？

有些逻辑可以写在一个类里面，但是比较混轮，而且有可能其它类也要使用这段逻辑，因此就把他们封装为中间件，一个中间件执行一个功能



## 1 拆分中间件

从`user.controller.js`中抽离文件出来到 middleware`user.middleware.js`文件里面去

抽离的是 `用户名和密码是否为空` &`是否存在相同的用户`的方法的判断

这个文件里面还有抽离 看下下面

```js
const { getUserInfo } = require('../service/user.service')
const { userFormateError, userAlreadyExited } = require('../constant/err.type')

const userValidator = async (ctx, next) => {
  const { user_name, password } = ctx.request.body
  // 1 错误处理 密码或者账号为空【合法性】
  if (!user_name || !password) {
    console.error('用户名或者密码为空')
    ctx.status = 400
    // 触发错误处理
    ctx.app.emit('error', userFormateError, ctx)
    return
  }
  // 执行下一个中间件【如果账号和密码都不为空】
  await next()
}
// 1 错误处理 用户名已经存在【合理性】
// 返回的是一个promise对象 如果没有用await接受 一个{} if语句判断一定是true
// console.log(getUserInfo({ user_name }))
const verifyUser = async (ctx, next) => {
  const { user_name } = ctx.request.body
  const res = await getUserInfo({ user_name })
  //   console.log(res)
  //   const res2 = await res
  //   console.log(res2)
  console.log(res)
  if (res) {
    ctx.app.emit('error', userAlreadyExited, ctx)
    return
  }
  // 【如果用户名没有重复的话】
  await next()
}
module.exports = {
  userValidator,
  verifyUser,
}

```



## 2 统一的错误处理

`constant/err.type.js`文件里面 错误类型可以通用

```js
module.exports = {
  userFormateError: {
    code: '10001',
    messag: '用户名或者密码为空',
    result: '',
  },
  userAlreadyExited: {
    code: '10002',
    message: '用户已经存在',
    result: '',
  },
}

```



```js
这句是触发错误日志
/*
error - 表示事件的类型
userFormateError - 表示返回的错误信息
ctx - 全局执行上下文
*/
ctx.app.emit('error', userFormateError, ctx)
```



通过ctx能够访问到app变量，app变量上面有emit方法



## 3 错误处理的函数

userFormateError来自`constant/err.type.js`

```js
module.exports = {
  userFormateError: {
    code: '10001',
    messag: '用户名或者密码为空',
    result: '',
  },
  userAlreadyExited: {
    code: '10002',
    message: '用户已经存在',
    result: '',
  },
}
```



code  => `app/index.js`

```js
app.on('error', errhandler)
```



errhandler方法来自`err.handle.js`

```js
module.exports = (err, ctx) => {
  // 根据err错误信息里面的code的值 决定 status应该是多少 赋值给ctx的status以及body
  // 默认status是400
  let status = 500
  switch (err.code) {
    case '10001':
      status = 400
      break
    case '10002':
      status = 409
    default:
      status = 500
  }
  ctx.status = status
  ctx.body = err
}

```





## 4 完善1 

`user/middleware.js`

```diff
const verifyUser = async (ctx, next) => {
  const { user_name } = ctx.request.body
+  const res = await getUserInfo({ user_name })
  if (res) {
    ctx.app.emit('error', userAlreadyExited, ctx)
    return
  }
  // 【如果用户名没有重复的话】
  await next()
}
```



`service/user.service.js`

async修饰的函数 返回的一定是一个promise对象 因此上面一定用await去接受 不然获取到的一定是一个promise对象，就一定有值，if永远是一个true

```diff
+  async getUserInfo({ id, user_name, password, is_admin }) {
    const whereOpt = {}
    // ES6简写 {id}
    id && Object.assign(whereOpt, { id })
    user_name && Object.assign(whereOpt, { user_name })
    password && Object.assign(whereOpt, { password })
    is_admin && Object.assign(whereOpt, { is_admin })
    const res = await User.findOne({
      attributes: ['id', 'user_name', 'password', 'is_admin'],
      where: whereOpt,
    })
    return res ? res.dataValues : null
  }
}
```





>一个中间件的功能走通以后，可以去next()的地方去测试，是否是这个中间件出的问题





## 5 完善2

创建用户时，不管是服务器内部错误，还是我们代码写错了 用try / catch都可以捕获到

`user.controller.js`

```js
try {
      // 1 验证合法性 前面的中间件会操作
      // 2 操作数据库
      const res = await createUser(user_name, password)
      // 3 返回结果
      // ctx.body = res
      ctx.body = {
        code: 0,
        message: '用户注册成功',
        result: {
          id: res.id,
          user_name: res.user_name,
        },
      }
    } catch (error) {
      console.error('注册错误', ctx.request.body)
      ctx.app.emit('error', userRegisterError, ctx)
    }
```

`user.service.js`

```js
class UserService {
  async createUser(user_name, password) {
    // ES6简写
    try {
      const res = await User.create({
        user_name,
        password,
      })
      return res.dataValues
    } catch (error) {
      console.error('用户注册错误')
      ctx.app.emit('error', userRegisterError, ctx)
    }
```



中间件 如果出错 千万记得return

`user.middleware.js`

```diff
  try {
    const res = await getUserInfo({ user_name })
    if (res) {
      ctx.app.emit('error', userAlreadyExited, ctx)
      return
    }
  } catch (error) {
    console.error('获取用户信息错误', error)
    ctx.app.emit('error', userRegisterError, ctx)
+    return
  }
```





启发：

>一定要有意识的培养自己去思考，什么时候 我要返回一个`友好的提示信息`，什么时候要去捕获`错误的信息`



# 12. 密码加密

`middleware/user.middleware.js`

```js
// 3 密码加密中间件
const crpytPassword = async (ctx, next) => {
  const { password } = ctx.request.body
  const saltRounds = 10
  // abc => 用户的密码
  // 123abc=> 123是额外的数字
  // salt就是生成salt
  // hash就是对123abc进行二次加密
  // 这样的流程还会再次拼接一次
  
  // 产生随机数
  const salt = bcryptjs.genSaltSync(saltRounds) 
  // 随机数和原来的密码加密[加密两次]
  const hash = bcryptjs.hashSync(password, salt)
  // 传递给服务器的密码就是hash值
  // 后续查找 也会进行加密 再比对
  ctx.request.body.password = hash
  // 走next 上面的赋值 存到服务器
  await next()
}
```



>为什么密码要放到中间件里面去?
>
>​	后面如果要用其他的加密方式，可以直接更换，而不是和register接口耦合在一起。耦合性，就是模块和模块之间的差别要打。
>
>​    很多地方用到加密方式。直接更改一个中间件，而不是很多地方。

# 13. 登录接口的完善



```diff
const verifyLogin = async (ctx, next) => {
  try {
    // 从用户提交的对象里提取用户名和密码
    const { user_name, password } = ctx.request.body
    // 判断用户名是否存在 不存在 提示错误信息(错误日志+提示用户)
    const res = await getUserInfo({ user_name })
    // 用户不存在判断 res => null
+    if (!res) {
      console.error(user_name, '用户不存在')
      ctx.app.emit('error', userDoesNotExist, ctx)
+      return
    }
+    // 判断用户提交的密码和服务器查到的密码是否一致 如果不一致 提示错误信息
    // hash -> 来自数据库
+    if (!bcryptjs.compareSync(password, res.password)) {
      console.error('用户输入的密码错误，请重试')
+      return ctx.app.emit('error', invalidPassword, ctx)
    }
  } catch (err) {
    console.error(err)
    ctx.app.emit('error', userLoginError, ctx)
+    return
  }
+  await next()
}
```



```js
if (!bcryptjs.compareSync(password, res.password)) {
```

bcryptjs.compareSync 方法，比较数据库的hash密码和用户输入的密码是否一致

password -> 用户输入的密码

res.password -> 服务器查询返回的密码



这段逻辑要写在try catch里面 因为res变量在try里面获取 记得块级作用域





注意：

1. 上面标绿色的地方 要return 且中间件必须await next() 不然走不通。下面，直接return空或者return 错误 都没关系

```diff
 // 用户不存在判断 res => null
    if (!res) {
      console.error(user_name, '用户不存在')
      ctx.app.emit('error', userDoesNotExist, ctx)
+      return
    }
    // 判断用户提交的密码和服务器查到的密码是否一致 如果不一致 提示错误信息
    // hash -> 来自数据库
    if (!bcryptjs.compareSync(password, res.password)) {
      console.error('用户输入的密码错误，请重试')
+      return ctx.app.emit('error', invalidPassword, ctx)
    }
```



2. console.error()到底什么作用 可以深究一下
3. 用户名不存在，!res 进入if分支；用户名存在 res进入if分支 ；注意区分







# 14. 登录验证

## 1 颁发token

目标：用户输入账号和密码登录 给用户颁发一个令牌，后续的操作都需要携带这个令牌才能进入

1 下包 jsonwebtoken

2  在verifyLogin 能够判断是否存在用户，如果不存在就不会走到login中间件里面去

​    解构出密码，密码这个信息不要，`小技巧`掌握好

3 返回的信息里面 使用jwt.sign方法

   声明一个密钥，一起放到sign方法里面，

   jwt里面要记录信息，和密钥,以及{expiresIn: '1d'} 表示1天的意思 

   `技巧`引入的包，调用方法时，鼠标经过，会提示里面的参数	





```diff
async login(ctx, next) {
    const { user_name } = ctx.request.body

    // 获取用户信息 在token的payload中 记录 id user_name is_admin
    try {
      // 疑惑
      // 从返回结果中 剔除password属性，剩下属性放到res
      // 解构小技巧
+      const { password, ...res } = await getUserInfo({ user_name })
      ctx.body = {
        code: '0',
        message: '用户登录成功',
        // jwt.sign
        /*
        res表示记录的用户信息【id, 用户名，is_admin】 不包括密码
        JWT_SECRET - 在.env里面声明的环境变量 密钥
        expiresIn - 有效期是1天
        */
        result: {
+          token: jwt.sign(res, JWT_SECRET, {
            expiresIn: '1d',
          }),
        },
      }
    } catch (error) {
      console.log('用户登录失败', error)
    }
  }
```



## 2 用户认证

1 创建用户中间件

2 使用`jwt.verify`方法进行验证。

学会模拟token失效和错误的测试

```diff
/*
1 authorization 应该首字母是小写的原来是大写
2 jwt.verify 方法拼错了
*/
const auth = async (ctx, next) => {
  console.log(ctx.request.header)
  try {
    const { authorization } = ctx.request.header
    const token = authorization.replace('Bearer ', '')
+    const user = jwt.verify(token, JWT_SECRET)
    ctx.state.user = user
  } catch (err) {
    switch (err.name) {
      case 'TokenExpiredError':
        console.error('token已经过期', err)
        return ctx.app.emit('error', TokenExpiredError, ctx)
      case 'JsonWebTokenError':
        console.error('token已经过期', err)
        return ctx.app.emit('error', invalidToken, ctx)
    }
    return
  }
  await next()
}
```





`排错`

```diff
// postman 先返回NetWork -> 但是已经使用了中间件
// 后来返回not Found

const auth = async (ctx, next) => {
  console.log(ctx.request.header)
  try {
  // 这两句代码 原来写在了try的上面 但是捕获不到错误
  // 写在了try的里面 捕获的到错误 但是catch(err) {里面没有直接打印err 而是在switch里面打印 导致了不符合case的情况 就没有打印错误}
+    const { authorization } = ctx.request.header
+    const token = authorization.replace('Bearer ', '')
    const user = jwt.verify(token, JWT_SECRET)
    ctx.state.user = user
  } catch (err) {
    switch (err.name) {
      case 'TokenExpiredError':
        console.error('token已经过期', err)
```



`postman`

高级技巧：

1 Test里面点击

```js
Status code: Code is 200

// pm-postman
pm.test("Successful POST request", function () {
    // 以json格式返回响应体的数据
    const res = pm.response.json()
    // 设置全局的变量集合
    pm.collectionVariables.set("token", res.result.token);
});
```



2 点击整体的项目

![image-20220724194506682](D:/heima/front/6%20nodejs%E7%9A%84%E5%AD%A6%E4%B9%A0/koa+nodejs/project/2%20body%20sequelize%20User%E6%A8%A1%E5%9E%8B.assets/image-20220724194506682.png)





# 15. 修改密码

0 user.router.js里面写auth【验证token】 密码加密 然后修改密码 => 需要新增 “修改密码的中间件”

1 service 更新数据库的方法update

```diff
/*
调用`User.update`方法，
whereOpt是查询条件，
newUser是新修改后的值
返回的值[0]或者 [1] 表示是否修改成功数据
*/
async updateById({ id, user_name, password, is_admin }) {
    const whereOpt = { id }
    const newUser = {}
    /* 
      Object.assign() 而不是 Object.create() 目的是为了拷贝对象 而不是创建对象
    */
    user_name && Object.assign(newUser, { user_name })
    password && Object.assign(newUser, { password })
    is_admin && Object.assign(newUser, { is_admin })

    // 不懂
+    const res = await User.update(newUser, {
      where: whereOpt,
    })
    return res[0] > 0 ? true : false
  }
```





先 获取不到密码 打印ctx里面也没有



注意：

1 密码加密 获取不到密码 打印ctx里面也没有

>如何排错？
>
>1 知道A注册接口使用一个中间件ok B修改密码不ok =》中间件的逻辑没问题
>
>2 传递参数有问题 => 传的是text不是json





> 
>
> 抽离
>
> 1 如果一个中间件 使用次数超过2次，就要封装





# 16. 批量导入路由

## 1 正常路由的操作

goods.router.js

```js
/* 
思考 route.js文件怎么写
0 导入koa-router组件 -》要写路由
1 需要挂载前缀
2 需要导出实例

*/

const Router = require('koa-router')

const router = new Router({
  prefix: '/goods',
})

module.exports = router

```

app.js里面

```diff
const Koa = require('koa')
const KodBody = require('koa-body')
// 服务器实例
const app = new Koa()
// 路由实例
+const Userouter = require('../router/user.route.js')
+const Goodsrouter = require('../router/good.route.js')
const errhandler = require('./errHandler')

// 注册中间件 一定在路由之前使用 能够获取请求体的数据的中间件 [文件上传 ……很多功能]
app.use(KodBody())
+app.use(Userouter.routes())
+app.use(Goodsrouter.routes())
```

这样每次都要导入新的 app.use()里面又只能写一个函数 这样很麻烦



## 2 批量注册路由

router/index.js



fs模块的`readdirSync`方法 里面参数带上 __dirname 能够获取到当前文件下面的所有文件名，遍历他，只要不是index.js 就进行拼接

最终`router.use(r.routes())`进行注册

app/index.js里面统一注册

```diff
+const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')

const router = new Router()

+fs.readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js') {
    const r = require('./' + file)
    // console.log('r是' + r)
    // console.log(r.routes)
    router.use(r.routes())
  }
})

module.exports = router

```

/app/index.js

```diff
const Koa = require('koa')
const KodBody = require('koa-body')
// 服务器实例
const app = new Koa()
// 路由实例
+const router = require('../router/index')
const errhandler = require('./errHandler')

// 注册中间件 一定在路由之前使用 能够获取请求体的数据的中间件 [文件上传 ……很多功能]
app.use(KodBody())
+app.use(router.routes())
```

