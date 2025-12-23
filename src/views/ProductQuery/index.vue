<template>
  <div class="product-query-container">
    <el-card>
      <template #header>
        <span>产品查询</span>
      </template>

      <!-- 搜索条件 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="产品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入产品名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="产品类型">
          <el-select
            v-model="searchForm.typeId"
            placeholder="请选择产品类型"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="type in typeList"
              :key="type.id"
              :label="type.typeName"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 产品列表 -->
      <el-table v-loading="loading" :data="productList" stripe style="width: 100%">
        <el-table-column prop="id" label="产品ID" width="100" />
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
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { productApi } from '@/api/product'
import { productTypeApi } from '@/api/productType'
import type { Product, ProductType } from '@/types/api'

const loading = ref(false)
const productList = ref<Product[]>([])
const typeList = ref<ProductType[]>([])

const searchForm = reactive({
  productName: '',
  typeId: undefined as number | undefined,
})

const loadTypeList = async () => {
  try {
    const res = await productTypeApi.getTypeList()
    typeList.value = res.data || []
  } catch (error) {
    console.error('加载类型列表失败:', error)
  }
}

const handleSearch = async () => {
  loading.value = true
  try {
    const res = await productApi.searchProduct(
      searchForm.productName || undefined,
      searchForm.typeId
    )
    productList.value = res.data || []
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.productName = ''
  searchForm.typeId = undefined
  handleSearch()
}

onMounted(() => {
  loadTypeList()
  handleSearch()
})
</script>

<style scoped>
.product-query-container {
  height: 100%;
}

.search-form {
  margin-bottom: 20px;
}
</style>

