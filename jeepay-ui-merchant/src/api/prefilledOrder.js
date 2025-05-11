/*
 * 预填订单管理 API
 *
 * @author Trae
 * @site https://www.jeepay.vip
 */

import request from '@/http/request'
import { req, reqLoad } from './manage' // 复用 manage.js 中的通用请求方法

// 预填订单API URL
export const API_URL_PREFILLED_ORDER = '/api/prefilledOrder'

// 查询商户对应应用下支持的支付方式
export function getPayWaysByAppId (appId) {
  return request.request({ url: API_URL_PREFILLED_ORDER + '/payWays/' + appId, method: 'GET' }, true, true, false)
}

// 预填订单列表
export function getPrefilledOrderList (params) {
  return req.list(API_URL_PREFILLED_ORDER, params)
}

// 创建预填订单
export function createPrefilledOrder (data) {
  return req.add(API_URL_PREFILLED_ORDER, data)
}

// 查询预填订单详情
export function getPrefilledOrderDetail (prefilledOrderId) {
  return req.getById(API_URL_PREFILLED_ORDER, prefilledOrderId)
}

// 更新预填订单
export function updatePrefilledOrder (prefilledOrderId, data) {
  return req.updateById(API_URL_PREFILLED_ORDER, prefilledOrderId, data)
}

// 删除预填订单
export function deletePrefilledOrder (prefilledOrderId) {
  return req.delById(API_URL_PREFILLED_ORDER, prefilledOrderId)
}

// 对外公开的API，如果需要在商户后台调用，也可以放在这里
// 查询预填订单公开信息 (如果需要)
// export function getPublicPrefilledOrderDetail (prefilledOrderId) {
//   return request.request({ url: '/api/anon/prefilledOrder/publicPay/' + prefilledOrderId, method: 'GET' }, true, true, false)
// }

// 查询预填订单可用支付方式 (如果需要)
// export function getPublicPrefilledOrderPayWays (prefilledOrderId) {
//   return request.request({ url: '/api/anon/prefilledOrder/publicPay/' + prefilledOrderId + '/payways', method: 'GET' }, true, true, false)
// }

// 获取公开预填订单列表 (无需认证)
export const prefilledOrderPublicList = (params) => {
  return req.list('/api/anon/prefilledOrder', params)
}

// 获取公开预填订单详情 (无需认证)
export const prefilledOrderPublicDetail = (prefilledOrderId) => {
  return req.getById('/api/anon/prefilledOrder', prefilledOrderId)
}

// 获取商户应用配置的支付方式 (无需认证)
export const prefilledOrderPublicPayWays = (prefilledOrderId) => {
  return req.getById('/api/anon/prefilledOrder', `${prefilledOrderId}/payways`)
}

// 创建预填订单的支付订单 (无需认证)
export const prefilledOrderPublicCreatePayOrder = (prefilledOrderId, params) => {
  return req.add(`/api/anon/prefilledOrder/${prefilledOrderId}/pay`, params)
}