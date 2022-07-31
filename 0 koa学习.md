# 1. 什么是Koa

轻量级【没有挂载任何中间件】

web框架

服务于`web应用和api开发`，更加优雅 编写服务端的应用程序



koa四部曲

```js
// 一. 导入koa
const Koa = require('koa')
// 二. 实例化对象
const app = new Koa()
// 三. 编写中间件
app.use((ctx) => {
  ctx.body = 'hello Koa2'
})
// 四. 启动服务
app.listen(3000, () => {
  console.log('server is running on http://localhost:3000')
})
```

>ctx就是请求上下文，
>
>ctx.body = '1111' 返回给客户端信息
>
>ctx.state.user = ''用来传递存储信息
>
>ctx.response 返回响应信息
>
>ctx.request 返回请求信息





注意：

1. app.use()返回的是this本身，所以能够链式调用 app.use().use()
2. app.use()里面只能够接受一个函数
3. npx nodemon -v 的工作原理。先看node_modules里面有没有这个包，没有 再去全局找，再没有 就去安装最新的版本

# 2. Koa中间件

就是函数

介于`请求和响应之间`的函数

为什么要拆分？拆分后，每个中间件的功能更加单一。为了复用

```js
类似流水线工人
一个人做一个产品的一部分，再交给下一个工人。
```









# 3. Koa洋葱圈模型的概念

```js
// 1. 导入koa包
const Koa = require('koa')
// 2. 实例化对象
const app = new Koa()
// 3. 编写中间件
app.use((ctx, next) => {
  console.log(1)
  next()
  console.log(2)
  console.log('---------------')
  ctx.body = 'hello world'
})

app.use((ctx, next) => {
  console.log(3)
  next()
  console.log(4)
})

app.use((ctx)=>{
  console.log(5)
})
// 4. 监听端口, 启动服务
app.listen(3000)
console.log('server is running on http://localhost:3000')
```

打印 1 3 5 4 2 

中间件1 执行 -》碰到next -》执行下一个中间件2 -》碰到next -》执行下一个中间件3 -》中间件3执行好了 -》回到中间件2 -》回到中间件1



就像上面那样，从洋葱外部进入到洋葱里面，再从洋葱里面出来，就是洋葱圈模型





# 4. Koa能够处理异步的请求



```js
// 1. 导入koa包
const Koa = require('koa')
// 2. 实例化对象
const app = new Koa()
// 3. 编写中间件
app.use((ctx, next) => {
  ctx.message = 'aa'
  next()
  ctx.body = ctx.message
})

app.use((ctx, next) => {
  ctx.message += 'bb'
  next()
  console.log(4)
})

app.use((ctx)=>{
  const res = new Promise((resolve, reject) => {
      resolve('cc')
  })
  ctx.message =+res
})
// 4. 监听端口, 启动服务
app.listen(3000)
console.log('server is running on http://localhost:3000')
```



>ctx.body 输出后，没有包含promise对象的值，因为这个是异步的，会跳出洋葱圈的模型，因此需要async + await的帮助





```diff
// 1. 导入koa包
const Koa = require('koa')
// 2. 实例化对象
const app = new Koa()
// 3. 编写中间件
app.use(async (ctx, next) => {
  ctx.message = 'aa'
await  next()
  ctx.body = ctx.message
})

app.use(async (ctx, next) => {
  ctx.message += 'bb'
await  next()
  console.log(4)
})

app.use(async (ctx)=>{
  const res = await new Promise((resolve, reject) => {
      resolve('cc')
  })
  ctx.message =+res
})
// 4. 监听端口, 启动服务
app.listen(3000)
console.log('server is running on http://localhost:3000')
```



上面就能够输出 aabbcc



>next返回的也是promise的值





# 5. router

koa最原始的路由方式，ctx.request.url 与 ctx.request.method

返回值用 ctx.body = ''

koa-router就是这个原理

```js
// 一. 导入koa
const Koa = require('koa')
// 二. 实例化对象
const app = new Koa()
// 三. 编写中间件
app.use((ctx) => {
  if (ctx.url == '/') {
    ctx.body = '这是主页'
  } else if (ctx.url == '/users') {
    if (ctx.method == 'GET') {
      ctx.body = '这是用户列表页'
    } else if (ctx.method == 'POST') {
      ctx.body = '创建用户'
    } else {
      ctx.status = 405 // 不支持的请求方法
    }
  } else {
    ctx.status = 404
  }
})
// 四. 启动服务
app.listen(3000, () => {
  console.log('server is running on http://localhost:3000')
})
```





# 6. 请求参数解析

## GET

```js
/:id
通过 ctx.request.params

/find?name="123"&&age="345"
通过 ctx.request.query
```





## POST/PUT/PATCH/DELETE

```js
通过ctx.request.body获得 请求体里面的信息
```

学会查看postman的报错，404，还是500？

## koa-body

koa默认不支持post参数的解析

需要koa-body社区的中间件来支持，必须放在所有的路由之前使用



## 错误

>koa可以通过 ctx.throw(404)

```js
手动抛出
ctx.throw(400);
ctx.throw(400, 'name required');
ctx.throw(400, 'name required', { user: user });

500：如果是代码执行错误，node终端解析不会出问题，但是发请求 会返回500。随便加一个a.b
404：笼统的说法，资源没有找到。传参传错，路由没有匹配上；没有写ctx.body返回值
```



## koa-json-error

能够帮助我们返回错误信息,但是和emit on 发布订阅的方式二者只能取其一

```js
下包：
koa-json-error 帮助自动检索错误
cross-env 帮助我们在package.json里面配置环境变量
```



package.json

```js
  "scripts": {
    "dev": "nodemon src/08_错误处理.js",
    "prod": "cross-env NODE_ENV=production node src/08_错误处理.js"
  },
```





服务器文件

```js
const error = require('koa-json-error')
app.use(
  error({
    format: (err) => {
      return { code: err.status, message: err.message, result: err.stack }
    },
    postFormat: (err, obj) => {
      // 能够将result和rest变量区分开来
      const { result, ...rest } = obj
      return process.env.NODE_ENV == 'production' ? rest : obj
    },
  })
)
```





路由文件

```js
router.get('/article/:id', (ctx) => {
  console.log(ctx.params)
  // 没有通过ctx.body返回数据时, 默认koa返回404错误
  // console.log(aaa)
  if (false) {
    ctx.body = { id: 1, title: '文章1', content: '文章1' }
  } else {
    ctx.throw(422, '参数格式不正确')
  }
})
```

通过ctx.throw手动抛出错误

或者是aaa没有定义变量，返回500的错误

或者是查不到id值，返回404错误，都可以被捕获到



