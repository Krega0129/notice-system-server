const TeacherService = require('../service/teacher.service');
const errorEmitter = require('../utils/error-emitter');
const errorTypes = require('../constants/error-types')
const res = require('../utils/res');
const axios = require('axios')

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const {request, subscribePost} = require('../service/request');
const {
  APP_ID,
  APP_SECRET
} = require('../app/config')
let access_token


class TeacherController {
  async addAddress(ctx, next) {
    try {
      const { name, latitude, longitude } = ctx.query

      const result = await TeacherService.addAddress(name, +latitude, +longitude);

      if (!result) {
        return errorEmitter(errorTypes.ADDRESS_ALREADY_EXIST, ctx)
      }

      ctx.body = res({})
    } catch (e) {
      console.log(e);
    }
  }

  async getAddressList(ctx, next) {
    const { pageNum } = ctx.query

    const result = await TeacherService.getAddressList(pageNum, 10);

    ctx.body = res({
      data: result
    })
  }

  async addNotice(ctx, next) {
    try {
      const files = ctx.request.files.file

      let images = []

      if (Array.isArray(files)) {
        files.forEach(file => {
          images.push(file.newFilename)
        })
      } else if (files) {
        images.push(files.newFilename)
      }

      const { name, content, tags, addressId, startTime, endTime, recipent, type } = ctx.request.body
      const { id } = ctx.user
      const result = await TeacherService.addNotice(name, content, tags, images.join(','), addressId, startTime, endTime, recipent, type, id);
      console.log('result', result);
      if(result) {
        let res = await request(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`)
        let access_token = res.access_token
        console.log('res', res);
        const students = await TeacherService.getStudent(id);
        console.log(students);
        let openids = students.filter(u => !!u.user.openId).map(s => s.user.openId)
        console.log(openids);
        for(let i = 0, len = openids.length; i < len; i++) {
          const r = await axios.post(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`, {
            touser: openids[i],
            template_id: "k8KOTBPwSLXLYe6fcz8gLdMycfrtpUtIipVLFA9bLTU",
            page: `/pages/noticeDetails/noticeDetails?id=${result.id}`,
            data: {
              "thing1": {
                "value": result.name
              },
              "time2": {
                "value": result.releaseTime
              }
            }
          })
          // const r = await subscribePost({
          //   access_token,
          //   touser: openids[i],
          //   template_id: "k8KOTBPwSLXLYe6fcz8gLdMycfrtpUtIipVLFA9bLTU",
          //   page: `/pages/noticeDetails/noticeDetails?id=${result.id}`,
          //   data: {
          //     "thing1": {
          //       "value": result.name
          //     },
          //     "time2": {
          //       "value": result.releaseTime
          //     }
          //   }
          // })
          // console.log(r);
        }
      }

      ctx.body = res({})
    } catch (e) {
      console.log(e);
    }
  }

  async getNotice(ctx, next) {
    const { id, roleId } = ctx.user
    const {type, pageNum} = ctx.query

    const result = await TeacherService.getNotice(id, roleId, type, pageNum, 10)

    ctx.body = res({
      data: result
    })
  }

  async getNoticeById(ctx, next) {
    const { id } = ctx.query
    const result = await TeacherService.getNoticeById(+id);

    ctx.body = res({
      data: result
    })
  }

  async importStudent(ctx, next) {
    try {
      const file = ctx.request.files.file
      const {id} = ctx.user
      
      const datas = []; //可能存在多个sheet的情况
      const workbook = xlsx.readFile(file.filepath);
      const sheetNames = workbook.SheetNames; // 返回 ['sheet1', ...]
      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        datas.push(data);
      }
      
      let result = await TeacherService.importStudent(datas[0], id)
      if(!result) {
        return errorEmitter(errorTypes.IMPORT_FAILED, ctx)
      }

      ctx.body = res({})
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new TeacherController()