module.exports = {
  userFormateError: {
    code: '10001',
    messag: '用户名或者密码为空',
    result: '',
  },
  userAlreadyExited: {
    code: '10002',
    message: '用户已经存在',
    result: '',
  },
  userRegisterError: {
    code: '10003',
    message: '用户注册错误',
    result: '',
  },
  userDoesNotExist: {
    code: '10004',
    message: '用户不存在',
    result: '',
  },
  userLoginError: {
    code: '10005',
    message: '用户登录失败',
    result: '',
  },
  invalidPassword: {
    code: '10006',
    message: '密码不匹配',
    result: '',
  },
  // 用户权限
  // token过期
  TokenExpiredError: {
    code: '10101',
    message: 'token已经过期',
    result: '',
  },
  // 无效的token
  invalidToken: {
    code: '10102',
    message: '无效的token',
    result: '',
  },

  // 没有管理员权限
  hasNotAdminPermission: {
    code: '10103',
    message: '没有管理员权限',
    result: '',
  },

  // goods
  // 图片上传错误
  fileUploadError: {
    code: '10201',
    message: '商品图片上传失败',
    result: '',
  },
  // 图片类型不对
  unSupportedFileType: {
    code: '10202',
    message: '不支持的文件格式',
    result: '',
  },
  // 商品格式错误
  goodsFormatError: {
    code: '10203',
    message: '商品参数格式错误',
    result: '',
  },
  invalidGoodsID: {
    code: '10205',
    message: '无效的商品id',
    result: '',
  },

  // 服务器参数错误
  serveParametersFalse: {
    code: '5001',
    message: '服务端错误',
    result: '',
  },
}
