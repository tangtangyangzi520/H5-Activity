/*
 * @Descripttion:
 * @Date: 2021-04-27 18:17:55
 * @LastEditTime: 2021-04-28 20:28:57
 * @LastEditors: kiki
 * @Author: Kiki
 */

import { lang } from './language'

/**
 * @description 获取url参数
 */
const url = location.search
let test = ''
 if(url) {
   test = url.substring(url.indexOf('?')+1,url.indexOf('/'))
 }
 export let language: string = url ? test:'zh-CN'

/**
 * @description 设置多语言
 * @param {string} language
 * @returns
 */
export function setLang(language: string) {
  const langData = lang[language]
  const ele = document.querySelectorAll('[data-lange]')
  ele.forEach((el) => {
    const key: string = el.getAttribute('data-lange') || ''
    const text: string = langData[key]
    if (text) {
      el.innerHTML = text
    }
  })
}


