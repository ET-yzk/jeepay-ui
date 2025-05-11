<template>
  <a-watermark content="杭州市计算机学会">
    <div class="page-container">
      <a-card :bordered="false" :loading="vdata.loading" class="pay-card">
        <template #title>
          <div style="display: flex; align-items: center">
            <a-button type="text" @click="goBack" style="margin-right: 10px">
              <template #icon><LeftOutlined /></template>
            </a-button>
            <span>订单支付</span>
          </div>
        </template>
        <div v-if="vdata.orderDetail" class="step-container">
          <a-steps :current="vdata.currentStep" style="margin-bottom: 32px">
            <a-step title="确认订单信息" />
            <a-step title="填写备注信息" />
            <a-step title="选择支付方式" />
            <a-step title="完成支付" />
          </a-steps>

          <div class="step-content-area">
            <!-- 步骤一：确认订单信息 -->
            <div v-if="vdata.currentStep === 0">
              <a-descriptions title="订单详情" bordered :column="1">
                <a-descriptions-item label="订单标题">
                  {{ vdata.orderDetail.subject }}
                </a-descriptions-item>
                <a-descriptions-item label="订单描述">
                  {{ vdata.orderDetail.body || '无' }}
                </a-descriptions-item>
                <a-descriptions-item v-if="vdata.orderDetail.currency" label="交易货币">
                  {{ vdata.orderDetail.currency.toUpperCase() }}
                </a-descriptions-item>
                <a-descriptions-item label="支付金额">
                  <span style="color: #ff4d4f; font-weight: bold; font-size: 1.2em">
                    ¥{{ (vdata.orderDetail.amount / 100).toFixed(2) }}
                  </span>
                </a-descriptions-item>
                <!-- <a-descriptions-item v-if="vdata.orderDetail.createdAt" label="下单时间">
                  {{ formatDisplayTime(vdata.orderDetail.createdAt) }}
                </a-descriptions-item>
                <a-descriptions-item v-if="typeof vdata.orderDetail.maxUsageCount === 'number'" label="可用次数">
                  {{ (vdata.orderDetail.maxUsageCount || 0) - (vdata.orderDetail.currentUsageCount || 0) }} / {{ vdata.orderDetail.maxUsageCount }}
                </a-descriptions-item> -->
              </a-descriptions>
            </div>

            <!-- 步骤二：填写备注信息 -->
            <div v-if="vdata.currentStep === 1">
              <template
                v-if="
                  vdata.orderDetail.remarkConfig?.generalEnabled ||
                  vdata.orderDetail.remarkConfig?.invoiceEnabled
                "
              >
                <a-form
                  ref="remarkFormModel"
                  :model="vdata.remarkData"
                  layout="vertical"
                  :rules="vdata.remarkRules"
                >
                  <div v-if="vdata.orderDetail.remarkConfig?.generalEnabled">
                    <a-form-item
                      label="普通备注"
                      :name="
                        vdata.orderDetail.remarkConfig?.generalRequired
                          ? 'generalRemark'
                          : undefined
                      "
                    >
                      <a-textarea
                        v-model:value="vdata.remarkData.generalRemark"
                        placeholder="请输入备注信息"
                        :rows="3"
                      />
                    </a-form-item>
                  </div>
                  <div v-if="vdata.orderDetail.remarkConfig?.invoiceEnabled">
                    <a-typography-title :level="5" style="margin-bottom: 16px">
                      发票信息
                    </a-typography-title>
                    <template
                      v-if="
                        vdata.orderDetail.remarkConfig?.allowedInvoiceTypes &&
                        vdata.orderDetail.remarkConfig.allowedInvoiceTypes.length > 0
                      "
                    >
                      <a-form-item label="发票类型" name="invoiceType">
                        <a-radio-group
                          v-model:value="vdata.remarkData.invoiceType"
                          @change="handleInvoiceTypeChange"
                        >
                          <a-radio
                            v-if="
                              vdata.orderDetail.remarkConfig.allowedInvoiceTypes.includes(
                                'personal'
                              )
                            "
                            value="personal"
                          >
                            个人发票
                          </a-radio>
                          <a-radio
                            v-if="
                              vdata.orderDetail.remarkConfig.allowedInvoiceTypes.includes(
                                'corporate'
                              )
                            "
                            value="corporate"
                          >
                            企业发票
                          </a-radio>
                        </a-radio-group>
                      </a-form-item>
                      <!-- Personal Invoice Fields -->
                      <div
                        v-if="vdata.remarkData.invoiceType === 'personal'"
                        style="margin-top: 16px"
                      >
                        <a-form-item label="姓名" name="invoiceName">
                          <a-input
                            v-model:value="vdata.remarkData.invoiceName"
                            placeholder="请输入姓名"
                          />
                        </a-form-item>
                        <a-form-item label="邮箱" name="invoiceEmail">
                          <a-input
                            v-model:value="vdata.remarkData.invoiceEmail"
                            placeholder="请输入邮箱"
                          />
                        </a-form-item>
                      </div>
                      <!-- Corporate Invoice Fields -->
                      <div
                        v-if="vdata.remarkData.invoiceType === 'corporate'"
                        style="margin-top: 16px"
                      >
                        <a-form-item label="姓名" name="invoiceName">
                          <a-input
                            v-model:value="vdata.remarkData.invoiceName"
                            placeholder="请输入联系人姓名"
                          />
                        </a-form-item>
                        <a-form-item label="单位名称" name="invoiceCompanyName">
                          <a-input
                            v-model:value="vdata.remarkData.invoiceCompanyName"
                            placeholder="请输入单位名称"
                          />
                        </a-form-item>
                        <a-form-item label="税号" name="invoiceTaxId">
                          <a-input
                            v-model:value="vdata.remarkData.invoiceTaxId"
                            placeholder="请输入税号"
                          />
                        </a-form-item>
                        <a-form-item label="邮箱" name="invoiceEmail">
                          <a-input
                            v-model:value="vdata.remarkData.invoiceEmail"
                            placeholder="请输入邮箱"
                          />
                        </a-form-item>
                      </div>
                    </template>
                    <a-empty
                      v-else
                      description="商户未配置可选的发票类型"
                      style="margin-top: 10px"
                    />
                  </div>
                </a-form>
              </template>
              <template v-else>
                <!-- Use a-result for more prominent message -->
                <a-result status="info" title="无需填写备注" />
                <!-- sub-title="此订单无需填写备注信息，请直接进入下一步。" -->
                <!-- Optional: You can add an extra button here if needed, but standard next/prev should suffice -->
                <!-- <template #extra>
                    <a-button type="primary" @click="nextStep">下一步</a-button>
                  </template> -->
              </template>
            </div>

            <!-- 步骤三：选择支付方式 -->
            <div v-if="vdata.currentStep === 2">
              <a-typography-title :level="5" style="margin-bottom: 16px">
                请选择支付方式
              </a-typography-title>
              <a-radio-group
                v-model:value="vdata.selectedPayWayCode"
                size="large"
                class="payment-method-categories-container"
              >
                <!-- WeChat Payments -->
                <div class="payment-category" v-if="wechatPayWays.length > 0">
                  <a-typography-text strong class="payment-category-title">
                    微信支付
                  </a-typography-text>
                  <div class="payment-method-buttons-wrapper">
                    <a-radio-button
                      v-for="way in wechatPayWays"
                      :key="way.wayCode"
                      :value="way.wayCode"
                      class="payment-method-button"
                    >
                      <img
                        v-if="getPayWayIcon(way.wayCode)"
                        :src="getPayWayIcon(way.wayCode)"
                        :alt="way.wayName"
                        class="payment-method-icon"
                      />
                      <span>{{ way.wayName }}</span>
                    </a-radio-button>
                  </div>
                </div>

                <!-- Alipay Payments -->
                <div class="payment-category" v-if="alipayPayWays.length > 0">
                  <a-typography-text strong class="payment-category-title">
                    支付宝支付
                  </a-typography-text>
                  <div class="payment-method-buttons-wrapper">
                    <a-radio-button
                      v-for="way in alipayPayWays"
                      :key="way.wayCode"
                      :value="way.wayCode"
                      class="payment-method-button"
                    >
                      <img
                        v-if="getPayWayIcon(way.wayCode)"
                        :src="getPayWayIcon(way.wayCode)"
                        :alt="way.wayName"
                        class="payment-method-icon"
                      />
                      <span>{{ way.wayName }}</span>
                    </a-radio-button>
                  </div>
                </div>

                <!-- Other Payments -->
                <div class="payment-category" v-if="otherPayWays.length > 0">
                  <a-typography-text strong class="payment-category-title">
                    其他支付
                  </a-typography-text>
                  <div class="payment-method-buttons-wrapper">
                    <a-radio-button
                      v-for="way in otherPayWays"
                      :key="way.wayCode"
                      :value="way.wayCode"
                      class="payment-method-button"
                    >
                      <img
                        v-if="getPayWayIcon(way.wayCode)"
                        :src="getPayWayIcon(way.wayCode)"
                        :alt="way.wayName"
                        class="payment-method-icon"
                      />
                      <span>{{ way.wayName }}</span>
                    </a-radio-button>
                  </div>
                </div>
              </a-radio-group>
              <a-alert
                v-if="!vdata.payWays || vdata.payWays.length === 0"
                message="当前商户暂未配置可用支付方式，请联系商户。"
                type="warning"
                show-icon
                style="margin-top: 20px"
              />
            </div>

            <!-- 步骤四：完成支付 -->
            <div v-if="vdata.currentStep === 3">
              <a-result
                :status="vdata.paymentStatus"
                :title="vdata.paymentResultTitle"
                :sub-title="vdata.paymentResultSubTitle"
              >
                <template #extra>
                  <a-space>
                    <a-button type="primary" @click="goToList">返回订单列表</a-button>
                    <a-button v-if="vdata.paymentStatus === 'error'" @click="retryPayment">
                      重试支付
                    </a-button>
                  </a-space>
                </template>
              </a-result>
              <div
                v-if="
                  vdata.apiRes?.payDataType && // Changed: Check for payDataType instead of payData
                  vdata.paymentStatus !== 'success' &&
                  vdata.paymentStatus !== 'error'
                "
                style="text-align: center"
              >
                <!-- Payment data display (QR, button, form, image) -->
                <a-space direction="vertical" align="center" :size="16">
                  <!-- Handling for 'payurl' with loading state -->
                  <template v-if="vdata.apiRes.payDataType === 'payurl'">
                    <div v-if="!vdata.apiRes.payData" style="text-align: center; padding: 20px;">
                      <a-spin tip="正在获取支付数据..." />
                    </div>
                    <a-button
                      v-else
                      type="primary"
                      :href="String(vdata.apiRes.payData).replace(/`/g, '').trim() || undefined"
                      target="_blank"
                      size="large"
                    >
                      <template #icon><LinkOutlined /></template>
                      前往支付
                    </a-button>
                  </template>
                  <!-- Handling for 'url' and 'form' (original logic for these types) -->
                  <a-button
                    v-else-if="vdata.apiRes.payDataType === 'url'"
                    type="primary"
                    :href="String(vdata.apiRes.payData).replace(/`/g, '').trim() || undefined"
                    target="_blank"
                    size="large"
                    :disabled="!vdata.apiRes.payData"
                  >
                    <template #icon><LinkOutlined /></template>
                    前往支付
                  </a-button>
                  <template v-if="vdata.apiRes.payDataType === 'aliapp'">
                    <div v-if="!vdata.apiRes.payData" style="text-align: center; padding: 20px;">
                      <a-spin tip="正在唤起支付宝App..." />
                    </div>
                    <a-button
                      v-else
                      type="primary"
                      @click="handleAliappPay"
                      size="large"
                    >
                      <template #icon><MobileOutlined /></template>
                      唤起支付宝App支付
                    </a-button>
                  </template>
                  <template
                    v-if="
                      vdata.apiRes.payDataType === 'codeUrl' ||
                      vdata.apiRes.payDataType === 'qrCode'
                    "
                  >
                    <div v-if="!vdata.apiRes.payData" style="text-align: center; padding: 20px;">
                      <a-spin tip="正在生成二维码..." />
                    </div>
                    <qrcode-vue
                      v-else
                      :value="String(vdata.apiRes.payData).replace(/`/g, '').trim()"
                      :size="200"
                      level="H"
                    />
                  </template>
                  <template v-if="vdata.apiRes.payDataType === 'codeImgUrl'">
                     <div v-if="!vdata.apiRes.payData" style="text-align: center; padding: 20px;">
                      <a-spin tip="正在加载二维码图片..." />
                    </div>
                    <img
                      v-else-if="vdata.apiRes.payData" 
                      :src="String(vdata.apiRes.payData).replace(/`/g, '').trim()"
                      alt="支付二维码"
                      style="max-width: 200px; max-height: 200px; border: 1px solid #eee"
                    />
                  </template>
                  <!-- Add handling for 'form' if it requires rendering HTML -->
                  <template v-if="vdata.apiRes.payDataType === 'form'">
                    <div v-if="!vdata.apiRes.payData" style="text-align: center; padding: 20px;">
                      <a-spin tip="正在加载支付表单..." />
                    </div>
                    <div
                      v-else-if="vdata.apiRes.payData"
                      v-html="String(vdata.apiRes.payData).replace(/`/g, '').trim()"
                    />
                  </template>
                </a-space>

                <!-- Icons and instruction text -->
                <div style="margin-bottom: 16px; margin-top: 5px">
                  <img
                    v-if="showWxIcon"
                    src="@/assets/payTestImg/wx_app.svg"
                    alt="微信支付"
                    style="width: 24px; height: 24px; margin-right: 8px; vertical-align: middle"
                  />
                  <img
                    v-if="showAliIcon"
                    src="@/assets/payTestImg/ali_app.svg"
                    alt="支付宝支付"
                    style="width: 24px; height: 24px; margin-right: 8px; vertical-align: middle"
                  />
                  <span style="font-size: 14px; color: #555; vertical-align: middle">
                    {{ paymentInstructionText }}
                  </span>
                </div>
                <!-- Added notification -->
                <a-alert
                  v-if="vdata.paymentStatus === 'processing' || vdata.paymentStatus === ''"
                  message="支付状态可能存在延迟，请以您支付工具（如支付宝/微信）的通知为准，您无需在此页面等待。"
                  type="info"
                  show-icon
                  style="margin-top: 16px; display: inline-block"
                >
                  <template #icon><smile-outlined /></template>
                </a-alert>
              </div>
            </div>
          </div>

          <div class="steps-action">
            <a-space>
              <a-button v-if="vdata.currentStep > 0 && vdata.currentStep < 3" @click="prevStep">
                上一步
              </a-button>
              <a-button
                v-if="vdata.currentStep < 2"
                type="primary"
                @click="nextStep"
                :loading="vdata.submitLoading"
              >
                下一步
              </a-button>
              <a-button
                v-if="vdata.currentStep === 2"
                type="primary"
                @click="handleConfirmPay"
                :loading="vdata.submitLoading"
                :disabled="
                  !vdata.selectedPayWayCode || (vdata.payWays && vdata.payWays.length === 0)
                "
              >
                确认支付
              </a-button>
            </a-space>
          </div>
        </div>
        <a-empty
          v-if="!vdata.loading && !vdata.orderDetail"
          description="订单信息加载失败或订单不存在"
          style="padding-top: 50px"
        />
      </a-card>
    </div>
  </a-watermark>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  prefilledOrderPublicDetail,
  prefilledOrderPublicPayWays,
  prefilledOrderPublicCreatePayOrder,
} from '@/api/prefilledOrder'
import { message, Spin } from 'ant-design-vue'
import { LeftOutlined, LinkOutlined, MobileOutlined, SmileOutlined } from '@ant-design/icons-vue'
import QrcodeVue from 'qrcode.vue'
import type { Rule } from 'ant-design-vue/es/form'
import dayjs from 'dayjs'
import ReconnectingWebSocket from 'reconnectingwebsocket'
import { getWebSocketPrefix } from '@/api/manage'

