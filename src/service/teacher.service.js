const prisma = require('../app/database');
const {
  formatTime
} = require('../utils/utils')

const md5Password = require('../utils/password-handler');

class TeacherService {
  async addAddress(name, latitude, longitude) {
    try {
      let isExist = await prisma.address.findFirst({
        where: {
          name,
          latitude,
          longitude
        }
      })

      if(isExist) {
        return false
      }

      const result = await prisma.address.create({
        data: {
          name,
          latitude,
          longitude
        }
      })
      
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async getAddressList(pageNum, limit) {
    let res = await prisma.address.findMany()
    if(!pageNum) {
      return res
    }

    const result = await prisma.address.findMany({
      skip: (pageNum - 1) * limit,
      take: limit
    })

    return {
      totalPages: Math.ceil(res.length / limit),
      data: result
    }
  }

  async addNotice(name, content, tags, images, addressId, startTime, endTime, recipent = 0, type = 0, id) {
    let t = formatTime(new Date())
    const releaseTime = `${t.getDate()} ${t.getTime()}`

    let data = {
      // name: name.substring(1, name.length - 1),
      // content: content.substring(1, content.length - 1),
      // tags: tags?.substring(1, tags.length - 1),
    //   images,
      // startTime: startTime?.substring(1, startTime.length - 1),
      // endTime: endTime?.substring(1, endTime.length - 1),
      recipent,
      type,
      announcerId: id,
      releaseTime
    }
    
    if(!!images) data.images = images

    let temp = {
      name, content, tags, startTime, endTime
    };

    ['name', 'content', 'tags', 'startTime', 'endTime'].forEach(k => {
        temp[k] = temp[k].substring(1, temp[k].length - 1)
        if(temp[k]?.trim()) {
            data[k] = temp[k]
        }
    })
    
    if(addressId !== 'undefined') data.addressId = +addressId
    
    const result = await prisma.notice.create({
      data
    })

    return result
  }

  async getNotice(announcerId, roleId, type, pageNum, limit) {
    try {
      let opt = {}, cur = formatTime(new Date()), curTime = `${cur.getDate()} ${cur.getTime()}`
      if(roleId == 1) opt.announcerId = announcerId
      switch(type) {
        case 'ready': {
          opt.startTime =  {
            gt: curTime
          }
          break;
        }
        case 'start': {
          opt.startTime = {
            lt: curTime
          }
          opt.endTime = {
            gt: curTime
          }
          break;
        }
        case 'finished': {
          opt.endTime = {
            lt: curTime
          }
          break;
        }
      }

      let res = await prisma.notice.findMany()
  
      const result = await prisma.notice.findMany({
        select: {
          id: true,
          name: true,
          releaseTime: true,
          content: true,
          tags: true,
          images: true,
          startTime: true,
          endTime:true
        },
        where: opt,
        skip: (pageNum - 1) * limit,
        take: limit,
        orderBy: {
          id: "desc"
        }
      })

      result.forEach(r => {
          r.tags = r.tags.split(',')
        if(r.images) {
            let imgs = r.images.split(',');
    
            imgs = imgs.filter(n => n != '')
    
            r.images = imgs.map(img => {
              return `https://krega.goodboycoder.top/upload/${img}`
            })
        }
      })
  
      return {
        totalPages: Math.ceil(res.length / limit),
        data: result
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getNoticeById(id) {
    const result = await prisma.notice.findFirst({
      include: {
        address: true
      },
      where: {
        id
      }
    })

    if(result.images) {
        result.images = result.images.split(',').map(img => {
          return `https://krega.goodboycoder.top/upload/${img}`
        })
    }
    result.tags = result.tags.split(',')

    return result;
  }

  async importStudent(list, id) {
    try {
      for(let i = 0, len = list.length; i < len; i++) {
        const {name, userNo, password, universityId, collegeId, roleId, specialtyId, emails, classId, dormitory, phone, office} = list[i];
        let data = {
          name,
          phone: phone+"",
          userNo: userNo+"",
          password: md5Password(String(password)),
          roleId,
          universityId,
          collegeId
        }
        if(emails) data.emails = emails
        let user = await prisma.user.create({
          data
        })

        let result

        if(roleId == 2) {
          result = await prisma.student.create({
            data: {
              userId: user.id,
              specialtyId,
              classId,
              dormitory,
              relatedTeaId: id
            }
          })
        } else {
          result = await prisma.teacher.create({
            data: {
              office,
              userId: user.id
            }
          })
        }
      }
      return true;
    } catch (e) {
      console.log(e);
      return false
    }
  }

  async getStudent(id) {
    try {
      // const tea = await prisma.teacher.findFirst({
      //   where: {
      //     userId: id
      //   }
      // })

      const result = await prisma.student.findMany({
        include: {
          user: true
        },
        where: {
          relatedTeaId: id
        }
      })

      return result
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new TeacherService()