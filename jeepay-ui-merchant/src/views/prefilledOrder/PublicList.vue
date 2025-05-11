<template>
  <a-watermark content="杭州市计算机学会">
    <div class="page-container">
      <a-card title="可支付订单列表" :bordered="false">
        <a-spin :spinning="vdata.loading">
          <template v-if="vdata.loading">
            <div class="loading-state-placeholder"></div>
          </template>
          <template v-else>
            <template v-if="vdata.orderList.length > 0">
              <a-list
                :data-source="vdata.orderList"
                class="order-list"
              >
                <template #renderItem="{ item }">
                  <a-list-item>
                    <div class="order-card">
                      <div class="card-header">
                        <a-avatar size="large" style="background-color: #1890ff; flex-shrink: 0;">
                          {{ item.subject?.charAt(0) }}
                        </a-avatar>
                        <div class="card-header-text">
                          <h3 class="card-title">{{ item.subject }}</h3>
                          <a-tag color="success" class="card-status">有效</a-tag>
                        </div>
                      </div>

                      <div class="card-content">
                        <p class="card-description">{{ item.body || '暂无描述' }}</p>
                        <div class="card-details">
                          <div class="card-detail-item">
                            <BarcodeOutlined />
                            <span>订单号: {{ item.prefilledOrderId }}</span>
                          </div>
                          <div class="card-detail-item">
                            <ClockCircleOutlined />
                            <span>有效期: {{ formatTimeRange(item) }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="card-actions">
                        <div class="card-amount">
                          <span class="card-amount-label">支付金额</span>
                          <span class="card-amount-value">¥{{ (item.amount / 100).toFixed(2) }}</span>
                        </div>
                        <a-button
                          type="primary"
                          block
                          @click="goToPay(item.prefilledOrderId)"
                          class="pay-button"
                        >
                          去支付
                        </a-button>
                      </div>
                    </div>
                  </a-list-item>
                </template>
              </a-list>

              <div v-if="vdata.pagination.total > vdata.pagination.pageSize" class="pagination-container">
                <a-pagination
                  v-model:current="vdata.pagination.current"
                  :page-size="vdata.pagination.pageSize"
                  :total="vdata.pagination.total"
                  show-size-changer
                  @change="handlePageChange"
                  :show-total="total => `总共 ${total} 条`"
                />
              </div>
            </template>
            <div v-else class="empty-container">
              <a-empty description="暂无可支付的订单" />
            </div>
          </template>
        </a-spin>
      </a-card>
    </div>
  </a-watermark>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { prefilledOrderPublicList } from '@/api/prefilledOrder'
import { message } from 'ant-design-vue'
import { BarcodeOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()

const vdata = reactive({
  orderList: [] as any[],
  loading: true,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
})

const fetchOrderList = async (page = 1, pageSize = vdata.pagination.pageSize) => {
  vdata.loading = true
  try {
    const params = {
      pageNumber: page,
      pageSize: pageSize,
    }
    const apiResponseData = await prefilledOrderPublicList(params)

    if (apiResponseData && typeof apiResponseData.records !== 'undefined') {
      vdata.orderList = apiResponseData.records || []
      vdata.pagination.current = apiResponseData.current || page
      vdata.pagination.total = apiResponseData.total || 0
    } else {
      message.error('加载订单列表失败: 响应数据格式不正确')
      vdata.orderList = []
      vdata.pagination.total = 0
    }
  } catch (error) {
    message.error('加载订单列表失败: ' + ((error as Error).message || '未知错误'))
    vdata.orderList = []
    vdata.pagination.total = 0
  } finally {
    vdata.loading = false
  }
}

const handlePageChange = (page: number, pageSize: number) => {
  vdata.pagination.current = page
  vdata.pagination.pageSize = pageSize
  fetchOrderList(page, pageSize)
}

const formatTime = (time: string) => {
  if (!time) {
    return ''
  }
  return dayjs(time).format('YY/MM/DD HH:mm')
}

const formatTimeRange = (item: any) => {
  if (!item.startTime && !item.endTime) {
    return '长期有效'
  }
  return `${formatTime(item.startTime) || '当前有效'} - ${formatTime(item.endTime) || '长期有效'}`
}

const goToPay = (prefilledOrderId: string) => {
  router.push(`/prefilledOrder/publicPay/${prefilledOrderId}`)
}

onMounted(() => {
  fetchOrderList(vdata.pagination.current, vdata.pagination.pageSize)
})
</script>

<style scoped>
:deep(.ant-watermark) {
  height: 100%;
}

.page-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.page-container > .ant-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-container > .ant-card :deep(.ant-card-body) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-container > .ant-card :deep(.ant-spin-nested-loading),
.page-container > .ant-card :deep(.ant-spin-container) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.order-list {
  margin-top: 20px;
}

.order-list :deep(ul.ant-list-items) {
  column-gap: 16px;
  padding: 0 20px;
  margin: 0;
  column-count: 2;
}

.order-list :deep(.ant-list-item) {
  padding: 0 0 16px 0;
  break-inside: avoid;
  width: 100%;
  display: block;
  border-bottom: none !important;
}

.order-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s ease-in-out;
  width: 100%;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.card-header-text {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-status {
  align-self: flex-start;
}

.card-content {
  flex-grow: 1;
  margin-bottom: 16px;
}

.card-description {
  color: #555;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #777;
  font-size: 13px;
}

.card-detail-item .anticon {
  font-size: 16px;
  color: #888;
}

.card-actions {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.card-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-amount-label {
  font-size: 14px;
  color: #555;
}

.card-amount-value {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
}

.pay-button {
  font-size: 16px;
  height: 40px;
}

.pagination-container {
  text-align: center;
  margin-top: 24px;
  padding-bottom: 24px;
}

.empty-container {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  width: 100%;
}

.loading-state-placeholder {
  flex-grow: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 575px) {
  .order-list :deep(ul.ant-list-items) {
    column-count: 1;
  }
  .order-card { padding: 16px; }
  .card-title { font-size: 16px; }
  .card-description { -webkit-line-clamp: 2; line-clamp: 2; font-size: 13px; }
  .card-detail-item { font-size: 12px; }
  .card-detail-item .anticon { font-size: 14px; }
  .card-amount-value { font-size: 18px; }
  .pay-button { font-size: 15px; height: 38px; }
  .empty-container { padding: 16px; }
}

@media (min-width: 576px) and (max-width: 767px) {
  .order-list :deep(ul.ant-list-items) {
    column-count: 2;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .order-list :deep(ul.ant-list-items) {
    column-count: 2;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .order-list :deep(ul.ant-list-items) {
    column-count: 3;
  }
}

@media (min-width: 1200px) {
  .order-list :deep(ul.ant-list-items) {
    column-count: 4;
  }
}

@media (max-width: 576px) {
  .page-container {
    padding: 12px;
  }
  .empty-container {
    padding: 16px;
  }
}
</style>
