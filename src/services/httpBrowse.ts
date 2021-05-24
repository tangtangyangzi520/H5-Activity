/*
 * @Descripttion:请求封装
 * @Date: 2021-04-23 18:56:24
 * @LastEditTime: 2021-05-14 18:32:20
 * @LastEditors: kiki
 * @Author: Kiki
 */
import { getDomain, getStorage, setStorage } from '../utils/index'
import axios from 'axios'
import qs from 'qs'
import config from '../utils/config.js'
import { iosWebkitHandlers } from '../common/js/handleNative'
import { internationerrCode } from './errCode'

const instance = axios.create({
    baseURL: '/api',
    timeout: config.timeout,
})
// 添加请求拦截器
instance.interceptors.request.use(
    async (configRes: any) => {
        const res = await iosWebkitHandlers('getToken')
        configRes.headers.common.token = res
        return configRes
    },
    () => {
        return Promise.reject()
    }
)
// 添加响应拦截器
instance.interceptors.response.use(
    (response: any) => {
        if (response.headers.token) {
            // 如果token更换则重新设置
            // 保存token
            setStorage('token', response.headers.token)
        }
        return Promise.resolve(response)
    },
    (error: any) => {
        return Promise.reject(error)
    }
)
/**
 * @description: post请求
 * @param {string} url
 * @param {any} data
 * @param {any} headers
 */
async function post(url: string, data?: any, headers?: any) {
    const ct = headers
        ? headers['Content-Type']
        : 'application/x-www-form-urlencoded'
    const params =
        ct === 'application/json' ? JSON.stringify(data) : qs.stringify(data)
    const options = {
        method: 'post',
        url,
        data: params,
        headers: {
            'Content-Type': ct,
        },
    }
    return create(options)
}
/**
 * @description:get请求 （获取随机字符串）
 */
async function get(url: string, params?: any, headers?: any) {
    const config = {
        method: 'get',
        url,
        params,
    }
    return create(config)
}
/**
 * @description: 发起请求
 * @param {any} options
 */
async function create(options: any) {
    const result: any = await instance(options)
    if (Number(result.data.status) === 200 && result.data.message.toLowerCase() === 'success') {
        return result.data
    } else {
        return format(result)
    }
}

function format(json: { status: any; errorCode: any }) {
    const { status, errorCode } = json
    if (Number(status) === 401) {
        // iosWebkitHandlers('loseToken')
    }
    if (Number(status) !== 200) {
        const text = internationerrCode(errorCode)
    }
}
export { post, get }