const route = useRoute()
const router = useRouter()
const remarkFormModel = ref()

const vdata = reactive({
  loading: true,
  submitLoading: false,
  prefilledOrderId: route.params.id as string,
  orderDetail: null as any,
  currentStep: 0,
  remarkData: {
    generalRemark: '',
    invoiceType: '', // 'personal' | 'corporate'
    invoiceName: '',
    invoiceEmail: '',
    invoiceCompanyName: '',
    invoiceTaxId: '',
  },
  payWays: [] as any[],
  selectedPayWayCode: '',
  paymentStatus: '' as 'success' | 'error' | 'processing' | '', // 'success', 'error', 'processing'
  paymentResultTitle: '',
  paymentResultSubTitle: '',
  payurl: '',
  qrCodeUrl: '',
  payOrderWebSocket: null as ReconnectingWebSocket | null,
  apiRes: {
    payOrderId: '',
    amount: 0,
    successTime: '',
    errCode: '',
    errMsg: '',
    payDataType: '',
    payData: {},
  },
  remarkRules: {} as Record<string, Rule[]>,
})

// Computed properties for grouped payment ways
const wechatPayWays = computed(() => {
  return vdata.payWays.filter((way) => way.wayCode.startsWith('WX_'))
})

const alipayPayWays = computed(() => {
  return vdata.payWays.filter((way) => way.wayCode.startsWith('ALI_'))
})

