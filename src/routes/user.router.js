const Router = require('koa-router');

const userRouter = new Router();

const  {
  getUserInfo
} = require('../controller/user.controller');
const { verifyAuth } = require('../middleware/auth.middleware');


userRouter.get('/getUserInfo', verifyAuth, getUserInfo)

module.exports = userRouter