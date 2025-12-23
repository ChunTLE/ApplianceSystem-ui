<template>
  <div class="product-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品列表</span>
          <el-button type="primary" @click="loadProductList">刷新</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="productList"
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'id', order: 'ascending' }"
      >
        <el-table-column prop="id" label="产品ID" width="100" sortable />
        <el-table-column prop="productName" label="产品名称" min-width="150" />
        <el-table-column prop="typeId" label="类型ID" width="100" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.price?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="{ row }">
            <el-tag :type="row.stock > 50 ? 'success' : row.stock > 10 ? 'warning' : 'danger'">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { productApi } from '@/api/product'
import type { Product } from '@/types/api'

const loading = ref(false)
const productList = ref<Product[]>([])

const loadProductList = async () => {
  loading.value = true
  try {
    const res = await productApi.getProductList()
    productList.value = res.data || []
    ElMessage.success('加载成功')
  } catch (error) {
    console.error('加载产品列表失败:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadProductList()
})
</script>

<style scoped>
.product-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

