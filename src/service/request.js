const https = require('https')
const axios = require('axios').default

const request = async (url) => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, function (res) {
      let data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        resolve(data);
      });
    });

    req.on('error', function (err) {
      reject(err);
    });

    req.end();
  })
}

const subscribePost = async (data) => {
  
  // const access_key = data.access_key
  // data = JSON.stringify(data);
  // const options = {
  //   hostName: 'api.weixin.qq.com',
  //   path: `/cgi-bin/message/subscribe/send?access_token=${access_key}`,
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Content-Length': data.length
  //   }
  // }

  // return new Promise((resolve, reject) => {
  //   const req = https.request(options, function (res) {
  //     let data = '';
  //     res.on('data', function (chunk) {
  //       data += chunk;
  //     });

  //     res.on('end', function () {
  //       resolve(data);
  //     });
  //   });

  //   req.on('error', function (err) {
  //     reject(err);
  //   });
  //   req.write(data);
  //   req.end();
  // })
}

module.exports = {
  request,
  subscribePost
}