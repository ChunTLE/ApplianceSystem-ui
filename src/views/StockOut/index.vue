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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { stockApi } from '@/api/stock'
import { productApi } from '@/api/product'
import { useUserStore } from '@/stores/user'
import type { StockRequest, Product } from '@/types/api'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const products = ref<Product[]>([])
const productsLoading = ref(false)

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

onMounted(() => {
  loadProducts()
  // 确保操作员ID始终是当前登录用户
  if (userStore.userInfo?.userId) {
    stockOutForm.operatorId = userStore.userInfo.userId
  }
})

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
</script>

<style scoped>
.stock-out-container {
  height: 100%;
}
</style>

