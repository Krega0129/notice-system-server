const Router = require('koa-router');

const teacherRouter = new Router();

const {
  addAddress,
  getAddressList,
  addNotice,
  getNotice,
  getNoticeById,
  importStudent
} = require('../controller/teacher.controller')

const {
  verifyAuth
} = require('../middleware/auth.middleware')

teacherRouter.get('/addAddress', verifyAuth, addAddress)
teacherRouter.get('/getAddressList', verifyAuth, getAddressList)
teacherRouter.post('/addNotice', verifyAuth, addNotice)

teacherRouter.get('/getNotice', verifyAuth, getNotice)
teacherRouter.get('/getNoticeById', verifyAuth, getNoticeById)
teacherRouter.post('/importStudent', verifyAuth, importStudent)


module.exports = teacherRouter