const otherPayWays = computed(() => {
  return vdata.payWays.filter(
    (way) => !way.wayCode.startsWith('WX_') && !way.wayCode.startsWith('ALI_')
  )
})

const isMobile = computed(() => {
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }
  return false // Fallback for SSR or non-browser environments
})

const paymentInstructionText = computed(() => {
  const wayCode = vdata.selectedPayWayCode
  if (!vdata.apiRes || !vdata.apiRes.payDataType) {
    return '请按照指引完成支付'
  }
  const payDataType = vdata.apiRes.payDataType

  if (payDataType === 'aliapp') {
    return isMobile.value
      ? '请点击按钮唤起支付宝App完成支付。'
      : '此支付方式专为支付宝App设计，请在移动设备上操作。'
  }

  if (wayCode === 'WX_NATIVE' || wayCode === 'WX_JSAPI') {
    return '请使用微信“扫一扫”扫码支付'
  } else if (wayCode === 'ALI_QR' || wayCode === 'ALI_JSAPI' || wayCode === 'ALI_OC') {
    return '请使用支付宝“扫一扫”扫码支付'
  } else if (wayCode === 'QR_CASHIER') {
    return '支持微信、支付宝扫码'
  } else if (wayCode === 'WX_H5' || wayCode === 'ALI_WAP') {
    return '请在新窗口或手机浏览器中完成支付'
  }

  // Fallback based on payDataType if wayCode specific text isn't available or applicable
  if (payDataType === 'codeUrl' || payDataType === 'qrCode' || payDataType === 'codeImgUrl') {
    return '请扫描二维码完成支付'
  } else if (payDataType === 'url' || payDataType === 'payurl' || payDataType === 'form') {
    return '请点击按钮前往支付页面完成支付'
  }
  return '请按照指引完成支付'
})

