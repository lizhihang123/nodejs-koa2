const User = require('../model/user.model')
const { userRegisterError } = require('../constant/err.type')

class UserService {
  async createUser(user_name, password) {
    // ES6简写
    try {
      const res = await User.create({
        user_name,
        password,
      })
      return res.dataValues
    } catch (error) {
      console.error('用户注册错误', error)
      ctx.app.emit('error', userRegisterError, ctx)
    }
  }

  // 查询是否有这个用户信息
  async getUserInfo({ id, user_name, password, is_admin }) {
    const whereOpt = {}
    // ES6简写 {id}
    id && Object.assign(whereOpt, { id })
    user_name && Object.assign(whereOpt, { user_name })
    password && Object.assign(whereOpt, { password })
    is_admin && Object.assign(whereOpt, { is_admin })
    const res = await User.findOne({
      attributes: ['id', 'user_name', 'password', 'is_admin'],
      where: whereOpt,
    })
    return res ? res.dataValues : null
  }

  /* 
    7/24 
    
    根据用户id 更新密码 id必须有 其它的有没有可以选择
    将id值为 whereOpt.id的时候 更改为newUser
      
  */
  async updateById({ id, user_name, password, is_admin }) {
    const whereOpt = { id }
    const newUser = {}
    /* 
      Object.assign() 而不是 Object.create() 目的是为了拷贝对象 而不是创建对象
    */
    user_name && Object.assign(newUser, { user_name })
    password && Object.assign(newUser, { password })
    is_admin && Object.assign(newUser, { is_admin })

    // 查询条件只有id 要修改的内容是newUser
    const res = await User.update(newUser, {
      where: whereOpt,
    })
    return res[0] > 0 ? true : false
  }
}

module.exports = new UserService()
