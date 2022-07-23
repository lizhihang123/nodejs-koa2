const { Sequelize } = require('sequelize')

const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PWD,
  MYSQL_DB,
} = require('../config/config.default')

const seq = new Sequelize('zdsc', 'root', 'root', {
  host: MYSQL_HOST,
  dialect: 'mysql',
})

seq
  .authenticate()
  .then(() => {
    console.log('数据库连接成功')
  })
  .catch((err) => {
    console.log('1')
    console.log('数据库连接失败', err)
  })

module.exports = seq
