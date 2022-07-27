# 1 初始化项目

## 1.1 npm初始化

```js
npm init -y
```

生成`package.json`文件:





## 1.2 初始化git 仓库

```js
git init
```

创建gitignore文件 不提交node_modules文件



## 1.3 创建README文件





# 2 创建app环境

```js
const Koa = require('koa') // 引入koa

const app = new Koa() // 创建app实例

app.use((ctx, next) => { // 使用自身携带的一个中间件?
  ctx.body = 'hello world'
})

app.listen(3000, () => { // 开启服务器
  console.log('tha server is running on http://localhost:3000')
})
```

>缺陷，每次更新 都要重新启动服务器





# 3 优化项目

## 3.1  自动重启服务器

下包 `nodemon`

```
yarn add nodemon
```

修改`package.json`

```diff
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
+    "dev": "nodemon ./src/main.js"
  },
```



## 3.2 环境变量的修改

下包`dotenv`



创建 `.env文件 `

注意路径在项目的根目录下，不是在src下面



创建文件 `./src/config/config.default.js`

```js
const dotenv = require('dotenv')

// 使用dotenv的方法 导入所有的环境变量
dotenv.config()
console.log(process.env)

// 导出环境变量
module.exports = process.env
```



修改`main.js`文件

```diff
const Koa = require('koa')

const app = new Koa()

app.use((ctx, next) => {
  ctx.body = 'hello api'
})

+const { APP_PORT } = require('./config/config.default')
+app.listen(APP_PORT, () => {
+  console.log(`tha server is running on http://localhost:${APP_PORT}`)
})

```





# 小结：

疑问：

1 koa是一个什么样的框架

2 创建app服务到底是为了干啥

3 app.use((ctx,next)) => {}

ctx这个参数是干啥用的呢





# 4. 路由配置

## 1 安装koa-router

```js
npm i koa-router
```

## 2. 创建文件

`src/router/user.router.js`

```js
// 引入包
const Router = require('koa-router')
// 设置统一的前缀 user
const router = new Router({
  prefix: '/user',
})
// get方法 返回内容
router.get('/', (ctx, next) => {
  ctx.body = 'hello users'
})
module.exports = router
```



## 3. main.js引入

注意，app.use() 注册中间件 里面必须是一个函数

```diff
const Koa = require('koa')

// 服务器实例
const app = new Koa()
// 引入 路由实例
+const userRouter = require('./router/user.router')
// 环境变量 服务器端口
const { APP_PORT } = require('./config/config.default')

// app.use((ctx, next) => {
//   ctx.body = 'hello api'
// })
// 注册路由
+app.use(userRouter.routes())

app.listen(APP_PORT, () => {
  console.log(`tha server is running on http://localhost:${APP_PORT}`)
})

```



# 5. 目录结构优化

## 1 将app服务和http服务拆开来看

`src/app/index.js`

和koa/koa-router有关的代码放到app/index.js文件，最终导出app实例给到main.js，让main.js文件只启动服务器。为的是下回假如换个框架express，直接改app里面的index文件就好饿

```js
const Koa = require('koa')

// 服务器实例
const app = new Koa()
// 路由实例
const userRouter = require('../router/user.router')
app.use(userRouter.routes())

module.exports = app
```



`main.js`

```js
// 环境变量 服务器端口
const { APP_PORT } = require('./config/config.default')

const app = require('./app')

app.listen(APP_PORT, () => {
  console.log(`tha server is running on http://localhost:${APP_PORT}`)
})

```



## 2 将路由和控制器分开来

`src/controller/controller.js`

控制器 做不同的业务，返回具体的信息

```js
// 用户类
class UserController {
  async register(ctx, next) {
    ctx.body = '用户注册成功'
  }
  async login(ctx, next) {
    ctx.body = '用户登录成功'
  }
}
// 导出这个类
module.exports = new UserController()
```



`router/user.route.js`

不同的url的业务，分配给控制器处理。router.post('/login', login) 这个login从控制器里面导入进来，

```diff
const Router = require('koa-router')
+const { login, register } = require('../controller/user.controller')
const router = new Router({
  prefix: '/user',
})
router.get('/', (ctx, next) => {
  ctx.body = 'hello users'
})
// 注册
// localhost:8000/user/login => 用户注册成功
+router.post('/login', login)
// 登录
// localhost:8000/user/login => 用户登录成功
+router.post('/register', register)

module.exports = router

```





# 6 解析body

## 1 安装`koa-body`

## 2 注册中间件

改写app/index.js

```diff
const Koa = require('koa')
+const KodBody = require('koa-body')
// 服务器实例
const app = new Koa()
// 路由实例
const userRouter = require('../router/user.route')

