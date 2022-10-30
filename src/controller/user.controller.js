const UserService = require('../service/user.service');
const res = require('../utils/res');

class UserController {
  async getUserInfo(ctx, next) {
    // console.log(ctx.user);
    const {id, roleId} = ctx.user

    const user = await UserService.getUserInfoById(id, roleId)

    let u = {}
    Object.keys(user).forEach(n => {
      if(!user.hasOwnProperty(n) || ['openId', 'password', 'createdAt', 'updatedAt'].includes(n)) return;
      u[n] = user[n]
    })

    ctx.body = res({
      data: u
    })
  }
}

module.exports = new UserController()