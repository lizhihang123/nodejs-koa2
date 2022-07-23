const dotenv = require('dotenv')

// 使用dotenv的方法 导入所有的环境变量
dotenv.config()
// 导出环境变量
module.exports = process.env