// 注册中间件 一定在路由之前使用 能够获取请求体的数据的中间件 [文件上传 ……很多功能]
+app.use(KodBody())
app.use(userRouter.routes())

module.exports = app
```



## 3 service层书写与拆分

service主要是做数据库处理

```js
class UserService {
  async createUser(user_name, password) {
    return '写入数据库成功'
  }
}

module.exports = UserService

```



## 4 解析请求的数据

```
获取数据
操作数据库
返回结果
是数据库操作的三大步骤
```



```diff
+const { createUser } = require('../service/user.service')

class UserController {
  async register(ctx, next) {
    // 1. 获取数据
    // console.log(ctx.request.body)
+    const { user_name, password } = ctx.request.body
    // 2. 操作数据库
+    const res = await createUser(user_name, password)
    // console.log(res)
    // 3. 返回结果
+    ctx.body = ctx.request.body
  }

  async login(ctx, next) {
    ctx.body = '登录成功'
  }
}

module.exports = new UserController()
```



# 小结：

1 先是拆开了路由和main.js

2 再拆开了app和main.js的http服务

3 再将路由和控制器拆开 控制器完成具体的业务

4 再将service层拎出来 做数据库的操作

当service里面封装的函数在controller里面使用，调用接口`{{baseURL}}/user/register`能够await返回数据时，这里的逻辑走通了



5 koa-body的很强大 npm的文档值得查看

6 postman测试register数据的时候 使用Body/里面的raw选项

7 包安装在全局，下一个同事用，么有这个包就完蛋了。安装在生产环境，表示开发环境不需要使用





# 7 集成sequelize

## 1 编写配置文件

`src/cofig/config.defaut.js`

```js
// ----------------
MYSQL_HOST = localhost
MYSQL_PORT = 3306
MYSQL_USER = root
MYSQL_PWD = 123456
MYSQL_DB = zdsc
```



## 2 安装seq 连接数据库

```js
npm i mysql2 sequelize
```

```js
const { Sequelize } = require('sequelize')

const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PWD,
  MYSQL_DB,
} = require('../src/config/config.default')

// 先写固定的值 测试一下是否能够测试成功
const seq = new Sequelize('zdsc', 'root', 'root', {
  host: MYSQL_HOST,
  dialect: 'mysql',
})

seq
  .authenticate()
  .then(() => {
    console.log('数据库连接成功')
  })
  .catch(() => {
    console.log('数据库连接失败', err)
  })

module.exports = seq
```



>
>
>tips:
>
>1 dialect: 'mysql', mysql写成mysqls也会报错
>
>2 数据库的密码 phpStudy这里修改 是假的，如果输入密码就退出终端，说明修改失败。原来的密码和用户名是一致的都是root
>
>3 测试连接，如果报错denied，用户名/密码/端口/地址逐一排查
>
>4 搜索技巧：百度sequelize.js -> 官网 -> 右上角有github.com



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

![image-20210524154353520](http://image.brojie.cn/image-20210524154353520.png)

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

![image-20220724194506682](D:/heima/front/6%20nodejs%E7%9A%84%E5%AD%A6%E4%B9%A0/koa+nodejs/project/README.assets/image-20220724194506682.png)





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



# 17. 更新商品

## 1 是否有管理员权限

goods.route.js

```js
// 新增 hadAdminPermission
router.post('/upload', auth, hadAdminPermission, (ctx, next) => {
  ctx.body = '111'
})
```



auth.middleware.js

```diff
const hadAdminPermission = async (ctx, next) => {
+  const { is_admin } = ctx.state.user.is_admin 
// 仔细看 上面的右边 is_admin去掉
  if (!is_admin) {
    console.error('该用户没有管理员权限')
    ctx.app.emit('error', hasNotAdminPermission, ctx)
  }
+  await next()
}
```

最终没有await next() 打印还是`该用户没有管理员权限`





# 18. upload上传商品功能



app/index.js

```js
app.use(
  KodBody({
    formidable: {
      // 解析多种类型的请求体
      multipart: true,
      // 设置文件上传的路径
      // \heima\front\6 nodejs的学习\koa+nodejs\project\upload
      uploadDir: path.join(__dirname, '../upload'),
    },
  })
)
```





path的模块使用
```js
console.log(__dirname)
console.log('11' + path.join(__dirname, '../upload'))

