// 环境变量 服务器端口
const { APP_PORT } = require('./config/config.default')

// app.use((ctx, next) => {
//   ctx.body = 'hello api'
// })
// 注册路由
const app = require('./app')

app.listen(APP_PORT, () => {
  console.log(`tha server is running on http://localhost:${APP_PORT}`)
})
