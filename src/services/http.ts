import { language } from './../i18n/setLanguage';
/*
 * @Descripttion:请求封装
 * @Date: 2021-04-23 18:56:24
 * @LastEditTime: 2021-05-14 18:33:56
 * @LastEditors: kiki
 * @Author: Kiki
 */
import { getCommonInfo, getDomain, getStorage, setStorage } from '../utils/index'
import axios from 'axios'
import qs from 'qs'
import config from '../utils/config.js'
import { iosWebkitHandlers } from '../common/js/handleNative'
import { internationerrCode } from './errCode'

const instance = axios.create({
    baseURL: '/api',
    timeout: config.timeout,
})
interface ResponseResult<T = any> {
    message?: string
    code?: string
    status?: number
    data: T
}
// 添加请求拦截器
instance.interceptors.request.use(
    async (configRes: any) => {
        const rsaData = configRes.allEnParams
        if (rsaData['Encrypt-Key'] && rsaData['Encrypt-Key'].indexOf("u003d") !== -1) {// 转义字符
            rsaData['Encrypt-Key'] = rsaData['Encrypt-Key'].replace("u003d", "=");
        }
        let arr: string | string[] = []
        if (rsaData.NoEncryptionRequired) {// 加密时，不添加进请求头的数据
            arr = ['Key', 'NoEncryptionRequired', 'EncryptParams']
        } else {// 不加密时，不添加进请求头的数据
            arr = ['Key', 'NoEncryptionRequired', 'EncryptParams', 'Encrypt-Key', 'Signature-Key']
        }
        Object.keys(rsaData).forEach((key) => {// 添加参数到请求头
            if (!arr.includes(key)) {
                configRes.headers[key] = rsaData[key]
            }
        });
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
    // const domain = await getDomain()
    const ct = headers ? headers['Content-Type'] : 'application/x-www-form-urlencoded'
    const params = ct === 'application/json' ? JSON.stringify(data) : qs.stringify(data)
    const result: any = await iosWebkitHandlers('getRSAEncryptKey', params)
    const rsaData = JSON.parse(result)
    const options = {
        method: 'post',
        url,
        data: rsaData.NoEncryptionRequired ? rsaData.EncryptParams : params,
        headers: {
            'Content-Type': ct
        },
        allEnParams: rsaData
    }
    return create(options)
}
/**
 * @description:get请求 （获取随机字符串）
 * @param {string} rsaData['Encrypt-Key']是传给后台的head随机字符串
 * @param {any}  rsaData.Key 是解密用到的随机字符串
 * @param {any}  rsaData.NoEncryptionRequired 是后台用于统一控制是否加密
 */
async function get(url: string, params?: any, headers?: any) {
    const domain = await getCommonInfo('language')
    const result: any = await iosWebkitHandlers('getRSAEncryptKey', '')
    const rsaData = JSON.parse(result)
    const options = {
        method: 'get',
        url,
        params,
        allEnParams: rsaData
    }
    return create(options)

}
/**
 * @description: 发起请求
 * @param {any} options
 */
async function create(options: any) {
    const result: ResponseResult = await instance(options)
    const rsaData = options.allEnParams
    if (rsaData.NoEncryptionRequired) {// 需要解密
        const params = {
            data: result.data,
            configRes: rsaData.Key
        }
        const getResponse: any = await iosWebkitHandlers('getDecryptResponse', JSON.stringify(params))
        const decryptRes = JSON.parse(getResponse)
        return backResult(decryptRes)
    } else {
        return backResult(result.data)
    }
}

function backResult(result: any) {
    if (Number(result.status) === 200 && result.message.toLowerCase() === 'success') {
        return result
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