// D:\heima\front\6 nodejs的学习\koa+nodejs\project\src
// 11D:\heima\front\6 nodejs的学习\koa+nodejs\project\upload
```





从goods.controller.js里面打印不到ctx.requres.files的数据。原因是koa-body的属性设置错误

```js
app.use(
  KodBody({
    multipart: true,
    formidable: {
      // \heima\front\6 nodejs的学习\koa+nodejs\project\upload
      // uploadDir值如果直接是路径 会从process.cwd()里面进行
      // process.cwd()项目的根目录
      uploadDir: path.join(__dirname, '../upload'),
      keepExtensions: true,
    },
  })
)
```





判断文件类型

```js
    const fileList = ['image/jpeg', 'image/png', 'image/jpg']
    // 判断是否有文件
    if (file) {
      // 判断文件的类型是否正确 不正确 报错
      if (!fileList.includes(file.mimetype)) {
        console.error('文件的类型不正确')
        return app.ctx.emit('error', unSupportedFileType, ctx)
      }
```





koa-static 能够通过服务器地址访问到图片

为何返回的信息里面 用了path.basename(file.path)没有报错 返回的信息就是失败的

```diff
class GoodsController {
  async upload(ctx, next) {
    // 获取文件的数据
    const { file } = ctx.request.files
    // 这里的file 和 postman里面的key对应
    // 声明可以有的文件类型
    const fileList = ['image/jpeg', 'image/png', 'image/jpg']
    // 判断是否有文件
    if (file) {
      // 判断文件的类型是否正确 不正确 报错
      // if (!fileList.includes(file.mimetype)) {
      //   console.error('文件的类型不正确')
      //   return app.ctx.emit('error', unSupportedFileType, ctx)
      // }
      // 返回信息
      ctx.body = {
        code: 0,
        message: '商品图片上传成功',
        result: {
        // 定位到了这句代码 但是没有发现错误
        // path.basename(file.filepath) 这个替换为1.jpg就ok了 说明这里有问题
        // path.basename不可能出现问题 -> 原来写的是file.path 后来打印了file发现里面只有file.filepath 没有 file.filepath 就知道问题了
+          goods_img: path.basename(file.filepath),
        },
      }
```



app/index.js

```diff
1 const KoaStatic = require('koa-static')
2 app.use(KoaStatic(path.join(__dirname, '../upload')))
```





用/index.html模拟表单上传图片

```js
<form action="http://localhost:8000/goods/upload" method="post" enctype="multipart/form-data">
    <input type="file" name="file" id="">
    <input type="submit" value="点击提交">
</form>
```

action - 接口地址

method

enctype跟multipart/form-data

input用file类型 name的file要和后端约定



# 额外. err.type.js与errHandler关系

err.type.js文件封装很多错误类型的值

如果某个地方报错，需要错误类型，就引用err.type.js这个文件里面的值

```js
return ctx.app.emit('error', unSupportedFileType, ctx)
```

注意ctx里面既有请求体也有响应体，去koa的官网上可以看到

上面监听error事件 需要在app/index.js里面统一回应处理错误，意思是每个错误，在app/index.js里面都能够被监听到

```js
// 统一处理 错误信息
app.on('error', errhandler)
```

交给errhandler.js文件来统一处理

这个文件根据code值 决定status的值 同时能够返回错误信息ctx.body  = err

```diff
module.exports = (err, ctx) => {
  // 默认status是400
  // 根据err错误信息里面的code的值 决定 status应该是多少 赋值给ctx的status以及body
  // 挂到app上
  let status = 500
+  switch (err.code) {
    // 10001 用户名或者密码为空
    case '10001':
      status = 401
      break
    case '10002':
      status = 409
      break
    case '10202':
      status = 401
      break
    default:
      status = 500
  }
  ctx.status = status
  ctx.body = err
  console.error(err)
}

```

那么status的值 一般是干什么用的?



# 19.统一的参数校验[创建商品用 其它也能够用]

在`app/index.js`里面引入koa-parameter,

同时挂载到app里面，

在路由注册之前

```diff
const parameter = require('koa-parameter')
app.use(parameter(app))
```

这样，ctx上面会挂载`verifyParams`()方法，这个方法能够校验 

创建一个中间件，里面使用上面方法

`middleware/goods.middleware.js`

```diff
const goodsFormatError = require('../config/config.default')
const validator = async (ctx, next) => {
  try {
   // 传入对象 每个参数 对应一个对象 
    ctx.verifyParams({
      goods_name: { type: 'string', require: true },
      goods_price: { type: 'number', require: true },
      goods_num: { type: 'number', require: true },
      goods_img: { type: 'string', require: true },
    })
  } catch (error) {
    // 赋值 更加精准的定位到是哪个参数出错了
+   goodsFormatError.result = error
    console.error('商品格式错误')
    return ctx.app.emit('error', goodsFormatError, ctx)
  }
  await next()
}

module.exports = {
  validator,
}
```





# 20. 创建商品接口完成

先把逻辑走一遍 走通

`goods.controller.js`

```js
async create(ctx, next) {
    try {
      const goods = ctx.request.body
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
```

`goods.service.js`

```js
class GoodsService {
  async createGoods(goods) {
    return goods
  }
}
```

发现ok

需要数据库模型，创建数据库

```js
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

```

>   DECIMAL(10, 2) 2位小数 8位整数 精度非常的高
>
>   DOUBLE和FLOAT都是近似存储 精度不高s





```diff
class GoodsService {
  async createGoods(goods) {
+    const res = await Goods.create(goods)
    console.log('service', res)
    return res.dataValues
  }
}
```

使用数据库的create方法 创建一个商品进去拿到`res.dataValues`



`goods.controller.js`

```diff
+     const { updatedAt, createdAt, ...res } = await Goods.createGoods(goods)
      if (res) {
        ctx.body = {
          code: 0,
          messgae: '发布商品成功',
          result: res,
        }
```

能够把 ·updatedAt, createdAt· 单独拎出去





# 21. 更新接口 同样的逻辑

## good.route.js文件

```js
// 更新商品
router.put('/update/:id', auth, hadAdminPermission, validator, update)
```



service 简单写一遍 和controller 先打通逻辑



## 出错的地方

put写成了post

id的拼接也写错了 

>/update/:id

postman传参直接/1就可以了



>Missing where attribute in the options parameter

where查询条件出错



>Error: Unknown column 'deletedAt' in 'where clause'

根据提示信息 多了一个 `deletedAt`这个查询条件，这个查询条件思考哪里来的，是数据库的字段吗？

是的，何时生成的？创建数据表的时候，增加了一个`  paranoid: true,`字段的时候生成的，这个是为了`软删除`



解决方式是，通过解开注释`Goods.sync`重新生成一个数据库的表，然后创建成功，观察有`deleteAt`字段后，再注释这句话

再去修改信息 更新商品 就成功了



## 整体代码

`goods.controller.js`

```js
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
      }
    } catch (error) {
      console.error('更新商品失败', error)
      ctx.app.emit('error', invalidGoodsID, ctx)
    }
  }
```

`goods.service.js`

```diff
 async updateGoods(id, goods) {
    try {
      const newObj = {}
      const whereOpt = { id }
      const { goods_name, goods_price, goods_num, goods_img } = goods
      goods_name && Object.assign(newObj, { goods_name })
      goods_price && Object.assign(newObj, { goods_price })
      goods_num && Object.assign(newObj, { goods_num })
      goods_img && Object.assign(newObj, { goods_img })
+      const res = await Goods.update(newObj, {
        where: whereOpt,
      })
      return res[0] > 0 ? true : false
    } catch (error) {
      return console.error('数据库 更新商品失败', error)
    }
  }
```



## 找不到id也要返回

```js
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
```







# 23. 删除商品

分为硬删除和软删除

ps: delete是关键字，不能用作方法名，这里排查了很久

## 硬删除测试

必须注释`model/goods.model.js`

```js
{
    // 硬删除：直接删除记录
    // 软删除：增加一个标识“is_delete”表示这个记录被删除了，但实际上并没有要删除
    // paranoid -> 表示要硬删除
    paranoid: true,
}
```



route

```js
router.delete('/delete/:id', auth, hadAdminPermission, remove)
```



postman测试用delete方法

```js
{{baseURL}}/goods/delete/1
```

尽管数据库里面的表格还有`deleteAt`字段 但是不会自动设置了



控制器

```js
async remove(ctx) {
    console.log(ctx.params.id)
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
```



service

`用destroy方法`

```js
  // 删除商品 硬
  async removeGoods(id) {
    const whereOpt = { id }
    try {
      const res = await Goods.destroy({
        where: whereOpt,
      })
      return res > 0 ? true : false
    } catch (error) {
      console.error('数据库操作失败', error)
    }
  }
```



## `软删除`商品下架

仅仅修改deleteAt字段里面的值

解开model文件的注释



和硬删除比较 代码变化

route路由

```js
router.post('/:id/off', auth, hadAdminPermission, remove)
```

postman测试也要变化 -> post请求

```js
{{baseURL}}/goods/1/off
```

数据表里面的 deleteAt字段会有值

再次删除同样的商品id 会返回无效的商品id的信息





## 商品恢复

route

```js
// 上架商品
router.post('/:id/on', auth, hadAdminPermission, restore)
```

controller

```js
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
        ctx.app.emit('error', invalidGoodsID, ctx)
      }
    } catch (error) {
      console.error('上架商品失败', error)
    }
  }
```



service

用`restore方法`

```js
 // 删除商品(软)
  async restoreGoods(id) {
    const whereOpt = { id }

    const res = await Goods.restore({
      where: whereOpt,
    })
    console.log(res)
    return res > 0 ? true : false
  }
```







# 24. 商品列表接口

`find`

路由

```diff
router.get('/', findAll)
```

controller

```js
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
```



service

pageSize * 1能够把这个参数转化为整数 ps：如果默认转化为字符串的话



`findAndCountAll`能够即获得数据和count 的数量

```diff
async findAllGoods({ pageSize, pageNum }) {
    try {
      const offset = (pageNum - 1) * pageSize
      const { count, rows } = await Goods.findAndCountAll({
        // 为什么要 * 1
        limit: pageSize * 1,
        offset: offset,
      })
+      return {
+       // 返回的参数 来自接口文档
        list: rows,
        total: count,
        pageSize,
        pageNum,
      }
    } catch (error) {
      console.error('商品查询失败', error)
    }
}
```



也可以同时用这两个方法

```diff
// const { count, rows } = await Goods.findAndCountAll({
      //   // 为什么要 * 1
      //   limit: pageSize * 1,
      //   offset: offset,
      // })
+      const count = await Goods.count() // 获得数量
+      const rows = await Goods.findAll({ // 获得总的数据
        limit: pageSize * 1,
        offset: offset,
      })
```





sql语句出错:

```js
sql: 'SELECT `id`, `goods_name`, `goods_price`, `goods_num`, `goods_img`, `createdAt`, `updatedAt`, `deletedAt` FROM `zd_goods` AS `zd_goods` WHERE (`zd_goods`.`deletedAt` IS NULL) LIMIT NaN, NaN;',
parameters: undefined
```

由 LIMIT NaN, NaN -> 推断 limit出错 -> pageSize传递进来的参数出错 -》检查传参 发现传递进来的是一个对象 ，但是用了两个形参















# 犯过的错误

## 1. 返回的信息是一大串不明地址

```js
const parameter = require('koa-parameter')
```

koa应该小写 拼成了大写



```diff
  try {
+    ctx.verifyParams({
      goods_name: { type: 'string', require: true },
      goods_price: { type: 'number', require: true },
      goods_num: { type: 'number', require: true },
      goods_img: { type: 'string', require: true },
    })
```

verifyParams拼错了





```diff
const { goodsFormatError } = require('../constant/err.type')
```

goodsFormatError没有加{}按需引入

require的地址错的，原本从config里面引入了





## 2. 创建数据库时出错

Number报出错误

```diff
const Goods = seq.define('zd_goods', {
  goods_name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '商品名, 唯一',
  },
  goods_price: {
+    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '价格',
  },
  goods_num: {
+    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '商品数量',
  },
```

sequelize的数字类型用INTEGER而不是用NUMBER





## 3. service层出的错误

控制层出错

```diff
async update(ctx) {
    try {
    // 写成 ctx.request.params.id
+      const id = ctx.params.id
      const body = ctx.request.body

      const res = await Goods.updateGoods(id, body)
      if (res) {
        ctx.body = {
          code: 0,
          message: '更新商品成功',
          result: res,
        }
      }
    } catch (error) {
      console.error('更新商品失败', error)
      ctx.app.emit('error', invalidGoodsID, ctx)
    }
  }
```

数据库查询操作出错

```diff
async updateGoods(id, goods) {
    try {
      const newObj = {}
      const whereOpt = { id }
      console.log(id)
      const { goods_name, goods_price, goods_num, goods_img } = goods
      // 2 写成了 Object.assign(newObj, goods_name )丢失了括号
+      goods_name && Object.assign(newObj, { goods_name })
      goods_price && Object.assign(newObj, { goods_price })
      goods_num && Object.assign(newObj, { goods_num })
      goods_img && Object.assign(newObj, { goods_img })
      // 1 写成 where: {whereOpt} 嵌套了两层
+      const res = await Goods.update(newObj, {
        where: whereOpt,
      })
      console.log(res)
      return res[0] > 0 ? true : false
    } catch (error) {
      return console.error('数据库 更新商品失败', error)
    }
  }
```

接口route写错

/update/:id

```diff
// 更新商品
router.post('/update/:id', (ctx, next) => {
  ctx.body = '111'
})
```

postman

直接后面跟1

```diff
{{baseURL}}/goods/update/1
```

