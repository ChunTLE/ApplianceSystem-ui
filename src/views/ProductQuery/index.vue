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

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

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

let allProducts: Product[] = []  // 存储所有产品数据

const handleSearch = async () => {
  loading.value = true
  try {
    // 获取所有产品数据
    const res = await productApi.getAllProducts()
    if (res.code === 0) {
      allProducts = res.data || []
      
      // 根据查询条件过滤数据
      let filteredData = allProducts
      if (searchForm.productName) {
        filteredData = filteredData.filter(item => 
          item.productName.toLowerCase().includes(searchForm.productName.toLowerCase())
        )
      }
      
      if (searchForm.typeId !== undefined && searchForm.typeId !== null) {
        filteredData = filteredData.filter(item => item.typeId === searchForm.typeId)
      }
      
      // 计算总数
      totalRecords.value = filteredData.length
      
      // 计算当前页数据
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      productList.value = filteredData.slice(startIndex, endIndex)
    } else {
      console.error('搜索失败:', res.message)
    }
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.productName = ''
  searchForm.typeId = undefined
  currentPage.value = 1  // 重置时回到第一页
  handleSearch()
}

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1  // 每次改变页面大小时回到第一页
  handleSearch()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
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

