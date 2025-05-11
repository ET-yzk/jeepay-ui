<template>
  <a-drawer
    width="50%"
    placement="right"
    :closable="true"
    :open="vdata.open"
    :title="vdata.open === true ? '预填订单详情' : ''"
    @close="onClose"
  >
    <a-row :gutter="[16, 16]">
      <!-- 订单基本信息 -->
      <a-col :span="24">
        <a-card title="订单基本信息" size="small" >
          <a-row :gutter="16">
            <a-col :span="12">
              <a-descriptions :column="1" :labelStyle="{ width: '120px', paddingRight: '10px', paddingLeft: '10px'}" style="margin-top: 10px;" >
                <a-descriptions-item label="预填订单号">
                  <a-tag color="purple">{{ vdata.detailData.prefilledOrderId }}</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="应用AppId">{{ vdata.detailData.appId }}</a-descriptions-item>
                <a-descriptions-item label="订单标题">{{ vdata.detailData.subject }}</a-descriptions-item>
              </a-descriptions>
            </a-col>
            <a-col :span="12">
              <a-descriptions :column="1" :labelStyle="{ width: '120px', paddingRight: '10px', paddingLeft: '10px' }" style="margin-top: 10px;" >
                <a-descriptions-item label="支付金额">
                  <a-tag color="green">{{ vdata.detailData.amount }}</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="货币代码">{{ vdata.detailData.currency }}</a-descriptions-item>
                <a-descriptions-item label="状态">
                  <a-tag :color="vdata.detailData.status === 1 ? 'green' : 'red'">
                    {{ vdata.detailData.status === 1 ? '启用' : '禁用' }}
                  </a-tag>
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
          </a-row>
          <a-descriptions :column="1" :labelStyle="{ width: '120px', paddingRight: '10px', paddingLeft: '10px' }" style="margin-top: 10px;" >
            <a-descriptions-item label="订单描述">{{ vdata.detailData.body }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>

      <!-- 使用情况 -->
      <a-col :span="12">
        <a-card title="使用情况" size="small">
          <a-descriptions :column="1" :labelStyle="{ width: '120px', paddingRight: '10px', paddingLeft: '10px' }" style="margin-top: 10px;" >
            <a-descriptions-item label="最大使用次数">{{ vdata.detailData.maxUsageCount || '无限制' }}</a-descriptions-item>
            <a-descriptions-item label="当前使用次数">{{ vdata.detailData.currentUsageCount }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>

      <!-- 时间信息 -->
      <a-col :span="12">
        <a-card title="时间信息" size="small">
          <a-descriptions :column="1" :labelStyle="{ width: '120px', paddingRight: '10px', paddingLeft: '10px' }" style="margin-top: 10px;" >
            <a-descriptions-item label="有效状态">
              <template v-if="!vdata.detailData.startTime || dayjs().isAfter(dayjs.utc(vdata.detailData.startTime).local())">
                <template v-if="!vdata.detailData.endTime || dayjs().isBefore(dayjs.utc(vdata.detailData.endTime).local())">
                  <a-tag color="green">生效中</a-tag>
                </template>
                <template v-else>
                  <a-tag color="red">已过期</a-tag>
                </template>
              </template>
              <template v-else>
                <a-tag color="orange">未生效</a-tag>
              </template>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ vdata.detailData.createdAt ? dayjs.utc(vdata.detailData.createdAt).local().format('YYYY-MM-DD HH:mm') : '' }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ vdata.detailData.updatedAt ? dayjs.utc(vdata.detailData.updatedAt).local().format('YYYY-MM-DD HH:mm') : '' }}</a-descriptions-item>
            <a-descriptions-item label="生效开始时间">{{ vdata.detailData.startTime ? dayjs.utc(vdata.detailData.startTime).local().format('YYYY-MM-DD HH:mm') : '立即生效' }}</a-descriptions-item>
            <a-descriptions-item label="生效结束时间">{{ vdata.detailData.endTime ? dayjs.utc(vdata.detailData.endTime).local().format('YYYY-MM-DD HH:mm') : '长期有效' }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>

      <!-- 备注配置 -->
      <a-col :span="24">
        <a-card title="备注项配置" size="small">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-descriptions :column="1" :labelStyle="{ width: '120px', paddingRight: '10px', paddingLeft: '10px' }" style="margin-top: 10px;" >
                <a-descriptions-item label="普通备注">
                  <a-tag :color="vdata.detailData.remarkConfig.generalEnabled ? 'green' : 'red'">
                    {{ vdata.detailData.remarkConfig.generalEnabled ? '启用' : '禁用' }}
                  </a-tag>
                  <a-tag v-if="vdata.detailData.remarkConfig.generalEnabled" :color="vdata.detailData.remarkConfig.generalRequired ? 'orange' : 'cyan'">
                    {{ vdata.detailData.remarkConfig.generalRequired ? '必填' : '选填' }}
                  </a-tag>
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
            <a-col :span="12">
              <a-descriptions :column="1" :labelStyle="{ width: '120px', paddingRight: '10px', paddingLeft: '10px' }" style="margin-top: 10px;" >
                <a-descriptions-item label="发票备注">
                  <a-tag :color="vdata.detailData.remarkConfig.invoiceEnabled ? 'green' : 'red'">
                    {{ vdata.detailData.remarkConfig.invoiceEnabled ? '启用' : '禁用' }}
                  </a-tag>
                  <a-tag v-if="vdata.detailData.remarkConfig.invoiceEnabled" :color="vdata.detailData.remarkConfig.invoiceRequired ? 'orange' : 'cyan'">
                    {{ vdata.detailData.remarkConfig.invoiceRequired ? '必填' : '选填' }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="发票类型" v-if="vdata.detailData.remarkConfig.invoiceEnabled && vdata.detailData.remarkConfig.allowedInvoiceTypes">
                  <div >
                    <a-tag 
                      v-for="(type, index) in vdata.detailData.remarkConfig.allowedInvoiceTypes" 
                      :key="index"
                      style="margin-right: 8px; margin-bottom: 8px;"
                      color="blue"
                    >
                      {{ type === 'corporate' ? '企业发票' : type === 'personal' ? '个人发票' : type }}
                    </a-tag>
                  </div>
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
  </a-drawer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getPrefilledOrderDetail } from '@/api/prefilledOrder'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

// 配置dayjs使用UTC插件
dayjs.extend(utc)

const defaultRemarkConfig = () => ({
  generalEnabled: false,
  generalRequired: false,
  invoiceEnabled: false,
  invoiceRequired: false,
  allowedInvoiceTypes: []
})

const vdata = reactive({
  open: false,
  detailData: {
    prefilledOrderId: '',
    appId: '',
    subject: '',
    amount: '',
    currency: '',
    body: '',
    status: 1,
    maxUsageCount: '',
    currentUsageCount: '',
    createdAt: '',
    updatedAt: '',
    startTime: '',
    endTime: '',
    remarkConfig: defaultRemarkConfig()
  }
})

function show(prefilledOrderId) {
  vdata.open = true
  getPrefilledOrderDetail(prefilledOrderId).then(res => {
    vdata.detailData = res
  })
}

function onClose() {
  vdata.open = false
}

defineExpose({ show })
</script>