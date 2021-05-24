/*
 * @Descripttion:跟原生交互
 * @Date: 2020-11-25 17:43:12
 * @LastEditTime: 2021-05-14 14:38:58
 * @Author: Kiki
 */

let seq = 0
const callbackSeqFn:any={};
const userAgent = navigator.userAgent.toLowerCase();
(window as any).getKeyValue = (seq:any, value:any):void => {
    if (callbackSeqFn[seq]) {
      callbackSeqFn[seq](value)
    }
}

export function iosWebkitHandlers (clickname: string , data?: any) {
    seq++
    console.log('clickname',seq,clickname)
    const params=data===undefined?'':data// 当没有传参时则传空字符串)
    const options={
        params,
        seq
    }
    const arr=['getToken','getCommonInfo','getDomain','getDecryptResponse','getRSAEncryptKey']
    if(arr.includes(clickname)){// 调用原生，有回调方法
        requestOc(clickname,JSON.stringify(options))
        return new Promise((resolve, reject) => {
            callbackSeqFn[seq] = (val: unknown) => {
              resolve(val)
              // callbackSeqFn[seq] = null
            }
        })
    }else{// 直接调用原生方法，不需要回调
        requestOc(clickname,JSON.stringify(data))
    }
}

function requestOc(clickname: string,options: string){
    if(/iphone|ipad|ipod/.test(userAgent )){// ios客户端
        (window as any).webkit.messageHandlers[clickname].postMessage(options)
    }
    if(/android/.test(userAgent )){
        (window as any).android[clickname](JSON.stringify(options))
    }
}