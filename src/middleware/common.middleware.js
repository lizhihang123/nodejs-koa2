const validator = (rules, errType) => {
  console.log(rules, errType)
  return async (ctx, next) => {
    try {
      // rules使用外层的变量 是闭包
      ctx.verifyParams(rules)
    } catch (error) {
      // 赋值 更加精准的定位到是哪个参数出错了
      errType.result = error
      console.error('订单信息格式错误')
      return ctx.app.emit('error', errType, ctx)
    }
    await next()
  }
}
module.exports = {
  validator,
}
