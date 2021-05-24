/*
 * @Descripttion: 域名配置
 * @Date: 2021-04-22 17:46:34
 * @LastEditTime: 2021-04-29 15:35:57
 * @LastEditors: kiki
 * @Author: Kiki
 */

/**
 * 系统配置
 */
const setting = {
  development: {
    baseInfo: {
      domain: 'http://192.168.0.181:6190/api/',
      area: 'http://localhost:8080/static/area.json'
    },
  },
  development: {
    baseInfo: {
      domain: 'https://test.zetarapp.cn/api/',
      area: 'https://www.zetarapp.com/app/i18n/area.json'
    },
  },
  production: {
    baseInfo: {
      domain: 'https://api.zetarapp.com/api/',
      area: 'https://www.zetarapp.com/app/i18n/area.json'
    },
  }
}
const special = {
  timeout: 30000,
  sourceMap: false,
}

const config = Object.assign(setting[process.env.NODE_ENV], special)
module.exports = config
