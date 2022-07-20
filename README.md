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





# 2 初始化app环境

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