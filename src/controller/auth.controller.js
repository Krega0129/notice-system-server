const jwt = require('jsonwebtoken');

const { request } = require('../service/request')
const {
  PRIVATE_KEY,
  APP_ID,
  APP_SECRET
} = require('../app/config')

const AuthService = require('../service/auth.service')

const res = require('../utils/res');
var WXBizDataCrypt = require('../utils/WXBizDataCrypt');
const errorEmitter = require('../utils/error-emitter');
const errorTypes = require('../constants/error-types')

class AuthController {
  async login(ctx, next) {
    try {
      // const { iv, encryptedData, code } = ctx.request.body;
      const { iv, encryptedData, code } = ctx.query;

      let result = await request(`https://api.weixin.qq.com/sns/jscode2session?appid=${APP_ID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`)

      const {session_key, openid} = JSON.parse(result)

      const pc = new WXBizDataCrypt(APP_ID, session_key)
      const info = pc.decryptData(encryptedData, iv)

      // 查询用户是否绑定
      const u = await AuthService.saveOpenId(openid)

      // 生成token
      let token

      let userId = null, hasBind = false

      if(u && u.hasOwnProperty('hasBind')) {
        const {id, name, roleId} = u
        const o = {
          openid,
          id, 
          name, 
          roleId,
          avatarUrl: info.avatarUrl,
          hasBind: u.hasBind,
          date: new Date()
        }
        if(roleId == 2) o.relatedTeaId = u.students[0].relatedTeaId
        token = jwt.sign(o, PRIVATE_KEY, {
          expiresIn: 30*24*60*60,
          algorithm: 'RS256'
        })
        userId = id
        hasBind = u.hasBind
      } else {
        token = jwt.sign({
          openid,
          avatarUrl: info.avatarUrl,
          date: new Date()
        }, PRIVATE_KEY, {
          expiresIn: 30*24*60*60,
          algorithm: 'RS256'
        })
      }

      ctx.body = res({
        data: {
          user: {
            userId,
            hasBind
          },
          token
        }
      })
    } catch (e) {
      console.log(e);
    }
  }

  async bindInfo(ctx, next) {
    try {
      // const { userNo, universityId } = ctx.request.body;
      const { userNo, universityId } = ctx.query;
      const {avatarUrl} = ctx.user
      
      const {
        id, name, roleId, hasBind, students
      } = await AuthService.updateOpenId(userNo, universityId, avatarUrl, ctx.openid)
      let msg = {
        openid: ctx.openid,
        id,
        name,
        avatarUrl,
        roleId,
        date: new Date()
      }

      if(roleId == 2) msg.relatedTeaId = students[0].relatedTeaId

      const token = jwt.sign(msg, PRIVATE_KEY, {
        expiresIn: 30*24*60*60,
        algorithm: 'RS256'
      })

      ctx.body = res({
        data: {
          id,
          token,
          name,
          roleId,
          hasBind
        }
      })
    } catch (e) {
      console.log(e);
    }
  }

  async getCampusList(ctx, next) {
    const result = await AuthService.getCampusList()
    ctx.body = res({
      data: result
    })
  }

  async updatePassword(ctx, next) {
    const {oldPwd, newPwd} = ctx.query;
    const {id} = ctx.user

    const result = await AuthService.updatePassword(id, oldPwd, newPwd);
    if(!result) {
      return errorEmitter(errorTypes.OLDPWD_IS_INCURRECT, ctx)
    }
    console.log(result);
    ctx.body = res({})
  }
}

module.exports = new AuthController()