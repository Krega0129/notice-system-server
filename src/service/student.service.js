const prisma = require('../app/database')

class StudentService {
  async getTeacherInfoById(id) {
    try {
      const result = await prisma.teacher.findFirst({
        include: {
          user: {
            include: {
              college: true
            }
          }
        },
        where: {
          userId: id
        }
      })
      
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async getNotice() {
    try {
      let result = await prisma.notice.findMany({
        select: {
          id: true,
          name: true,
          releaseTime: true,
          content: true,
          tags: true,
          images: true
        },
        orderBy: {
          id: 'desc'
        }
      })

      result.forEach(res => {
        let imgs = res.images.split(',');
        res.tags = res.tags.split(',')

        res.images = imgs.map(img => {
          return `https://krega.goodboycoder.top/upload/${img}`
        })
      })

      return result;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new StudentService()