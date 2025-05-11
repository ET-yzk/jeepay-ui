<template>
  <a-drawer
    v-model:open="vdata.open"
    :title="vdata.drawerTitle"
    width="50%"
    :maskClosable="false"
    @close="onClose"
    :destroyOnClose="true"
    :body-style="{ paddingBottom: '60px' }"
  >
    <a-form ref="infoFormModel" :model="vdata.saveObject" layout="vertical" :rules="vdata.rules">
      <a-row :gutter="16">
        <a-col :span="12" v-if="!vdata.isAdd">
          <a-form-item label="预填订单号" name="prefilledOrderId">
            <a-input :value="vdata.recordId" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="应用AppId" name="appId">
            <a-select
              v-model:value="vdata.saveObject.appId"
              placeholder="请选择应用"
              :disabled="!vdata.isAdd"
              @change="handleAppChange"
            >
              <a-select-option v-for="app in vdata.mchAppList" :key="app.appId" :value="app.appId">
                {{ app.appName }} ({{ app.appId }})
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="订单标题" name="subject">
            <a-input v-model:value="vdata.saveObject.subject" placeholder="请输入订单标题"  />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="支付金额 (元)" name="amount">
            <a-input-number
              v-model:value="vdata.saveObject.amount"
              placeholder="请输入支付金额"
              :min="0.01"
              :precision="2"
              style="width: 100%"
              
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="货币代码" name="currency">
            <a-input v-model:value="vdata.saveObject.currency" placeholder="如: cny"  />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="订单描述" name="body">
            <a-textarea v-model:value="vdata.saveObject.body" placeholder="请输入订单描述" :rows="2"  />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item label="备注项配置">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="普通备注" name="remarkConfig.generalEnabled">
                  <a-switch v-model:checked="vdata.saveObject.remarkConfig.generalEnabled"  />
                  <span v-if="vdata.saveObject.remarkConfig.generalEnabled" style="margin-left: 10px;">
                    必填：<a-form-item-rest>
                      <a-switch v-model:checked="vdata.saveObject.remarkConfig.generalRequired" size="small"  />
                    </a-form-item-rest>
                  </span>
                </a-form-item>
                <a-form-item v-if="vdata.saveObject.remarkConfig.generalEnabled" label="小提示">
                  <span class="ant-form-text" style="color: #999;">如果需要告知用户输入的普通备注内容，可以在订单描述中说明哦～</span>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="发票备注" name="remarkConfig.invoiceEnabled">
                  <a-switch v-model:checked="vdata.saveObject.remarkConfig.invoiceEnabled"  />
                  <span v-if="vdata.saveObject.remarkConfig.invoiceEnabled" style="margin-left: 10px;">
                    必填：<a-form-item-rest>
                      <a-switch v-model:checked="vdata.saveObject.remarkConfig.invoiceRequired" size="small"  />
                    </a-form-item-rest>
                  </span>
                </a-form-item>
                <a-form-item v-if="vdata.saveObject.remarkConfig.invoiceEnabled" label="发票类型" name="remarkConfig.allowedInvoiceTypes">
                  <a-checkbox-group v-model:value="vdata.saveObject.remarkConfig.allowedInvoiceTypes">
                    <a-checkbox value="personal">个人发票</a-checkbox>
                    <a-checkbox value="corporate">企业发票</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="状态" name="status">
            <a-radio-group v-model:value="vdata.saveObject.status" >
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">禁用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="最大成功支付次数" name="maxUsageCount">
            <a-input-number
              v-model:value="vdata.saveObject.maxUsageCount"
              placeholder="留空表示不限制"
              :min="1"
              style="width: 100%"
              
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="生效开始时间" name="startTime">
            <a-date-picker
              v-model:value="vdata.saveObject.startTime"
              show-time
              format="YYYY-MM-DD HH:mm"
              placeholder="留空表示立即生效"
              style="width: 100%"
              
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="生效结束时间" name="endTime">
            <a-date-picker
              v-model:value="vdata.saveObject.endTime"
              show-time
              format="YYYY-MM-DD HH:mm"
              placeholder="留空表示长期有效"
              style="width: 100%"
              
            />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="!vdata.isAdd">
          <a-form-item label="当前使用次数" name="currentUsageCount">
            <a-input-number
              v-model:value="vdata.saveObject.currentUsageCount"
              disabled
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="!vdata.isAdd">
          <a-form-item label="创建时间" name="createdAt">
            <a-input v-model:value="vdata.saveObject.createdAt" disabled />
          </a-form-item>
        </a-col>
        <!-- <a-col :span="12" v-if="!vdata.isAdd">
          <a-form-item label="更新时间" name="updatedAt">
            <a-input v-model:value="vdata.saveObject.updatedAt" disabled />
          </a-form-item>
        </a-col> -->
      </a-row>
    </a-form>

    <div class="drawer-btn-center" >
      <a-button @click="onClose" :style="{ marginRight: '8px' }">取消</a-button>
      <a-button type="primary" @click="onSubmit" :loading="vdata.submitLoading">保存</a-button>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { reactive, ref, getCurrentInstance, watch } from 'vue'
import { API_URL_MCH_APP, req as commonReq } from '@/api/manage' // 复用查询应用列表的API
import { createPrefilledOrder, getPrefilledOrderDetail, updatePrefilledOrder, getPayWaysByAppId } from '@/api/prefilledOrder'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

const { $infoBox } = getCurrentInstance()!.appContext.config.globalProperties

// 启用UTC插件
dayjs.extend(utc)

const props = defineProps({
  callbackFunc: { type: Function, default: () => {} }
})

