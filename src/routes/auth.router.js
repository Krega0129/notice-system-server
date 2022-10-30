const Router = require('koa-router');

const authRouter = new Router();

const {
  login,
  getCampusList,
  bindInfo,
  updatePassword
} = require('../controller/auth.controller')

const {
  DoesUserExist,
  verifyAuth
} = require('../middleware/auth.middleware')

authRouter.get('/login', login)

authRouter.get('/getCampusList', verifyAuth, getCampusList)

authRouter.get('/bindInfo', verifyAuth, DoesUserExist, bindInfo)

authRouter.get('/updatePassword', verifyAuth, updatePassword)

module.exports = authRouter