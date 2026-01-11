<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 库存预警 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>库存预警</span>
              <el-button type="primary" size="small" @click="loadWarnings">刷新</el-button>
            </div>
          </template>
          
          <!-- 搜索条件 -->
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="产品名称">
              <el-input
                v-model="searchForm.productName"
                placeholder="请输入产品名称"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
          
          <el-table v-loading="loading" :data="warningList" stripe>
            <el-table-column prop="productName" label="产品名称" />
            <el-table-column prop="stock" label="当前库存">
              <template #default="{ row }">
                <el-tag :type="row.level === 2 ? 'danger' : 'warning'">
                  {{ row.stock }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="threshold" label="预警阈值" />
            <el-table-column prop="level" label="预警级别">
              <template #default="{ row }">
                <el-tag :type="row.level === 2 ? 'danger' : 'warning'">
                  {{ row.level === 2 ? '缺货' : '低库存' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination" style="margin-top: 20px; display: flex; justify-content: center;">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[5, 10, 20, 50]"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalRecords"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { stockWarningApi } from '@/api/stockWarning'
import type { StockWarning } from '@/types/api'

const loading = ref(false)
const warnings = ref<StockWarning[]>([])

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

// 显示的预警数据
const warningList = ref<StockWarning[]>([])

// 存储所有预警数据
const allWarnings = ref<StockWarning[]>([])

// 查询相关状态
const searchForm = reactive({
  productName: ''
})

const loadWarnings = async () => {
  loading.value = true
  try {
    const res = await stockWarningApi.getWarningList(10)
    allWarnings.value = res.data || []
    
    // 根据查询条件过滤数据
    let filteredData = allWarnings.value
    if (searchForm.productName) {
      filteredData = filteredData.filter(item => 
        item.productName.toLowerCase().includes(searchForm.productName.toLowerCase())
      )
    }
    
    // 计算总数
    totalRecords.value = filteredData.length
    
    // 计算当前页数据
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    warningList.value = filteredData.slice(startIndex, endIndex)
  } catch (error) {
    console.error('加载预警失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleSearch = () => {
  currentPage.value = 1  // 查询时回到第一页
  loadWarnings()
}

// 重置查询
const resetSearch = () => {
  searchForm.productName = ''
  currentPage.value = 1  // 重置时回到第一页
  loadWarnings()
}

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1  // 每次改变页面大小时回到第一页
  loadWarnings()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadWarnings()
}

onMounted(() => {
  loadWarnings()
})
</script>

<style scoped>
.dashboard-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>

