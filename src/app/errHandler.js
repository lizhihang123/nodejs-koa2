module.exports = (err, ctx) => {
  // 默认status是400
  // 根据err错误信息里面的code的值 决定 status应该是多少 赋值给ctx的status以及body
  // 挂到app上
  let status = 500
  switch (err.code) {
    // 10001 用户名或者密码为空
    case '10001':
      status = 401
      break
    // 用户已经存在
    case '10002':
      status = 409
      break
    // 用户注册错误
    case '10003':
      status = 400
      break
    // 用户不存在
    case '10004':
      status = 404
      break
    // 用户登录失败
    case '10005':
      status = 400
      break
    // 密码不匹配
    case '10006':
      status = 400
      break
    // token过期
    case '10101':
      status = 400
      break
    // 无效的token
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
