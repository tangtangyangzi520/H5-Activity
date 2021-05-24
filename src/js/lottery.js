/*
 * @Descripttion: 
 * @Date: 2021-04-21 16:36:01
 * @LastEditTime: 2021-05-20 17:45:20
 * @LastEditors: kiki
 * @Author: Kiki
 */
// import '@/mock/mockData.ts';
import '@/common/css/common.css';
import '@/common/css/reset.css';
import '@/css/lottery.css';
import '@/common/js/remFlex.js';
import '@/common/js/initNative';
import {
    iosWebkitHandlers
} from '../common/js/handleNative'
import {
    lang
} from '@/i18n/language'
import {
    findEarliestMemberScratchReward,
    saveMemberScratchReward,
    refreshMemberScratchReward
} from '@/services/api'
import {
    setStorage
} from '../utils';

let clientWidth, canvasWidth, canvasHeight
let num = 0 // 剩余抽奖次数
let rewardData = null // 抽奖信息
let i18nLang
let canvas
let ctx
let beforeMask
let topImg
let language 
let isInitContent = true
let mouseDown = false
let canSave = true
resizeCanvas()
// initContent()
// sendRequestMethod()
// var vConsole = new VConsole()


window.onresize = resizeCanvas
window.sendRequestMethod = sendRequestMethod
window.rechargeSuccessRefreshed = rechargeSuccessRefreshed
// 后台主动刷新请求数据
function rechargeSuccessRefreshed() {
    getAwardInfo()
}

// 设置canvas的宽高
function resizeCanvas() {
    clientWidth = document.body.clientWidth
    canvasWidth = Math.floor((clientWidth * 550) / 750) // canvas宽 = 屏幕宽 * 设计稿里canvas宽 / 750
    canvasHeight = Math.floor((clientWidth * 380) / 750) // canvas高 = 屏幕宽 * 设计稿里canvas高 / 750
}
//客户端主动传递信息
function sendRequestMethod(name, data) {
    // 接收语言选择
    if (name === 'language') {
        language = JSON.parse(data).code
        setStorage('language', language)
        if (isInitContent) {
            initContent()
        }
    }
}
// 初始化页面
function initContent() {
    isInitContent = false
    i18nLang = lang[language]
    topImg =
        language == 'en-US' ?
        './assets/icon_lottery_top_title_eng.png' :
        './assets/icon_lottery_top_title_ft.png'

    var fragment = create(`
    <div class="contain">
        <div class="content">
            <img class="text-img" src="${topImg}" />
            <div class="canvas-contain">
                <div class="remain" id="remainChance"></div>
            </div>
            <canvas id="canvas"> </canvas>
            <div class="canvas-show">
                <span>${i18nLang.lotteryRule.congratulation}</span>
                <span id="beanNum">${i18nLang.lotteryRule.award}</span>
                <div class="ward-find">${i18nLang.lotteryRule.checkAward}</div>
                <div class="again-more" >${i18nLang.lotteryRule.onceAgain}</div>
            </div>
            <div class="start-show" id="beforeMask">
                <span id="showDes"></span>
                <span id="obtainLottery">${i18nLang.lotteryRule.waiting}</span>
                <span id="startLottery" >${i18nLang.lotteryRule.clickBegin}</span>
            </div>
            <div class="bottom-icon">
                <div class="award-rule" >${i18nLang.lotteryRule.awardDetail}</div>
                <img src="./assets/icon_lottery_logo.png" />
            </div>
        </div>
    </div>

    `)
    document.body.insertBefore(fragment, document.body.childNodes[0])
    $('.again-more').click(() => {
        continueScratch()
    })
    $('#startLottery').click(() => {
        startTouch()
    })
    $('.award-rule').click(() => {
        ruleDetail()
    })
    initCanvas()
    getAwardInfo()
}

//获取用户信息
function getAwardInfo() {
    let options = {
        type: 1
    }
    findEarliestMemberScratchReward(options).then(result=> {
        rewardData = result.data.memberReward
        num = result.data.memberReward.remainNumber || 0
        setContent()
    })
}

function getNum(content, data) {
    let newData = content.replace(/xxx/g, data)
    return newData
}
// 判断是否还有抽奖机会，没有跳转钱包页面
function startTouch() {
    if (Number(num) === 0) {
        iosWebkitHandlers('goToOtherPage', {
            key: "wallet"
        })
        return
    }
    beforeMask = document.getElementById('beforeMask')
    beforeMask.style.visibility = 'hidden'
}

// 初始化画布
function initCanvas() {
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')
    canvas.setAttribute('height', canvasHeight)
    canvas.setAttribute('width', canvasWidth)
    drawPic()
}

