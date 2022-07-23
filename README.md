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