const showWxIcon = computed(() => {
  const wayCode = vdata.selectedPayWayCode
  if (!wayCode) return false // Guard against undefined wayCode
  return wayCode.startsWith('WX_') || wayCode === 'QR_CASHIER'
})

const showAliIcon = computed(() => {
  const wayCode = vdata.selectedPayWayCode
  if (!wayCode) return false // Guard against undefined wayCode
  return wayCode.startsWith('ALI_') || wayCode === 'QR_CASHIER'
})

// Helper function to format time for display
const formatDisplayTime = (timeStr: string | undefined) => {
  if (!timeStr) return 'N/A'
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss')
}

const handleAliappPay = () => {
  if (vdata.apiRes?.payData && typeof vdata.apiRes.payData === 'string') {
    const payData = vdata.apiRes.payData.replace(/`/g, '').trim()
    if (isMobile.value) {
      try {
        const params = new URLSearchParams(payData)
        const paramObject = Object.fromEntries(params.entries())

        // 创建隐藏表单并提交
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = 'https://openapi.alipay.com/gateway.do ' // 支付宝网关

        // 动态添加表单字段
        for (const [key, value] of Object.entries(paramObject)) {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          form.appendChild(input)
        }

        document.body.appendChild(form)
        form.submit()
      } catch (e) {
        console.error('支付跳转失败:', e)
        message.error('支付初始化失败，请重试。')
      }
    } else {
      message.info('此支付方式需在支付宝App内完成。桌面端无法直接唤起。')
    }
  } else {
    message.error('支付参数不正确，无法处理该支付请求。')
  }
}

const wayCodeToNameMap: Record<string, string> = {
  QR_CASHIER: '聚合主扫',
  AUTO_BAR: '聚合被扫',
  ALI_BAR: '支付宝条码',
  ALI_JSAPI: '支付宝生活号',
  ALI_APP: '支付宝APP',  // 一般是在商家app里调用支付宝软件支付
  ALI_WAP: '手机支付',  // 跳转支付宝app支付
  ALI_PC: '电脑支付',
  ALI_OC: '支付宝订单码',
  ALI_QR: '支付宝二维码',
  WX_BAR: '微信条码',
  WX_JSAPI: '微信公众号/小程序',
  WX_APP: '微信APP',
  WX_H5: '微信H5',
  WX_NATIVE: '微信扫码',
  // Add other payment methods as needed
}

const getPayWayIcon = (wayCode: string): string => {
  const iconMap: Record<string, string> = {
    QR_CASHIER: 'qr_cashier.svg',
    AUTO_BAR: 'auto_bar.svg',
    ALI_BAR: 'ali_bar.svg',
    ALI_JSAPI: 'ali_jsapi.svg',
    ALI_APP: 'ali_app.svg',
    ALI_WAP: 'ali_wap.svg',
    ALI_PC: 'ali_pc.svg',
    ALI_OC: 'ali_oc.svg',
    ALI_QR: 'ali_qr.svg',
    WX_BAR: 'wx_bar.svg',
    WX_JSAPI: 'wx_jsapi.svg',
    // WX_LITE: 'wx_lite.svg', // Assuming you have a wx_lite.svg or similar
    WX_APP: 'wx_app.svg',
    WX_H5: 'wx_h5.svg',
    WX_NATIVE: 'wx_native.svg',
    // YSF_BAR: 'ysf_bar.svg', // Assuming you have these for YSF
    // YSF_JSAPI: 'ysf_jsapi.svg',
  }
  const iconFilename = iconMap[wayCode]
  if (iconFilename) {
    try {
      // This uses Vite's public asset handling. Ensure icons are in `src/assets/payTestImg/`
      // and this path is relative from this Vue file to that directory.
      // Adjust `../../assets/payTestImg/` if your folder structure is different.
      return new URL(`../../assets/payTestImg/${iconFilename}`, import.meta.url).href
    } catch (e) {
      console.error(`Error resolving icon path for ${wayCode}:`, e)
      return '' // Return empty string or a placeholder path on error
    }
  }
  return '' // Return empty string if no icon found for the wayCode
}

const fetchOrderDetail = async () => {
  vdata.loading = true
  try {
    const res = await prefilledOrderPublicDetail(vdata.prefilledOrderId)
    vdata.orderDetail = res
    updateRemarkRules()
    if (
      vdata.orderDetail.remarkConfig?.invoiceEnabled &&
      vdata.orderDetail.remarkConfig?.allowedInvoiceTypes?.length > 0
    ) {
      vdata.remarkData.invoiceType = vdata.orderDetail.remarkConfig.allowedInvoiceTypes[0]
    }
  } catch (error) {
    message.error('加载订单详情失败: ' + ((error as Error).message || '未知错误'))
    vdata.orderDetail = null
  } finally {
    vdata.loading = false
  }
}

const updateRemarkRules = () => {
  const rules: Record<string, Rule[]> = {}
  if (
    vdata.orderDetail?.remarkConfig?.generalEnabled &&
    vdata.orderDetail?.remarkConfig?.generalRequired
  ) {
    rules.generalRemark = [{ required: true, message: '请输入普通备注', trigger: 'blur' }]
  }
  if (vdata.orderDetail?.remarkConfig?.invoiceEnabled) {
    const invoiceRequired = vdata.orderDetail.remarkConfig.invoiceRequired
    if (vdata.remarkData.invoiceType === 'personal') {
      rules.invoiceName = [{ required: invoiceRequired, message: '请输入姓名', trigger: 'blur' }]
      rules.invoiceEmail = [
        { required: invoiceRequired, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
      ]
    } else if (vdata.remarkData.invoiceType === 'corporate') {
      rules.invoiceName = [
        { required: invoiceRequired, message: '请输入联系人姓名', trigger: 'blur' },
      ]
      rules.invoiceCompanyName = [
        { required: invoiceRequired, message: '请输入单位名称', trigger: 'blur' },
      ]
      rules.invoiceTaxId = [{ required: invoiceRequired, message: '请输入税号', trigger: 'blur' }]
      rules.invoiceEmail = [
        { required: invoiceRequired, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
      ]
    }
  }
  vdata.remarkRules = rules
  remarkFormModel.value?.clearValidate()
}

const handleInvoiceTypeChange = () => {
  if (vdata.remarkData.invoiceType === 'personal') {
    vdata.remarkData.invoiceCompanyName = ''
    vdata.remarkData.invoiceTaxId = ''
  }
  updateRemarkRules()
  remarkFormModel.value?.clearValidate()
}

const fetchPayWays = async () => {
  try {
    const res = await prefilledOrderPublicPayWays(vdata.prefilledOrderId)
    // Transform the array of strings into an array of objects
    vdata.payWays = (res || []).map((code: string) => ({
      wayCode: code,
      wayName: wayCodeToNameMap[code] || code, // Fallback to code if name not found
    }))

    if (vdata.payWays.length > 0) {
      // 检查是否存在ALI_QR支付方式
      const aliQrIndex = vdata.payWays.findIndex((way) => way.wayCode === 'ALI_QR')
      if (aliQrIndex !== -1) {
        // 如果存在ALI_QR，设置为默认支付方式
        vdata.selectedPayWayCode = 'ALI_QR'
      } else {
        // 如果不存在ALI_QR，使用第一个支付方式作为默认
        vdata.selectedPayWayCode = vdata.payWays[0].wayCode
      }
    }
  } catch (error) {
    message.error('加载支付方式失败: ' + ((error as Error).message || '未知错误'))
    vdata.payWays = []
  }
}

const nextStep = async () => {
  if (vdata.currentStep === 1) {
    // Still validate if remark form is shown and has rules
    if (
      vdata.orderDetail.remarkConfig?.generalEnabled ||
      vdata.orderDetail.remarkConfig?.invoiceEnabled
    ) {
      // Only validate if there are actual form elements to validate
      // This check might need to be more granular if form can be empty but still visible
      const formElementsPresent =
        vdata.orderDetail.remarkConfig?.generalEnabled ||
        (vdata.orderDetail.remarkConfig?.invoiceEnabled &&
          vdata.orderDetail.remarkConfig?.allowedInvoiceTypes &&
          vdata.orderDetail.remarkConfig.allowedInvoiceTypes.length > 0)

      if (formElementsPresent && Object.keys(vdata.remarkRules).length > 0) {
        try {
          await remarkFormModel.value.validate()
        } catch (error) {
          return // Validation failed
        }
      }
    }
  }

  // Simplified: always go to the next step sequentially up to step 2
  if (vdata.currentStep < 2) {
    vdata.currentStep++
    if (vdata.currentStep === 2) {
      await fetchPayWays()
    }
  }
}

const prevStep = () => {
  // Simplified: always go to the previous step sequentially
  if (vdata.currentStep > 0) {
    vdata.currentStep--
  }
}

const handleConfirmPay = async () => {
  if (!vdata.selectedPayWayCode) {
    message.warning('请选择支付方式')
    return
  }
  vdata.submitLoading = true
  try {
    let invoiceRemarkString: string | undefined = undefined
    // Check if invoice functionality is enabled in the order and if an invoice type has been selected by the user
    if (vdata.orderDetail.remarkConfig?.invoiceEnabled && vdata.remarkData.invoiceType) {
      const parts: string[] = []
      parts.push(`发票类型: ${vdata.remarkData.invoiceType === 'personal' ? '个人' : '企业'}`)

      if (vdata.remarkData.invoiceName) {
        parts.push(
          `${vdata.remarkData.invoiceType === 'personal' ? '姓名' : '联系人姓名'}: ${vdata.remarkData.invoiceName}`
        )
      }
      if (vdata.remarkData.invoiceEmail) {
        parts.push(`邮箱: ${vdata.remarkData.invoiceEmail}`)
      }
      // Add corporate-specific fields only if the invoice type is 'corporate'
      if (vdata.remarkData.invoiceType === 'corporate') {
        if (vdata.remarkData.invoiceCompanyName) {
          parts.push(`单位名称: ${vdata.remarkData.invoiceCompanyName}`)
        }
        if (vdata.remarkData.invoiceTaxId) {
          parts.push(`税号: ${vdata.remarkData.invoiceTaxId}`)
        }
      }

      // If any parts were added (which will be true if invoiceType was selected), join them.
      if (parts.length > 0) {
        invoiceRemarkString = parts.join('; ')
      }
    }

    // Construct the request body (params for the API call)
    const bodyParams: any = {
      wayCode: vdata.selectedPayWayCode,
    }

    if (vdata.orderDetail.remarkConfig?.generalEnabled && vdata.remarkData.generalRemark) {
      bodyParams.generalRemark = vdata.remarkData.generalRemark
    }
    if (invoiceRemarkString) {
      bodyParams.invoiceRemark = invoiceRemarkString
    }

    // console.log('Calling API with prefilledOrderId:', vdata.prefilledOrderId, 'Body:', JSON.stringify(bodyParams, null, 2));

    // Call the API with prefilledOrderId as the first argument and bodyParams as the second
    const res = await prefilledOrderPublicCreatePayOrder(vdata.prefilledOrderId, bodyParams)
    vdata.currentStep = 3
    vdata.apiRes = res
    vdata.paymentStatus = 'processing'
    vdata.paymentResultTitle = '订单提交成功，等待支付结果'
    vdata.paymentResultSubTitle = `支付订单号: ${res.payOrderId || 'N/A'}`
    vdata.payurl = res.payurl
    vdata.qrCodeUrl = res.qrCodeUrl || ''

    // 初始化WebSocket监听支付状态
    if (vdata.payOrderWebSocket) {
      vdata.payOrderWebSocket.close()
    }

    // const wsUrl = `${getWebSocketPrefix()}/api/anon/ws/payOrder/${res.payOrderId}/${new Date().getTime()}`
    // TODO: 暂时使用本地的WebSocket地址
    const wsUrl = `ws://localhost:9218/api/anon/ws/payOrder/${res.payOrderId}/${new Date().getTime()}`
    vdata.payOrderWebSocket = new ReconnectingWebSocket(wsUrl)

    vdata.payOrderWebSocket.onopen = () => {
      console.log('WebSocket连接成功')
    }
    vdata.payOrderWebSocket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      console.log('WebSocket收到消息', data)
      // Handle WebSocket messages for payment status updates
      switch (data.state) {
        case 0: // 订单生成
          vdata.paymentStatus = 'processing'
          vdata.paymentResultTitle = '订单处理中'
          vdata.paymentResultSubTitle = '订单已生成，等待支付确认...'
          // Do not close WebSocket, keep listening for updates
          break
        case 1: // 支付中
          vdata.paymentStatus = 'processing'
          vdata.paymentResultTitle = '支付处理中'
          vdata.paymentResultSubTitle = '订单正在支付中，请稍候...'
          // Do not close WebSocket, keep listening for updates
          break
        case 2: // 支付成功
          handleClose() // Close WebSocket as it's a final state
          vdata.paymentStatus = 'success'
          vdata.paymentResultTitle = '支付成功'
          // Update apiRes with details from WebSocket if available, otherwise use existing
          vdata.apiRes.payOrderId = data.payOrderId || vdata.apiRes.payOrderId || 'N/A'
          vdata.apiRes.amount = data.amount || vdata.apiRes.amount // Assuming amount is in cents
          vdata.apiRes.successTime = data.successTime || vdata.apiRes.successTime
          vdata.paymentResultSubTitle = `订单号: ${vdata.apiRes.payOrderId}`
          break
        case 3: // 支付失败
          handleClose() // Close WebSocket as it's a final state
          vdata.paymentStatus = 'error'
          vdata.paymentResultTitle = '支付失败'
          vdata.paymentResultSubTitle = data.errMsg || '支付失败，请重试'
          break
        case 4: // 已撤销
          handleClose() // Close WebSocket as it's a final state
          vdata.paymentStatus = 'error' // Consider a 'cancelled' status if UI supports it
          vdata.paymentResultTitle = '订单已撤销'
          vdata.paymentResultSubTitle = data.errMsg || '此订单已被撤销'
          break
        case 5: // 已退款
          handleClose() // Close WebSocket as it's a final state
          vdata.paymentStatus = 'error' // Consider a 'refunded' status
          vdata.paymentResultTitle = '订单已退款'
          vdata.paymentResultSubTitle = data.errMsg || '此订单已完成退款'
          break
        case 6: // 订单关闭
          handleClose() // Close WebSocket as it's a final state
          vdata.paymentStatus = 'error' // Consider a 'closed' status
          vdata.paymentResultTitle = '订单已关闭'
          vdata.paymentResultSubTitle = data.errMsg || '此订单已关闭'
          break
        default: // Other unknown states
          handleClose() // Close on unknown states as they are likely errors or unhandled final states.
          vdata.paymentStatus = 'error'
          vdata.paymentResultTitle = '支付状态异常'
          vdata.paymentResultSubTitle =
            data.errMsg || `支付处理遇到未知状态: ${data.state !== undefined ? data.state : '未知'}`
          break
      }
    }

    if (res.payurl && res.action === 'redirect') {
      window.location.href = res.payurl
    }
  } catch (error) {
    vdata.currentStep = 3
    vdata.paymentStatus = 'error'
    vdata.paymentResultTitle = '订单提交失败'

    // Properly extract error message
    let errorMessage = '请检查网络或联系商户' // Default message
    if (error && typeof (error as any).msg === 'string') {
      errorMessage = (error as any).msg
    } else if (error instanceof Error && typeof error.message === 'string') {
      errorMessage = error.message
    }
    vdata.paymentResultSubTitle = errorMessage

    // Log for debugging
    // console.error("Payment submission failed. Error object:", JSON.stringify(error, null, 2));
    // console.error("Displayed subtitle on error:", errorMessage);
  } finally {
    vdata.submitLoading = false
  }
}

