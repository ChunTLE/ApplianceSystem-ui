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
          <div class="chart-container">
            <div ref="stockInChartRef" class="chart"></div>
          </div>
          <el-table :data="stockInData" stripe style="width: 100%">
            <el-table-column prop="label" label="日期" />
            <el-table-column prop="productName" label="产品名称" />
            <el-table-column prop="count" label="入库数量" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="出库统计" name="stockOut">
          <div class="chart-container">
            <div ref="stockOutChartRef" class="chart"></div>
          </div>
          <el-table :data="stockOutData" stripe style="width: 100%">
            <el-table-column prop="label" label="日期" />
            <el-table-column prop="productName" label="产品名称" />
            <el-table-column prop="count" label="出库数量" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="销售统计" name="saleDetail">
          <div class="chart-container">
            <div ref="saleChartRef" class="chart"></div>
          </div>
          <el-table :data="saleDetailData" stripe style="width: 100%">
            <el-table-column prop="date" label="销售日期" width="120" />
            <el-table-column prop="productName" label="产品名称" width="150" />
            <el-table-column prop="quantity" label="销售数量" width="100" />
            <el-table-column prop="amount" label="销售金额">
              <template #default="{ row }">
                ¥{{ row.amount?.toFixed(2) || '0.00' }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { statisticsApi } from '@/api/statistics'
import type { StatisticsVO, StockInChartVO, SaleDetailVO } from '@/types/api'

const activeTab = ref('stockIn')
const dateRange = ref<[string, string] | null>(null)
const stockInData = ref<StatisticsVO[]>([])
const stockOutData = ref<StatisticsVO[]>([])
const saleDetailData = ref<SaleDetailVO[]>([])

// 图表引用
const stockInChartRef = ref<HTMLDivElement>()
const stockOutChartRef = ref<HTMLDivElement>()
const saleChartRef = ref<HTMLDivElement>()
let stockInChart: echarts.ECharts | null = null
let stockOutChart: echarts.ECharts | null = null
let saleChart: echarts.ECharts | null = null

const loadStatistics = async () => {
  const [startDate, endDate] = dateRange.value || [undefined, undefined]

  try {
    // 加载所有统计数据
    const [stockInRes, stockOutRes, saleDetailRes, stockInChartRes, stockOutChartRes, saleChartRes] = await Promise.all([
      statisticsApi.getStockInStatistics(startDate, endDate),
      statisticsApi.getStockOutStatistics(startDate, endDate),
      statisticsApi.getSaleDetailStatistics(startDate, endDate), // 加载销售统计详情
      statisticsApi.getStockInChart(startDate, endDate), // 加载入库图表数据
      statisticsApi.getStockOutChart(startDate, endDate), // 加载出库图表数据
      statisticsApi.getSaleChart(startDate, endDate), // 加载销售图表数据
    ])

    stockInData.value = stockInRes.data || []
    console.log('获取的入库统计数据:', stockInData.value)
    stockOutData.value = stockOutRes.data || []
    saleDetailData.value = saleDetailRes.data || []

    // 渲染入库统计图表
    if (activeTab.value === 'stockIn' && stockInChartRef.value) {
      await nextTick()
      renderStockInChart(stockInChartRes)
    }
    
    // 渲染出库统计图表
    if (activeTab.value === 'stockOut' && stockOutChartRef.value) {
      await nextTick()
      renderStockOutChart(stockOutChartRes)
    }
    
    // 渲染销售统计图表
    if (activeTab.value === 'saleDetail' && saleChartRef.value) {
      await nextTick()
      renderSaleChart(saleChartRes)
    }

    // ElMessage.success('加载成功')
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 渲染入库统计柱状图
const renderStockInChart = (response: any) => {  // 接收完整的响应对象
  if (!stockInChartRef.value) return

  // 解析后端返回的数据结构
  let dates: string[] = [];
  let counts: number[] = [];
  let productNames: string[] = [];

  if (response && response.data && typeof response.data === 'object') {
    const chartData = response.data;
    dates = Array.isArray(chartData.dates) ? chartData.dates : [];
    counts = Array.isArray(chartData.counts) ? chartData.counts : [];
    productNames = Array.isArray(chartData.productNames) ? chartData.productNames : [];
  }

  // 如果已有图表实例，先销毁
  if (stockInChart) {
    stockInChart.dispose()
  }

  // 初始化图表
  stockInChart = echarts.init(stockInChartRef.value)

  // 使用后端返回的数据创建图表
  const option: echarts.EChartsOption = {
    title: {
      text: '入库统计图表',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        const index = param.dataIndex;
        const date = dates[index] || '';
        const productName = productNames[index] || '';
        const count = counts[index] || 0;
        return `${date}<br />${productName}<br />入库数量: ${count}`;
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '入库数量'
    },
    series: [
      {
        name: '入库数量',
        data: counts,
        type: 'bar'
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '12%',
      containLabel: true
    }
  }

  stockInChart.setOption(option)
}

// 渲染出库统计柱状图
const renderStockOutChart = (response: any) => {  // 接收完整的响应对象
  if (!stockOutChartRef.value) return

  // 解析后端返回的数据结构
  let dates: string[] = [];
  let counts: number[] = [];
  let productNames: string[] = [];

  if (response && response.data && typeof response.data === 'object') {
    const chartData = response.data;
    dates = Array.isArray(chartData.dates) ? chartData.dates : [];
    counts = Array.isArray(chartData.counts) ? chartData.counts : [];
    productNames = Array.isArray(chartData.productNames) ? chartData.productNames : [];
  }

  // 如果已有图表实例，先销毁
  if (stockOutChart) {
    stockOutChart.dispose()
  }

  // 初始化图表
  stockOutChart = echarts.init(stockOutChartRef.value)

  // 使用后端返回的数据创建图表
  const option: echarts.EChartsOption = {
    title: {
      text: '出库统计图表',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        const index = param.dataIndex;
        const date = dates[index] || '';
        const productName = productNames[index] || '';
        const count = counts[index] || 0;
        return `${date}<br />${productName}<br />出库数量: ${count}`;
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '出库数量'
    },
    series: [
      {
        name: '出库数量',
        data: counts,
        type: 'bar'
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '12%',
      containLabel: true
    }
  }

  stockOutChart.setOption(option)
}

// 渲染销售统计柱状图
const renderSaleChart = (response: any) => {  // 接收完整的响应对象
  if (!saleChartRef.value) return

  // 解析后端返回的数据结构
  let dates: string[] = [];
  let amounts: number[] = [];
  let quantities: number[] = [];
  let productNames: string[] = [];

  if (response && response.data && typeof response.data === 'object') {
    const chartData = response.data;
    dates = Array.isArray(chartData.dates) ? chartData.dates : [];
    amounts = Array.isArray(chartData.amounts) ? chartData.amounts : [];
    quantities = Array.isArray(chartData.quantities) ? chartData.quantities : [];
    productNames = Array.isArray(chartData.productNames) ? chartData.productNames : [];
  }

  // 如果已有图表实例，先销毁
  if (saleChart) {
    saleChart.dispose()
  }

  // 初始化图表
  saleChart = echarts.init(saleChartRef.value)

  // 使用后端返回的数据创建图表
  const option: echarts.EChartsOption = {
    title: {
      text: '销售统计图表',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        const index = param.dataIndex;
        const date = dates[index] || '';
        const productName = productNames[index] || '';
        const quantity = quantities[index] || 0;
        const amount = amounts[index] || 0;
        return `${date}<br />${productName}<br />销售数量: ${quantity}<br />销售金额: ¥${amount}`;
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '销售数量'
    },
    series: [
      {
        name: '销售数量',
        data: quantities,
        type: 'bar'
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '12%',
      containLabel: true
    }
  }

  saleChart.setOption(option)
}

// 图表自适应窗口大小
const resizeChart = () => {
  if (stockInChart || stockOutChart || saleChart) {
    stockInChart?.resize()
    stockOutChart?.resize()
    saleChart?.resize()
  }
}

// 监听窗口大小变化
window.addEventListener('resize', resizeChart)

const handleTabChange = async () => {
  // 切换标签时重新加载数据
  loadStatistics()
  
  // 如果切换到入库统计标签且图表容器存在，重新渲染图表
  if (activeTab.value === 'stockIn' && stockInChartRef.value) {
    await nextTick()
    // 获取最新的入库图表数据并渲染
    const [startDate, endDate] = dateRange.value || [undefined, undefined]
    try {
      const chartRes = await statisticsApi.getStockInChart(startDate, endDate)
      console.log('获取的入库图表数据:', chartRes.data)
      renderStockInChart(chartRes)
    } catch (error) {
      console.error('加载入库图表数据失败:', error)
    }
  }
  
  // 如果切换到出库统计标签且图表容器存在，重新渲染图表
  if (activeTab.value === 'stockOut' && stockOutChartRef.value) {
    await nextTick()
    // 获取最新的出库图表数据并渲染
    const [startDate, endDate] = dateRange.value || [undefined, undefined]
    try {
      const chartRes = await statisticsApi.getStockOutChart(startDate, endDate)
      console.log('获取的出库图表数据:', chartRes.data)
      renderStockOutChart(chartRes)
    } catch (error) {
      console.error('加载出库图表数据失败:', error)
    }
  }
  
  // 如果切换到销售统计标签且图表容器存在，重新渲染图表
  if (activeTab.value === 'saleDetail' && saleChartRef.value) {
    await nextTick()
    // 获取最新的销售图表数据并渲染
    const [startDate, endDate] = dateRange.value || [undefined, undefined]
    try {
      const chartRes = await statisticsApi.getSaleChart(startDate, endDate)
      console.log('获取的销售图表数据:', chartRes.data)
      renderSaleChart(chartRes)
    } catch (error) {
      console.error('加载销售图表数据失败:', error)
    }
  }
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
    case 'saleDetail':
      csvContent = '销售日期,产品名称,销售数量,销售金额\n'
      saleDetailData.value.forEach((item) => {
        csvContent += `${item.date},${item.productName},${item.quantity},${item.amount || 0}\n`
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

// 在组件卸载时销毁图表和事件监听器
onUnmounted(() => {
  if (stockInChart) {
    stockInChart.dispose()
  }
  if (stockOutChart) {
    stockOutChart.dispose()
  }
  if (saleChart) {
    saleChart.dispose()
  }
  window.removeEventListener('resize', resizeChart)
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

.chart-container {
  margin-bottom: 20px;
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>

