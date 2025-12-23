<template>
  <div class="statistics-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>统计管理</span>
          <div>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="margin-right: 10px"
            />
            <el-button type="primary" @click="loadStatistics">查询</el-button>
            <el-button @click="exportData">导出报表</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="入库统计" name="stockIn">
          <el-table :data="stockInData" stripe style="width: 100%">
            <el-table-column prop="label" label="日期" />
            <el-table-column prop="count" label="入库数量" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="出库统计" name="stockOut">
          <el-table :data="stockOutData" stripe style="width: 100%">
            <el-table-column prop="label" label="日期" />
            <el-table-column prop="count" label="出库数量" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="销售统计（按日期）" name="sale">
          <el-table :data="saleData" stripe style="width: 100%">
            <el-table-column prop="label" label="日期" />
            <el-table-column prop="count" label="销售数量" />
            <el-table-column prop="totalAmount" label="销售金额">
              <template #default="{ row }">
                ¥{{ row.totalAmount?.toFixed(2) || '0.00' }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="销售统计（按产品）" name="saleByProduct">
          <el-table :data="saleByProductData" stripe style="width: 100%">
            <el-table-column prop="label" label="产品" />
            <el-table-column prop="count" label="销售数量" />
            <el-table-column prop="totalAmount" label="销售金额">
              <template #default="{ row }">
                ¥{{ row.totalAmount?.toFixed(2) || '0.00' }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { statisticsApi } from '@/api/statistics'
import type { StatisticsVO } from '@/types/api'

const activeTab = ref('stockIn')
const dateRange = ref<[string, string] | null>(null)
const stockInData = ref<StatisticsVO[]>([])
const stockOutData = ref<StatisticsVO[]>([])
const saleData = ref<StatisticsVO[]>([])
const saleByProductData = ref<StatisticsVO[]>([])

const loadStatistics = async () => {
  const [startDate, endDate] = dateRange.value || [undefined, undefined]

  try {
    // 加载所有统计数据
    const [stockInRes, stockOutRes, saleRes, saleByProductRes] = await Promise.all([
      statisticsApi.getStockInStatistics(startDate, endDate),
      statisticsApi.getStockOutStatistics(startDate, endDate),
      statisticsApi.getSaleStatistics(startDate, endDate),
      statisticsApi.getSaleStatisticsByProduct(startDate, endDate),
    ])

    stockInData.value = stockInRes.data || []
    stockOutData.value = stockOutRes.data || []
    saleData.value = saleRes.data || []
    saleByProductData.value = saleByProductRes.data || []

    ElMessage.success('加载成功')
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const handleTabChange = () => {
  // 切换标签时重新加载数据
  loadStatistics()
}

const exportData = () => {
  // 导出为CSV格式
  let csvContent = ''

  switch (activeTab.value) {
    case 'stockIn':
      csvContent = '日期,入库数量\n'
      stockInData.value.forEach((item) => {
        csvContent += `${item.label},${item.count}\n`
      })
      break
    case 'stockOut':
      csvContent = '日期,出库数量\n'
      stockOutData.value.forEach((item) => {
        csvContent += `${item.label},${item.count}\n`
      })
      break
    case 'sale':
      csvContent = '日期,销售数量,销售金额\n'
      saleData.value.forEach((item) => {
        csvContent += `${item.label},${item.count},${item.totalAmount || 0}\n`
      })
      break
    case 'saleByProduct':
      csvContent = '产品,销售数量,销售金额\n'
      saleByProductData.value.forEach((item) => {
        csvContent += `${item.label},${item.count},${item.totalAmount || 0}\n`
      })
      break
  }

  // 创建下载链接
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${activeTab.value}_${new Date().getTime()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  ElMessage.success('导出成功')
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped>
.statistics-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

