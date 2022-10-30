const prisma = require('../app/database')

class UserService {
  async getUserInfoById(id, roleId) {
    const result = await prisma.user.findFirst({
      include: {
        students: {
          include: {
            specialty: roleId == 2,
            class: roleId == 2
          }
        },
        teachers: roleId == 1,
        university: true,
        college: true
      },
      where: {
        id
      }
    })

    return result
  }
}

module.exports = new UserService()