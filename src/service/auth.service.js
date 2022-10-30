const prisma = require('../app/database');
const md5Password = require('../utils/password-handler');

class AuthService {
  async getCampusList() {
    try {
      const result = await prisma.university.findMany({
        select: {
          id: true,
          name: true
        }
      })
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async checkUserExist(universityId, userNo, roleId) {
    try {
      const result = await prisma.user.findFirst({
        where: {
          roleId: +roleId,
          userNo,
          universityId: +universityId
        }
      })

      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async saveOpenId(openId) {
    try {
      // 判断是否存在
      let isExist = await prisma.user.findFirst({
        include: {
          students: true
        },
        where: {
          openId
        }
      })

      // await prisma.user.create({
      //   data: {
      //     name: "Krega",
      //     userNo: "Krega",
      //     password: md5Password("Krega"),
      //     universityId: 1,
      //     roleId: 2,
      //     collegeId: 1
      //   }
      // })

      // 若用户表存在，则返回userId，用于生成token
      // if(isExist) {
      //   return isExist
      // }

      // isExist = await prisma.tourist.findFirst({
      //   where: {
      //     openId
      //   }
      // })

      // if(isExist) {
      //   return isExist
      // }

      // 不存在，则新建一个用户
      // const result = await prisma.tourist.create({
      //   data: {
      //     openId
      //   }
      // })
      // return result
      return isExist
    } catch (e) {
      console.log(e);
    }
  }

  async updateOpenId(userNo, universityId, avatarUrl, openId) {
    try {
      const result = await prisma.user.update({
        include: {
          students: true
        },
        data: {
          openId,
          hasBind: true,
          avatarUrl: avatarUrl
        },
        where: {
          userNo_universityId: {
            userNo,
            universityId: +universityId
          }
        }
      })
  
      return result
    } catch (e) {
      console.log(e);
    }
  }

  async updatePassword(id, oldPwd, newPwd) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id
        }
      })
  
      if(user.password !== md5Password(oldPwd)) {
        return false;
      }
  
      const result = await prisma.user.update({
        data: {
          password: md5Password(newPwd)
        },
        where: {
          id
        }
      })
  
      return result
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new AuthService()