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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { saleApi } from '@/api/sale'
import { productApi } from '@/api/product'
import { useUserStore } from '@/stores/user'
import type { SaleRequest, Product } from '@/types/api'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const products = ref<Product[]>([])
const productsLoading = ref(false)

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

onMounted(() => {
  loadProducts()
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
</script>

<style scoped>
.sale-container {
  height: 100%;
}
</style>

