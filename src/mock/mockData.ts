/*
 * @Descripttion: mock数据
 * @Date: 2021-04-22 23:21:55
 * @LastEditTime: 2021-05-14 13:58:22
 * @LastEditors: kiki
 * @Author: Kiki
 */
import { login } from '../services/api'
import { setStorage,getStorage } from '../utils/index'
const fromData= {
    username: '18271426346',
    password: '111111',
    areaCode: 86,
    deviceType: 2,
    language:'zh-CN'
}
// 开发环境获取token

const _token = getStorage('token')

if(!_token&&process.env.NODE_ENV==='development'){
    login(fromData).then((token) => {
        setStorage('token', token)
    })
}
