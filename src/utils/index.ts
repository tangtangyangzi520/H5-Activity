import { language } from './../i18n/setLanguage';
/*
 * @Descripttion: 常用工具方法
 * @Date: 2021-04-22 23:30:50
 * @LastEditTime: 2021-05-14 15:11:45
 * @LastEditors: kiki
 * @Author: Kiki
 */

import { iosWebkitHandlers } from "../common/js/handleNative"

/**
 * 设置localStorage本地缓存
 * @param {*} key: string
 * @param {*} obj: obj
 */
 export const setStorage = (key:string, obj:any) => {
    const json = JSON.stringify(obj)
    window.localStorage.setItem(key, json)
  }

  /**
   * 获取localStorage本地缓存
   * @param {*} key: string
   */
  export const getStorage = (key:string) => {
    const res = window.localStorage.getItem(key)
    return !res||res==='undefined' ? null:JSON.parse(res)
  }

  /**
   * 删除localStorage本地缓存
   * @param {*} key: string
   */
  export const removeStorage = (key:string) => {
    window.localStorage.removeItem(key)
  }

  /**
   * @description: 获取域名
   * 域名只进入页面获取一次，进行缓存
   */
  export async function getDomain(){
    //   if(getStorage('domain')) return getStorage('domain')
        const res = await iosWebkitHandlers('getDomain')
        setStorage('domain',res)
        return res
  }
    /**
     * @description: 获取语言
     * 域名只进入页面获取一次，进行缓存
     */
    export async function getLanguage(){
        if(getStorage('language')) return getStorage('language')
          const res = await iosWebkitHandlers('getLanguage')
          setStorage('language',res)
          return res
    }

    /**
     * @description: 获取公用信息（域名domain，语言language）
     * 只进入页面获取一次，进行缓存
     */
    export async function getCommonInfo(key: string){
        if(getStorage('commonInfo')){// 有缓存直接拿缓存数据
            const result= JSON.parse(getStorage('commonInfo'))
            return result[key]?result[key]:null
        }
        const res:any = await iosWebkitHandlers('getCommonInfo')
        setStorage('commonInfo',res)
        return res[key]?JSON.parse(res)[key]:null
    }