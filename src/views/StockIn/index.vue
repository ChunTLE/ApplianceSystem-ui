<template>
  <div class="stock-in-container">
    <el-card>
      <template #header>
        <span>产品入库</span>
      </template>

      <el-form
        :model="stockInForm"
        :rules="rules"
        ref="formRef"
        label-width="120px"
        style="max-width: 500px"
      >
        <el-form-item label="产品名称" prop="productId">
          <el-select
            v-model="stockInForm.productId"
            placeholder="请选择产品"
            filterable
            clearable
            style="width: 100%"
            :loading="productsLoading"
          >
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.productName"
              :value="product.id"
            >
              <span>{{ product.productName }}</span>
              <span style="color: #8492a6; font-size: 13px; margin-left: 10px">
                (库存: {{ product.stock }})
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="入库数量" prop="quantity">
          <el-input-number
            v-model="stockInForm.quantity"
            :min="1"
            placeholder="请输入入库数量"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="success" @click="handleStockIn" :loading="submitting">
            确认入库
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 入库记录表格 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>入库记录</span>
          <div class="query-section" style="display: flex; gap: 10px;">
            <el-input
              v-model="queryProductName"
              placeholder="产品名称"
              style="width: 200px; margin-right: 10px;"
              clearable
              @keyup.enter="handleQuery"
            />
            <el-input
              v-model="queryOperator"
              placeholder="操作员"
              style="width: 150px; margin-right: 10px;"
              clearable
              @keyup.enter="handleQuery"
            />
            <el-button type="primary" @click="handleQuery" :loading="recordsLoading">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </div>
        </div>
      </template>
      
      <el-table v-if="!recordsLoading" :data="stockInRecords" stripe style="width: 100%">
        <el-table-column prop="productName" label="产品名称" />
        <el-table-column prop="quantity" label="入库数量" width="100" />
        <el-table-column prop="operator" label="操作员" width="120" />
        <el-table-column prop="inTime" label="入库时间" width="180" />
      </el-table>
      
      <el-skeleton v-else :rows="6" animated />
      
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
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { stockApi } from '@/api/stock'
import { productApi } from '@/api/product'
import { useUserStore } from '@/stores/user'
import type { StockRequest, Product, StockInRecord } from '@/types/api'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const products = ref<Product[]>([])
const productsLoading = ref(false)
const stockInRecords = ref<StockInRecord[]>([])
const recordsLoading = ref(false)

// 分页和查询相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)
const queryProductName = ref('')
const queryOperator = ref('')

const stockInForm = reactive<StockRequest>({
  productId: undefined as any, // 使用undefined以便显示placeholder
  quantity: 0,
  operatorId: userStore.userInfo?.userId || 0, // 默认当前登录用户，隐藏不显示
})

const rules: FormRules = {
  productId: [
    { required: true, message: '请选择产品', trigger: 'change' },
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value === 0) {
          callback(new Error('请选择产品'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    },
  ],
  quantity: [
    { required: true, message: '请输入入库数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '入库数量必须大于0', trigger: 'blur' },
  ],
}

// 加载产品列表
const loadProducts = async () => {
  productsLoading.value = true
  try {
    const res = await productApi.getProductList()
    products.value = res.data || []
  } catch (error) {
    console.error('加载产品列表失败:', error)
  } finally {
    productsLoading.value = false
  }
}

const handleStockIn = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 确保操作员ID是当前登录用户
      if (userStore.userInfo?.userId) {
        stockInForm.operatorId = userStore.userInfo.userId
      }

      const selectedProduct = products.value.find(p => p.id === stockInForm.productId)
      const productName = selectedProduct?.productName || `ID: ${stockInForm.productId}`

      try {
        await ElMessageBox.confirm(
          `确认入库产品: ${productName}, 数量: ${stockInForm.quantity}?`,
          '确认入库',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )

        submitting.value = true
        await stockApi.stockIn(stockInForm)
        ElMessage.success('入库成功')
        resetForm()
        // 刷新产品列表以更新库存
        loadProducts()
        // 刷新入库记录
        loadStockInRecords()
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('入库失败:', error)
        }
      } finally {
        submitting.value = false
      }
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(stockInForm, {
    productId: undefined as any, // 重置为undefined以显示placeholder
    quantity: 0,
    operatorId: userStore.userInfo?.userId || 0, // 重置时保持当前用户
  })
}

// 加载入库记录（分页版本，前端实现）
const loadStockInRecords = async () => {
  recordsLoading.value = true
  try {
    const res = await stockApi.getStockInRecords()
    if (res.code === 0) {
      let filteredData = res.data || []
      
      // 根据查询条件过滤数据
      if (queryProductName.value) {
        filteredData = filteredData.filter(item => 
          item.productName.toLowerCase().includes(queryProductName.value.toLowerCase())
        )
      }
      
      if (queryOperator.value) {
        filteredData = filteredData.filter(item => 
          item.operator.toLowerCase().includes(queryOperator.value.toLowerCase())
        )
      }
      
      // 计算总数
      totalRecords.value = filteredData.length
      
      // 计算当前页数据
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      stockInRecords.value = filteredData.slice(startIndex, endIndex)
    } else {
      console.error('获取入库记录失败:', res.message)
    }
  } catch (error) {
    console.error('获取入库记录失败:', error)
  } finally {
    recordsLoading.value = false
  }
}

// 查询入库记录
const handleQuery = () => {
  currentPage.value = 1  // 查询时回到第一页
  loadStockInRecords()
}

// 重置查询条件
const resetQuery = () => {
  queryProductName.value = ''
  queryOperator.value = ''
  currentPage.value = 1
  loadStockInRecords()
}

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadStockInRecords()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadStockInRecords()
}

onMounted(() => {
  loadProducts()
  loadStockInRecords() // 页面加载时获取入库记录
  // 确保操作员ID始终是当前登录用户
  if (userStore.userInfo?.userId) {
    stockInForm.operatorId = userStore.userInfo.userId
  }
})
</script>

<style scoped>
.stock-in-container {
  height: 100%;
}
</style>

