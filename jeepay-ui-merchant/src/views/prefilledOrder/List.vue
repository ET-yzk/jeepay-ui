<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <jeepay-text-up placeholder="预填订单号" v-model:value="vdata.searchData.prefilledOrderId" />
            <jeepay-text-up placeholder="应用AppId" v-model:value="vdata.searchData.appId" />
            <jeepay-text-up placeholder="订单标题/描述" v-model:value="vdata.searchData.description" />
            <!-- <jeepay-text-up placeholder="订单描述信息" v-model:value="vdata.searchData.body" /> -->
            <a-range-picker
              :show-time="{ format: 'HH:mm:ss' }"
              format="YYYY-MM-DD HH:mm:ss"
              :placeholder="['开始时间', '结束时间']"
              class="table-head-layout"
              @change="(dates) => {
                vdata.searchData.usageStart = dates ? dayjs(dates[0]).utc().format('YYYY-MM-DD HH:mm:ss') : null;
                vdata.searchData.usageEnd = dates ? dayjs(dates[1]).utc().format('YYYY-MM-DD HH:mm:ss') : null;
              }"
            />
            <a-select v-model:value="vdata.searchData.status" placeholder="状态" class="table-head-layout">
              <a-select-option value="">全部</a-select-option>
              <a-select-option :value="0">禁用</a-select-option>
              <a-select-option :value="1">启用</a-select-option>
            </a-select>
            <span class="table-page-search-submitButtons" style="flex-grow: 0; flex-shrink: 0">
              <a-button type="primary" @click="queryFunc" :loading="vdata.btnLoading">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => (vdata.searchData = {
                prefilledOrderId: '',
                appId: '',
                status: '',
                // subject: '',
                // body: '',
                description: '',
                usageStart: null,
                usageEnd: null
              })">重置</a-button>
            </span>
          </div>
        </a-form>
      </div>
      <!-- 列表渲染 -->
      <JeepayTable
        @btnLoadClose="vdata.btnLoading = false"
        ref="infoTable"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="vdata.tableColumns"
        :searchData="vdata.searchData"
        rowKey="prefilledOrderId"
      >
        <template #opRow>
          <a-button v-if="$access('ENT_PREFILLED_ORDER_ADD')" type="primary" @click="addFunc">新建</a-button>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'prefilledOrderId'">
            <b>{{ record.prefilledOrderId }}</b>
            <a-tooltip title="点击复制公开支付页地址">
              <copy-outlined v-if="record.publicPayUrl" @click="copyText(record.publicPayUrl)" style="margin-left: 5px; color: #1890ff; cursor: pointer;" />
            </a-tooltip>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 0 ? 'red' : 'green'">
              {{ record.status === 0 ? '禁用' : '启用' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'amount'">
            <span>{{ (record.amount / 100).toFixed(2) }} {{ record.currency ? record.currency.toUpperCase() : '' }}</span>
          </template>
          <template v-if="column.key === 'usage'">
            <div class="usage-tags">
              <a-tag v-if="record.overSoldCount && record.overSoldCount !== 0" color="red" class="mb-1" style="margin-bottom: 5px;">
                超卖: {{ record.overSoldCount }}
              </a-tag>
              <a-tag color="blue"  class="mb-1">
                {{ record.currentUsageCount == null ? 0 : record.currentUsageCount + record.overSoldCount }} / {{ record.maxUsageCount == null ? '∞' : record.maxUsageCount }}
              </a-tag>
            </div>
          </template>
          <template v-if="column.key === 'validDate'">
            <div>
              <a-tag :color="getValidityStatus(record).color" class="mb-1">
                {{ getValidityStatus(record).text }}
              </a-tag>
              <div>
                <span v-if="record.startTime || record.endTime">
                  {{ record.startTime ? dayjs.utc(record.startTime).local().format('YYYY-MM-DD') : '长期' }} 至
                  {{ record.endTime ? dayjs.utc(record.endTime).local().format('YYYY-MM-DD') : '长期' }}
                </span>
                <span v-else>长期有效</span>
              </div>
            </div>
          </template>
          <template v-if="column.key === 'remarkConfig'">
            <div>
              <a-tag :color="record.remarkConfig.generalEnabled ? 'blue' : 'default'" class="mb-1">
                普通备注: {{ record.remarkConfig.generalEnabled ? (record.remarkConfig.generalRequired ? '必填' : '选填') : '关闭' }}
              </a-tag>
              <a-tag :color="record.remarkConfig.invoiceEnabled ? 'blue' : 'default'" class="mb-1">
                发票备注: {{ record.remarkConfig.invoiceEnabled ? (record.remarkConfig.invoiceRequired ? '必填' : '选填') : '关闭' }}
              </a-tag>
              <a-tag v-if="record.remarkConfig.invoiceEnabled && record.remarkConfig.allowedInvoiceTypes.length" color="cyan">
                {{ record.remarkConfig.allowedInvoiceTypes.map(t => {
                    if (t === 'corporate') return '企业发票';
                    if (t === 'personal') return '个人发票';
                    return t;
                    }).join(', ') }}
              </a-tag>
            </div>
          </template>
          
          <template v-if="column.key === 'op'">
            <JeepayTableColumns>
              <a-button type="link" v-if="$access('ENT_PREFILLED_ORDER_VIEW')" @click="detailFunc(record.prefilledOrderId)">详情</a-button>
              <a-button type="link" v-if="record.publicPayUrl" @click="showQrCodeModal(record)">二维码</a-button>
              <a-button type="link" @click="getPayOrderByPrefilledOrderId(record.prefilledOrderId)">交易订单</a-button>
              <a-button type="link" v-if="$access('ENT_PREFILLED_ORDER_EDIT')" @click="editFunc(record.prefilledOrderId)">修改</a-button>
              <a-button type="link" v-if="$access('ENT_PREFILLED_ORDER_DEL')" style="color: red" @click="delFunc(record.prefilledOrderId)">删除</a-button>
            </JeepayTableColumns>
          </template>
        </template>
      </JeepayTable>
    </a-card>
    <!-- 新增/编辑 预填订单 -->
    <AddOrEdit ref="addOrEditRef" :callbackFunc="searchFunc" />
    <!-- 详情 预填订单 -->
    <Detail ref="detailRef" />
    <!-- 二维码展示 -->
    <a-modal v-model:open="vdata.qrCodeModalVisible" title="下单二维码" @ok="downloadQrCode" okText="下载二维码" cancelText="关闭">
      <a-watermark content="杭州市计算机学会">
        <div style="display: flex; justify-content: center; align-items: center;">
          <a-space direction="vertical" align="center" :size="16">
            <a-qrcode v-if="vdata.currentQrCodeUrl" :value="vdata.currentQrCodeUrl" :size="200" level="H" ref="qrCodeCanvasRef" />
            <p v-if="vdata.currentRecordForQrCode" style="margin: 0; font-size: 14px; color: #555;">{{ vdata.currentRecordForQrCode.subject }}</p>
            <p v-if="vdata.currentRecordForQrCode" style="margin: 0; font-size: 12px; color: #888;">🔗 {{ vdata.currentQrCodeUrl }}</p>
          </a-space>
        </div>
      </a-watermark>
    </a-modal>
  </page-header-wrapper>
</template>

<script setup lang="ts">
import { reactive, ref, getCurrentInstance, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 配置dayjs使用UTC插件
dayjs.extend(utc)
import { CopyOutlined } from '@ant-design/icons-vue'
import { Modal as AModal } from 'ant-design-vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { getPrefilledOrderList, deletePrefilledOrder } from '@/api/prefilledOrder' // 确保路径正确
// 使用类型断言确保组件导入
import AddOrEdit from '@/views/prefilledOrder/AddOrEdit.vue' // 新建/编辑组件
import Detail from '@/views/prefilledOrder/Detail.vue' // 详情组件
import { message } from 'ant-design-vue'

const router = useRouter()
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const tableColumns = [
  { key: 'prefilledOrderId', fixed: 'left', width: 160, title: '预填订单号' },
  { key: 'subject', dataIndex: 'subject', title: '订单标题', ellipsis: true, width: 200 },
  { key: 'amount', title: '金额', width: 100 },
  { key: 'usage', title: '使用次数', width: 80 },
  { key: 'validDate', title: '有效期', width: 150 },
  { key: 'remarkConfig', title: '备注配置', width: 100 },
  { key: 'status', title: '状态', width: 60 },
  { key: 'op', title: '操作', width: 150, fixed: 'right', align: 'center' },
]

const infoTable = ref()
const addOrEditRef = ref()
const detailRef = ref()
const qrCodeCanvasRef = ref() // 用于引用qrcode组件实例以下载图片

const vdata = reactive({
  btnLoading: false,
  tableColumns: tableColumns,
  searchData: { // 初始化查询条件
    prefilledOrderId: '',
    appId: '',
    status: '',
    // subject: '',
    // body: '',
    description: '',
    usageStart: null as any,
    usageEnd: null as any
  },
  qrCodeModalVisible: false,
  currentQrCodeUrl: '',
  currentRecordForQrCode: null as Record<string, any> | null // 用于存储当前二维码对应的记录信息
})

function queryFunc () {
  vdata.btnLoading = true
  infoTable.value.refTable(true)
}

// 请求table接口数据
function reqTableDataFunc (params) {
  return getPrefilledOrderList(params)
}

function getPayOrderByPrefilledOrderId (prefilledOrderId) {
  router.push({
    path: '/pay',
    query: {
      sourcePrefilledOrderId: prefilledOrderId
    }
  })
}

function searchFunc () {
  infoTable.value.refTable(true)
}

function addFunc () {
  addOrEditRef.value.show()
}

function editFunc (recordId) {
  addOrEditRef.value.show(recordId, 'edit')
}

function detailFunc (recordId) {
  detailRef.value.show(recordId)
}

function delFunc (recordId) {
  $infoBox.confirmDanger('确认删除该预填订单吗？', '删除后不可恢复。', () => {
    deletePrefilledOrder(recordId).then(() => {
      message.success('删除成功！')
      searchFunc()
    }).catch(err => {
      message.error(err.message || '删除失败')
    })
  })
}

async function copyText (text) {
  try {
    await navigator.clipboard.writeText(text) // 需要在安全上下文环境才能成功复制，如使用 https
    message.success('复制成功!')
  } catch (err) {
    message.error('复制失败，请确保使用HTTPS!')
  }
}

function showQrCodeModal (record) {
  if (record.publicPayUrl) {
    vdata.currentQrCodeUrl = record.publicPayUrl
    vdata.currentRecordForQrCode = record
    vdata.qrCodeModalVisible = true
  } else {
    message.warning('该订单没有公开支付地址，无法生成二维码！')
  }
}

const downloadQrCode = async () => {
  if (qrCodeCanvasRef.value) {
    const url = await qrCodeCanvasRef.value.toDataURL();
    const a = document.createElement('a')
    a.href = url
    a.download = `prefilled_order_qr_${vdata.currentRecordForQrCode?.prefilledOrderId || 'qrcode'}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    message.success('二维码下载成功！')
  } else {
    message.error('二维码生成失败，无法下载！')
  }
}

// 获取订单有效状态
function getValidityStatus(record) {
  const now = dayjs()
  const startTime = record.startTime ? dayjs.utc(record.startTime).local() : null
  const endTime = record.endTime ? dayjs.utc(record.endTime).local() : null

  // 如果没有开始时间和结束时间，则为长期有效
  if (!startTime && !endTime) {
    return { color: 'green', text: '长期有效' }
  }

  // 如果有开始时间但未到开始时间
  if (startTime && now.isBefore(startTime)) {
    return { color: 'orange', text: '未生效' }
  }

  // 如果有结束时间且已过期
  if (endTime && now.isAfter(endTime)) {
    return { color: 'red', text: '已过期' }
  }

  // 在有效期内
  return { color: 'green', text: '生效中' }
}

</script>

<style lang="less" scoped>
.mb-1 {
  margin-bottom: 4px;
}

.ant-tag {
  margin-right: 4px;
  &:last-child {
    margin-right: 0;
  }
}

.table-page-search-submitButtons {
  margin-left: 8px;
}
</style>