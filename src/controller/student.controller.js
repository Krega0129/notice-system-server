const StudentService = require('../service/student.service');
const res = require('../utils/res');

class StudentController {
  async getTeacherInfo(ctx, next) {
    const {relatedTeaId} = ctx.user
    console.log(ctx.user)

    const tea = await StudentService.getTeacherInfoById(relatedTeaId)

    ctx.body = res({
      data: tea
    })
  }

  async getNotice(ctx, next) {
    const result = await StudentService.getNotice();

    ctx.body = res({
      data: result
    })
  }
}

module.exports = new StudentController()