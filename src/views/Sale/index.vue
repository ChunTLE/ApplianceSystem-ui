<template>
  <div class="sale-container">
    <el-card>
      <template #header>
        <span>产品销售</span>
      </template>

      <el-form
        :model="saleForm"
        :rules="rules"
        ref="formRef"
        label-width="120px"
        style="max-width: 500px"
      >
        <el-form-item label="产品名称" prop="productId">
          <el-select
            v-model="saleForm.productId"
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

        <el-form-item label="销售数量" prop="quantity">
          <el-input-number
            v-model="saleForm.quantity"
            :min="1"
            placeholder="请输入销售数量"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSale" :loading="submitting">
            提交销售
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 销售记录表格 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>销售记录</span>
          <div class="query-section" style="display: flex; gap: 10px;">
            <el-input
              v-model="queryProductName"
              placeholder="产品名称"
              style="width: 200px; margin-right: 10px;"
              clearable
              @keyup.enter="handleQuery"
            />
            <el-input
              v-model="querySalesman"
              placeholder="销售员"
              style="width: 150px; margin-right: 10px;"
              clearable
              @keyup.enter="handleQuery"
            />
            <el-button type="primary" @click="handleQuery" :loading="recordsLoading">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </div>
        </div>
      </template>
      
      <el-table v-if="!recordsLoading" :data="saleRecords" stripe style="width: 100%">
        <el-table-column prop="productName" label="产品名称" />
        <el-table-column prop="quantity" label="销售数量" width="100" />
        <el-table-column prop="totalPrice" label="总价格" width="120" :formatter="priceFormatter" />
        <el-table-column prop="salesman" label="销售员" width="120" />
        <el-table-column prop="saleTime" label="销售时间" width="180" />
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
    
    <!-- 编辑销售记录对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="销售数量">
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
import { saleApi } from '@/api/sale'
import { productApi } from '@/api/product'
import { useUserStore } from '@/stores/user'
import type { SaleRequest, Product, SaleRecord } from '@/types/api'

interface EditableSaleRecord {
  id: number
  quantity: number
}

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const products = ref<Product[]>([])
const productsLoading = ref(false)

// 销售记录相关状态
const saleRecords = ref<SaleRecord[]>([])
const recordsLoading = ref(false)

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

// 存储所有记录
const allRecords = ref<SaleRecord[]>([])

// 查询相关状态
const queryProductName = ref('')
const querySalesman = ref('')

// 编辑销售记录相关状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editForm = ref<EditableSaleRecord>({ 
  id: 0,
  quantity: 0
})

const saleForm = reactive<SaleRequest>({
  productId: undefined as any, // 使用undefined以便显示placeholder
  quantity: 0,
  salesmanId: userStore.userInfo?.userId || 0, // 默认当前登录用户，隐藏不显示
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
    { required: true, message: '请输入销售数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '销售数量必须大于0', trigger: 'blur' },
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

// 加载销售记录
const loadSaleRecords = async () => {
  recordsLoading.value = true
  try {
    const res = await saleApi.getSaleRecords()
    if (res.code === 0) {
      allRecords.value = res.data || []
      
      // 根据查询条件过滤数据
      let filteredData = allRecords.value
      if (queryProductName.value) {
        filteredData = filteredData.filter(item => 
          item.productName.toLowerCase().includes(queryProductName.value.toLowerCase())
        )
      }
      
      if (querySalesman.value) {
        filteredData = filteredData.filter(item => 
          item.salesman.toLowerCase().includes(querySalesman.value.toLowerCase())
        )
      }
      
      // 计算总数
      totalRecords.value = filteredData.length
      
      // 计算当前页数据
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      saleRecords.value = filteredData.slice(startIndex, endIndex)
    } else {
      console.error('获取销售记录失败:', res.message)
    }
  } catch (error) {
    console.error('获取销售记录失败:', error)
  } finally {
    recordsLoading.value = false
  }
}

// 查询销售记录
const handleQuery = () => {
  currentPage.value = 1  // 查询时回到第一页
  loadSaleRecords()
}

// 重置查询条件
const resetQuery = () => {
  queryProductName.value = ''
  querySalesman.value = ''
  currentPage.value = 1
  loadSaleRecords()
}

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1  // 每次改变页面大小时回到第一页
  loadSaleRecords()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadSaleRecords()
}

// 价格格式化器
const priceFormatter = (row: SaleRecord, column: any, cellValue: number) => {
  return `¥${cellValue.toLocaleString()}`
}

onMounted(() => {
  loadProducts()
  loadSaleRecords() // 页面加载时获取销售记录
  // 确保销售员ID始终是当前登录用户
  if (userStore.userInfo?.userId) {
    saleForm.salesmanId = userStore.userInfo.userId
  }
})

const handleSale = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 确保销售员ID是当前登录用户
      if (userStore.userInfo?.userId) {
        saleForm.salesmanId = userStore.userInfo.userId
      }

      const selectedProduct = products.value.find(p => p.id === saleForm.productId)
      const productName = selectedProduct?.productName || `ID: ${saleForm.productId}`
      const currentStock = selectedProduct?.stock || 0

      // 检查库存是否充足
      if (saleForm.quantity > currentStock) {
        ElMessage.warning(`库存不足，当前库存: ${currentStock}`)
        return
      }

      try {
        await ElMessageBox.confirm(
          `确认销售产品: ${productName}, 数量: ${saleForm.quantity}?`,
          '确认销售',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )

        submitting.value = true
        await saleApi.sell(saleForm)
        ElMessage.success('销售成功')
        resetForm()
        // 刷新产品列表以更新库存
        loadProducts()
        // 刷新销售记录
        loadSaleRecords()
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('销售失败:', error)
        }
      } finally {
        submitting.value = false
      }
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(saleForm, {
    productId: undefined as any, // 重置为undefined以显示placeholder
    quantity: 0,
    salesmanId: userStore.userInfo?.userId || 0, // 重置时保持当前用户
  })
}

// 处理编辑销售记录
const handleEdit = (row: SaleRecord) => {
  dialogTitle.value = '编辑销售记录'
  // 复制需要编辑的字段到表单
  Object.assign(editForm.value, { 
    id: row.id,
    quantity: row.quantity
  })
  dialogVisible.value = true
}

// 处理删除销售记录
const handleDelete = async (row: SaleRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品 "${row.productName}" 的销售记录吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await saleApi.deleteSaleRecord(row.id)
    ElMessage.success('删除成功')
    // 重新加载数据
    loadSaleRecords()
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
    // 创建完整的销售记录对象用于更新
    const recordToUpdate: SaleRecord = {
      id: editForm.value.id,
      quantity: editForm.value.quantity,
      totalPrice: 0, // 价格字段设为0，让后端重新计算
      productName: '', // 后端可能不需要这些字段，但类型要求
      salesman: '',
      saleTime: ''
    }
    
    await saleApi.updateSaleRecord(recordToUpdate)
    ElMessage.success('更新成功')
    dialogVisible.value = false
    // 重新加载数据
    loadSaleRecords()
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败')
  }
}
</script>

<style scoped>
.sale-container {
  height: 100%;
}
</style>