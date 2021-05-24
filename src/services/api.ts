/*
 * @Descripttion:接口路径
 * @Date: 2021-04-22 10:52:58
 * @LastEditTime: 2021-05-14 14:32:04
 * @LastEditors: kiki
 * @Author: Kiki
 */

import { post, get } from './http'
const ct = { 'Content-Type': 'application/json' }
// 登录
export const login = (params: any) => post('login', params)
// 查询用户抽奖信息接口
export const findEarliestMemberScratchReward = (params: any) => get('member/reward/findEarliestMemberScratchReward', params)
// 保存抽奖结果接口
export const saveMemberScratchReward = (params: any) => post('member/reward/saveMemberScratchReward', params, ct)
// 刷新抽奖次数
export const refreshMemberScratchReward = (params: any) => get('member/reward/refreshMemberScratchReward', params)