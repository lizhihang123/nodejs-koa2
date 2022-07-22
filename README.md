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