const infoFormModel = ref()

const defaultRemarkConfig = () => ({
  allowedInvoiceTypes: ['personal', 'corporate'],
  generalEnabled: false,
  generalRequired: false,
  invoiceEnabled: true,
  invoiceRequired: false
})

const vdata = reactive({
  isAdd: true,
  open: false,
  drawerTitle: '新增预填订单',
  recordId: null as string | null,
  saveObject: {
    appId: null,
    subject: '',
    amount: null as number | null, // 元，提交时转为分
    currency: 'cny',
    body: '',
    remarkConfig: defaultRemarkConfig(),
    status: 1,
    startTime: null as any,
    endTime: null as any,
    maxUsageCount: null as number | null,
    currentUsageCount: null as number | null,
    createdAt: null as string | null,
    updatedAt: null as string | null
  },
  rules: {
    appId: [{ required: true, message: '请选择应用AppId', trigger: 'change' }],
    subject: [{ required: true, message: '请输入订单标题', trigger: 'blur' }],
    body: [{ required: true, message: '请输入订单描述', trigger: 'blur' }],
    amount: [{ required: true, type: 'number', message: '请输入有效的支付金额', trigger: 'blur', min: 0.01 }],
    currency: [{ required: true, message: '请输入三位货币代码', trigger: 'blur', len: 3 }],
    status: [{ required: true, message: '请选择状态' }],
    startTime: [
      {
        validator: async (_rule, value) => {
          if (value && vdata.saveObject.endTime && dayjs(value).isAfter(dayjs(vdata.saveObject.endTime))) {
            return Promise.reject(new Error('生效开始时间不能晚于结束时间'))
          }
          return Promise.resolve()
        },
        trigger: 'change'
      }
    ],
    endTime: [
      {
        validator: async (_rule, value) => {
          if (value && vdata.saveObject.startTime && dayjs(value).isBefore(dayjs(vdata.saveObject.startTime))) {
            return Promise.reject(new Error('生效结束时间不能早于开始时间'))
          }
          return Promise.resolve()
        },
        trigger: 'change'
      }
    ]
  },
  mchAppList: [] as any[],
  submitLoading: false
})

// 加载商户应用列表
const loadMchApps = async () => {
  try {
    const res = await commonReq.list(API_URL_MCH_APP, { pageSize: -1, state: 1 }) // 查询启用的应用
    vdata.mchAppList = res.records || []
    if (vdata.mchAppList.length > 0 && vdata.isAdd) {
      // 如果是新增，且有可用应用，默认选中第一个
      // vdata.saveObject.appId = vdata.mchAppList[0].appId
    }
  } catch (e) {
    message.error('加载应用列表失败')
  }
}

const show = async (recordId?: string, type?: 'edit') => {
  vdata.isAdd = !recordId
  vdata.recordId = recordId || null
  vdata.open = true
  vdata.drawerTitle = vdata.isAdd ? '新增预填订单' : '修改预填订单'
  vdata.saveObject = {
    appId: null,
    subject: '',
    amount: null,
    currency: 'cny',
    body: '',
    remarkConfig: defaultRemarkConfig(),
    status: 1,
    startTime: vdata.isAdd ? dayjs().local() : null,
    endTime: null,
    maxUsageCount: null,
    currentUsageCount: null,
    createdAt: null,
    updatedAt: null
  }
  await loadMchApps() // 确保应用列表已加载

  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }

  if (!vdata.isAdd && recordId) {
    try {
      const res = await getPrefilledOrderDetail(recordId)
      // 金额从分转为元
      const amountInYuan = res.amount ? res.amount / 100 : null
      vdata.saveObject = {
        ...res,
        amount: amountInYuan,
        startTime: res.startTime ? dayjs.utc(res.startTime).local() : null,
        endTime: res.endTime ? dayjs.utc(res.endTime).local() : null,
        remarkConfig: res.remarkConfig || defaultRemarkConfig() // 确保remarkConfig存在
      }
    } catch (e) {
      message.error('加载预填订单详情失败')
      onClose()
    }
  }
}

const onClose = () => {
  vdata.open = false
  vdata.submitLoading = false
}

const onSubmit = async () => {
  
  try {
    await infoFormModel.value.validate()
    vdata.submitLoading = true
    const params = {
      ...vdata.saveObject,
      amount: vdata.saveObject.amount ? Math.round(vdata.saveObject.amount * 100) : undefined, // 元转分
      startTime: vdata.saveObject.startTime ? dayjs(vdata.saveObject.startTime).utc().format('YYYY-MM-DD HH:mm:ss') : undefined,
      endTime: vdata.saveObject.endTime ? dayjs(vdata.saveObject.endTime).utc().format('YYYY-MM-DD HH:mm:ss') : undefined
    }

    if (vdata.isAdd) {
      await createPrefilledOrder(params)
      message.success('新增成功')
    } else if (vdata.recordId) {
      await updatePrefilledOrder(vdata.recordId, params)
      message.success('修改成功')
    }
    props.callbackFunc() // 刷新列表
    onClose()
  } catch (errorInfo) {
    if (typeof errorInfo === 'string') {
        message.error(errorInfo)
    } else {
        console.log('Form Validate Failed:', errorInfo)
    }
  } finally {
    vdata.submitLoading = false
  }
}

const handleAppChange = (appId: string) => {
  // console.log('Selected App ID:', appId)
  // 如果需要根据appId加载其他信息，可以在这里处理
}

// 暴露方法
defineExpose({ show })
</script>

<style lang="less" scoped>
</style>