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
          <el-table v-loading="loading" :data="warnings" stripe>
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
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { stockWarningApi } from '@/api/stockWarning'
import type { StockWarning } from '@/types/api'

const loading = ref(false)
const warnings = ref<StockWarning[]>([])

const loadWarnings = async () => {
  loading.value = true
  try {
    const res = await stockWarningApi.getWarningList(10)
    warnings.value = res.data || []
  } catch (error) {
    console.error('加载预警失败:', error)
  } finally {
    loading.value = false
  }
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
</style>

