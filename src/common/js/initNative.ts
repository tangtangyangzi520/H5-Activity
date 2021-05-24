/*
 * @Descripttion:
 * @Date: 2021-04-27 19:02:57
 * @LastEditTime: 2021-04-28 16:20:45
 * @LastEditors: kiki
 * @Author: Kiki
 */

import { setLang } from "../../i18n/setLanguage"
import { setStorage } from "../../utils"
(window as any).sendRequestMethod = sendRequestMethod
// 客户端主动传递信息
function sendRequestMethod(name: string, data: string) {
    // 接收语言选择
    if (name === 'language') {
     const  language = JSON.parse(data).code
        setStorage('language',language)
        setLang(language)
    }

}