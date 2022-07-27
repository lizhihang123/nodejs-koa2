const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')

const router = new Router()

fs.readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js') {
    const r = require('./' + file)
    // console.log('r是' + r)
    // console.log(r.routes)
    router.use(r.routes())
  }
})

module.exports = router