function drawPic() {
    ctx.beginPath()
    ctx.fillStyle = '#35bec0' // 刮刮乐图层的填充色
    ctx.lineCap = 'round' // 绘制的线结束时为圆形
    ctx.lineJoin = 'round' // 当两条线交汇时创建圆形边角
    ctx.lineWidth = 30 // 单次刮开面积
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    ctx.save() // 保存画布上面的状态
    ctx.closePath()
    ctx.globalCompositeOperation = 'destination-out' // 新图像和原图像重合部分变透明
    // 下面代码是为了修复部分手机浏览器不支持destination-out
    canvas.style.display = 'inherit'
    canvas.addEventListener('touchstart', touchstart)
    canvas.addEventListener('touchend', touchend)
    canvas.addEventListener('touchmove', eventMove)
}

function touchstart(e) {
    e.preventDefault()
    mouseDown = true
}

function touchend(e) {
    e.preventDefault()
    mouseDown = false
}

function eventMove(e) {
    e = e || window.event
    if (typeof e.touches !== 'undefined') {
        e = e.touches[0]
    }
    let x = e.pageX - e.target.offsetLeft
    let y = e.pageY - e.target.offsetTop
    ctx.lineTo(x, y)
    ctx.stroke()
    clear()
}
// 涂抹清除画布
function clear() {
    let data = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data // 得到canvas的全部数据
    let half = 0
    // length = canvasWidth * canvasHeight * 4，一个像素块是一个对象rgba四个值，a范围为0~255
    for (var i = 3, length = data.length; i < length; i += 4) {
        // 因为有rgba四个值，下标0开始，所以初始i=3
        if (data[i] && data[i + 1] && data[i + 2] && data[i + 3]) {
            half++
        }
    }
    // 当图层被擦除剩余50%时触发
    if (half <= canvasWidth * canvasHeight * 0.5&&canSave) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight) // 清空画布
        canvas.style.display = 'none'
        saveAward()
    }
}
//保存抽奖数据
function saveAward() {
    if (!canSave) return
    canSave = false
    // iosWebkitHandlers('toRequest', options)
    let options = {
        orderId: rewardData.orderId,
        type: 1
    }
    saveMemberScratchReward(options).then(() => {
        refreshHandle() //保存成功后刷新抽奖次数
    })
}

//刷新抽奖次数
function refreshHandle() {
    if (!this.canSave) return
    refreshMemberScratchReward({
        type: 1
    }).then((result) => {
        num = result.data.remainNumber || 0
        setContent()
    })
    // iosWebkitHandlers('toRequest', options)
}
// 设置显示内容
function setContent() {
    var remainChance = document.getElementById('remainChance')
    var beanNum = document.getElementById('beanNum')
    var showDes = document.getElementById('showDes')
    var startLottery = document.getElementById('startLottery')
    var obtainLottery = document.getElementById('obtainLottery')
    obtainLottery.style.display = num == 0 ? 'block' : 'none'
    remainChance.innerHTML = getNum(i18nLang.lotteryRule.remainChance, num)
    beanNum.innerHTML = getNum(
        i18nLang.lotteryRule.award,
        rewardData.rewardValue
    )
    showDes.innerHTML =
        num == 0 ? i18nLang.lotteryRule.noChance : i18nLang.lotteryRule.bigAward
    startLottery.innerHTML =
        num > 0 ?
        i18nLang.lotteryRule.clickBegin :
        i18nLang.lotteryRule.rightNow
}

function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div')
    temp.innerHTML = htmlStr
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild)
    }
    return frag
}

// 继续抽奖
function continueScratch() {
    getAwardInfo() // 抽奖后刷新页面数据
    canvas.style.display = 'block'
    beforeMask.style.visibility = 'visible'
    initCanvas()
}
// 打开规则弹窗
function ruleDetail() {
    var ruleSection = create(`
    <div class="rule-mask" id="ruleMask">
                <div class="rule-con">
                    <div class="close-con" ><img src="./assets/close.png"></div>
                    <div class="rule-all">
                        <div>${i18nLang.lotteryRule.participateUser}</div>
                        <div >${i18nLang.lotteryRule.purchaseUser}</div>
                        <div >${i18nLang.lotteryRule.versionUser}</div>
                    </div>
                    <div class="rule-all">
                        <div>${i18nLang.lotteryRule.participateMethod}</div>
                        <div >${i18nLang.lotteryRule.getLotteryChance}</div>
                        <div >${i18nLang.lotteryRule.saveChance}</div>
                    </div>
                    <div class="rule-all">
                        <div>${i18nLang.lotteryRule.innerApp}</div>
                    </div>
                    <div class="rule-all">
                        <div>${i18nLang.lotteryRule.winGuarantee}</div>
                    </div>
                    <div class="rule-all">
                        <div>${i18nLang.lotteryRule.decision}</div>
                    </div>
                </div>
            </div> 
    `)
    document.body.insertBefore(ruleSection, document.body.childNodes[0])
    $('.close-con').click(() => {
        closeRuleDetail()
    })
}

function closeRuleDetail() {
    var obj = document.getElementById('ruleMask') //建议使用ID
    document.body.removeChild(obj)
}