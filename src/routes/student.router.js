const Router = require('koa-router');

const studentRouter = new Router();

const {
  getTeacherInfo
} = require('../controller/student.controller')

const {
  getNotice
} = require('../service/teacher.service')

const {
  verifyAuth
} = require('../middleware/auth.middleware')

studentRouter.get('/getTeacherInfo', verifyAuth, getTeacherInfo)


module.exports = studentRouter