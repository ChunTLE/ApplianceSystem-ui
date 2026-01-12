<template>
  <div class="stock-out-container">
    <el-card>
      <template #header>
        <span>产品出库</span>
      </template>

      <el-form
        :model="stockOutForm"
        :rules="rules"
        ref="formRef"
        label-width="120px"
        style="max-width: 500px"
      >
        <el-form-item label="产品名称" prop="productId">
          <el-select
            v-model="stockOutForm.productId"
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

        <el-form-item label="出库数量" prop="quantity">
          <el-input-number
            v-model="stockOutForm.quantity"
            :min="1"
            placeholder="请输入出库数量"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="warning" @click="handleStockOut" :loading="submitting">
            确认出库
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 出库记录表格 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>出库记录</span>
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
      
      <el-table v-if="!recordsLoading" :data="stockOutRecords" stripe style="width: 100%">
        <el-table-column prop="productName" label="产品名称" />
        <el-table-column prop="quantity" label="出库数量" width="100" />
        <el-table-column prop="operator" label="操作员" width="120" />
        <el-table-column prop="outTime" label="出库时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
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
    
    <!-- 编辑出库记录对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="出库数量">
          <el-input-number v-model="editForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { stockApi } from '@/api/stock'
import { productApi } from '@/api/product'
import { useUserStore } from '@/stores/user'
import type { StockRequest, Product, StockOutRecord } from '@/types/api'

interface EditableStockOutRecord {
  id: number
  quantity: number
}

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const products = ref<Product[]>([])
const productsLoading = ref(false)

// 出库记录相关状态
const stockOutRecords = ref<StockOutRecord[]>([])
const recordsLoading = ref(false)

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

// 存储所有记录
const allRecords = ref<StockOutRecord[]>([])

// 查询相关状态
const queryProductName = ref('')
const queryOperator = ref('')

// 编辑出库记录相关状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editForm = ref<EditableStockOutRecord>({ 
  id: 0,
  quantity: 0
})

const stockOutForm = reactive<StockRequest>({
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
    { required: true, message: '请输入出库数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '出库数量必须大于0', trigger: 'blur' },
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

// 在handleStockOut函数中添加刷新出库记录的调用
const handleStockOut = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 确保操作员ID是当前登录用户
      if (userStore.userInfo?.userId) {
        stockOutForm.operatorId = userStore.userInfo.userId
      }

      const selectedProduct = products.value.find(p => p.id === stockOutForm.productId)
      const productName = selectedProduct?.productName || `ID: ${stockOutForm.productId}`
      const currentStock = selectedProduct?.stock || 0

      // 检查库存是否充足
      if (stockOutForm.quantity > currentStock) {
        ElMessage.warning(`库存不足，当前库存: ${currentStock}`)
        return
      }

      try {
        await ElMessageBox.confirm(
          `确认出库产品: ${productName}, 数量: ${stockOutForm.quantity}?`,
          '确认出库',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )

        submitting.value = true
        await stockApi.stockOut(stockOutForm)
        ElMessage.success('出库成功')
        resetForm()
        // 刷新产品列表以更新库存
        loadProducts()
        // 刷新出库记录
        loadStockOutRecords()
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('出库失败:', error)
        }
      } finally {
        submitting.value = false
      }
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(stockOutForm, {
    productId: undefined as any, // 重置为undefined以显示placeholder
    quantity: 0,
    operatorId: userStore.userInfo?.userId || 0, // 重置时保持当前用户
  })
}

// 加载出库记录
const loadStockOutRecords = async () => {
  recordsLoading.value = true
  try {
    const res = await stockApi.getStockOutRecords()
    if (res.code === 0) {
      allRecords.value = res.data || []
      
      // 根据查询条件过滤数据
      let filteredData = allRecords.value
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
      stockOutRecords.value = filteredData.slice(startIndex, endIndex)
    } else {
      console.error('获取出库记录失败:', res.message)
    }
  } catch (error) {
    console.error('获取出库记录失败:', error)
  } finally {
    recordsLoading.value = false
  }
}

// 查询出库记录
const handleQuery = () => {
  currentPage.value = 1  // 查询时回到第一页
  loadStockOutRecords()
}

// 重置查询条件
const resetQuery = () => {
  queryProductName.value = ''
  queryOperator.value = ''
  currentPage.value = 1
  loadStockOutRecords()
}

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1  // 每次改变页面大小时回到第一页
  loadStockOutRecords()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadStockOutRecords()
}

// 处理编辑出库记录
const handleEdit = (row: StockOutRecord) => {
  dialogTitle.value = '编辑出库记录'
  // 复制需要编辑的字段到表单
  Object.assign(editForm.value, { 
    id: row.id,
    quantity: row.quantity
  })
  dialogVisible.value = true
}

// 处理删除出库记录
const handleDelete = async (row: StockOutRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品 "${row.productName}" 的出库记录吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await stockApi.deleteStockOutRecord(row.id)
    ElMessage.success('删除成功')
    // 重新加载数据
    loadStockOutRecords()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交编辑表单
const handleSubmit = async () => {
  try {
    // 创建完整的出库记录对象用于更新
    const recordToUpdate: StockOutRecord = {
      id: editForm.value.id,
      quantity: editForm.value.quantity,
      productName: '', // 后端可能不需要这些字段，但类型要求
      operator: '',
      outTime: ''
    }
    
    await stockApi.updateStockOutRecord(recordToUpdate)
    ElMessage.success('更新成功')
    dialogVisible.value = false
    // 重新加载数据
    loadStockOutRecords()
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败')
  }
}

onMounted(() => {
  loadProducts()
  loadStockOutRecords() // 页面加载时获取出库记录
  // 确保操作员ID始终是当前登录用户
  if (userStore.userInfo?.userId) {
    stockOutForm.operatorId = userStore.userInfo.userId
  }
})
</script>

<style scoped>
.stock-out-container {
  height: 100%;
}
</style>