const handleClose = () => {
  if (vdata.payOrderWebSocket) {
    vdata.payOrderWebSocket.close()
  }
}

const goBack = () => {
  router.back()
}

const goToList = () => {
  router.push('/prefilledOrder/publicPay')
}

const retryPayment = () => {
  vdata.currentStep = 2
  vdata.paymentStatus = ''
  vdata.payurl = ''
  vdata.qrCodeUrl = ''
  fetchPayWays()
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
:deep(.ant-watermark) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.pay-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pay-card :deep(.ant-card-head) {
  flex-shrink: 0;
}

.pay-card :deep(.ant-card-body) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;
}

.pay-card :deep(.ant-spin-nested-loading),
.pay-card :deep(.ant-spin-container) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.step-container {
  margin: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.pay-card :deep(.ant-steps) {
  flex-shrink: 0;
  margin-bottom: 32px !important;
  box-sizing: border-box;
  width: 100%;
}

.step-content-area {
  padding: 8px;
  border-radius: 2px;
  flex-grow: 1;
  overflow-y: auto;
}

.steps-action {
  margin-top: 32px;
  text-align: right;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
}

.loading-state-placeholder {
  flex-grow: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
  box-sizing: border-box;
}

.empty-container {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  width: 100%;
  margin: 10px;
  box-sizing: border-box;
}

:deep(.ant-form-item) {
  margin-bottom: 20px;
}

:deep(.ant-descriptions-item-label) {
  width: 100px;
}

/* New styles for payment categories layout */
.payment-method-categories-container {
  display: flex;
  flex-direction: row; /* Lay out categories horizontally */
  flex-wrap: wrap; /* Allow categories to wrap */
  gap: 24px; /* Space between categories */
  align-items: flex-start; /* Align categories at the top */
  width: 100%; /* Ensure it takes full width to allow wrapping */
}

.payment-category {
  display: flex;
  flex-direction: column; /* Stack title above buttons */
  gap: 8px; /* Space between title and buttons wrapper */
  /* flex: 1; */ /* Uncomment if you want categories to grow equally, might not be desired */
}

.payment-category-title {
  display: block;
  /* margin-bottom: 8px; Provided by gap on .payment-category */
}

.payment-method-buttons-wrapper {
  display: flex;
  flex-wrap: wrap; /* Allow buttons within a category to wrap */
  gap: 12px; /* Space between buttons */
}

/* Style for the a-radio wrapper to make it look like a button */
.payment-method-button.ant-radio-wrapper {
  display: inline-flex; /* Use inline-flex for better alignment and sizing */
  align-items: center;
  padding: 8px 12px !important; /* Adjust padding as needed */
  border-radius: 8px !important;
  border: 1px solid #d9d9d9;
  background-color: #ffffff;
  line-height: 1.5715;
  color: rgba(0, 0, 0, 0.85);
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  margin: 0; /* Remove default margin from ant-radio-wrapper */
}

/* Hide the actual radio input and its default circle */
.payment-method-button.ant-radio-wrapper :deep(.ant-radio-input),
.payment-method-button.ant-radio-wrapper :deep(.ant-radio-inner) {
  display: none !important;
}

/* Styles for the selected payment method button */
.payment-method-button.ant-radio-wrapper-checked {
  border-color: #1890ff !important;
  background-color: #e6f7ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  position: relative;
  z-index: 1;
}

/* Keep span for text styling as before, but ensure it applies within the new structure */
.payment-method-button.ant-radio-wrapper-checked span {
  color: rgba(0, 0, 0, 0.85); /* Darker text for better contrast */
  font-weight: 500;
}

.payment-method-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .pay-card :deep(.ant-card-body) {
    padding: 24px;
  }
  .step-container {
    margin: 24px;
  }
  :deep(.ant-descriptions-item-label) {
    width: 80px;
  }
  .step-content-area {
    padding: 6px;
  }
  .steps-action {
    text-align: center;
  }
  .steps-action .ant-space {
    width: 100%;
    justify-content: center;
  }
  .steps-action .ant-space .ant-btn {
    flex-grow: 1;
    margin-left: 4px !important;
    margin-right: 4px !important;
  }
  .steps-action .ant-space .ant-btn:first-child {
    margin-left: 0 !important;
  }
  .steps-action .ant-space .ant-btn:last-child {
    margin-right: 0 !important;
  }

  /* Adjust categories for mobile */
  .payment-method-categories-container {
    flex-direction: column; /* Stack categories vertically on mobile */
    gap: 16px;
  }

  /* Adjust buttons within each category for mobile if needed */
  .payment-method-buttons-wrapper {
    /* flex-direction: column; */ /* This would stack buttons, current wrap is likely fine */
  }
  /* If you want full-width buttons on mobile within each category: */
  /*
  .payment-category .payment-method-button {
    width: 100%;
    justify-content: center;
  }
  */
}
</style>
