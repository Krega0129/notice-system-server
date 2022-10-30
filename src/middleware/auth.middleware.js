const errorEmitter = require('../utils/error-emitter')
const errorType = require('../constants/error-types')
const AuthService = require('../service/auth.service')
const md5Password = require('../utils/password-handler');
const jwt = require('jsonwebtoken');
const { PUBLIC_KEY } = require('../app/config');

const DoesUserExist = async (ctx, next) => {
  try {
    // const { universityId, userNo, roleId, password } = ctx.request.body
    const { universityId, userNo, roleId, password } = ctx.query
    
    const user = await AuthService.checkUserExist(universityId, userNo, roleId);

    if(!user) {
      return errorEmitter(errorType.USER_DOES_NOT_EXIST, ctx)
    }
    if(user.password !== md5Password(password)) {
      return errorEmitter(errorType.PASSWORD_IS_INCURRECT, ctx)
    }
    user.avatarUrl = ctx.user.avatarUrl
    ctx.user = user

    await next()
  } catch (error) {
    console.log(error);
  }
}

const verifyAuth = async (ctx, next) => {
  try {
    // 获取token
    const authorization = ctx.headers.authorization
    const token = authorization.replace('Bearer ', '');
    // 验证 token
    const result = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"]
    })
    
    ctx.openid = result.openid
    ctx.user = result
    await next()
  } catch (e) {
    console.log(e);
    return errorEmitter(errorType.UNAUTHORIZATION, ctx)
  }
}

// const verifyUser = async (ctx, next) => {
//   const {universityId, userNo, password} = ctx.request.body;

//   const user = await userService.getUserByName(account);

//   if(md5Password(password) !== user.password) {
//     return errorEmitter(errorTypes.PASSWORD_IS_INCURRECT, ctx)
//   }

//   ctx.user = user;
  
//   await next()
// }

module.exports = {
  DoesUserExist,
  verifyAuth,
  // verifyUser
}