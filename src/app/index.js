const Koa = require('koa');

const fs = require("fs");
const path = require("path");

// 解析 json
const bodyParser = require('koa-bodyparser');
// 解析 formData
const koaBody = require('koa-body')
// 路由入口
const useRoutes = require('../routes');
// 错误处理
const errorHandler = require('./error-handler');

const cors = require('koa-cors')

const app = new Koa()

app.use(bodyParser());

app.use(cors())

app.use(koaBody({
  multipart: true, // 支持多文件上传
  formidable: {
    uploadDir: path.join(__dirname, "../upload/"), // 设置文件上传目录
    keepExtensions: true, // 保持文件的后缀
    maxFieldsSize: 10 * 1024 * 1024, // 文件上传大小限制
    onFileBegin: (name, file) => {
      // 无论是多文件还是单文件上传都会重复调用此函数
      // 最终要保存到的文件夹目录
      try {
        const dir = path.join(__dirname, `uploads`);
      // 检查文件夹是否存在如果不存在则新建文件夹
      if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
      // 文件名称去掉特殊字符但保留原始文件名称
      const fileName = file.name
      file.name = fileName;
      // 覆盖文件存放的完整路径(保留原始名称)
      file.path = `${dir}/${fileName}`;
      } catch(e) {
        console.log(e);
      }
    },
    onError: (error) => {
      console.log(error);
      return;
    },
  },
}))

useRoutes(app);

// 处理错误信息
app.on('error', errorHandler)

module.exports = app;