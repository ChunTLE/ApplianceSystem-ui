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
        <el-form-item label="产品ID" prop="productId">
          <el-input-number
            v-model="stockInForm.productId"
            :min="1"
            placeholder="请输入产品ID"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="入库数量" prop="quantity">
          <el-input-number
            v-model="stockInForm.quantity"
            :min="1"
            placeholder="请输入入库数量"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="操作员ID" prop="operatorId">
          <el-input-number
            v-model="stockInForm.operatorId"
            :min="1"
            placeholder="请输入操作员ID"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { stockApi } from '@/api/stock'
import { useUserStore } from '@/stores/user'
import type { StockRequest } from '@/types/api'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const stockInForm = reactive<StockRequest>({
  productId: 0,
  quantity: 0,
  operatorId: userStore.userInfo?.userId || 0,
})

const rules: FormRules = {
  productId: [
    { required: true, message: '请输入产品ID', trigger: 'blur' },
    { type: 'number', min: 1, message: '产品ID必须大于0', trigger: 'blur' },
  ],
  quantity: [
    { required: true, message: '请输入入库数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '入库数量必须大于0', trigger: 'blur' },
  ],
  operatorId: [
    { required: true, message: '请输入操作员ID', trigger: 'blur' },
    { type: 'number', min: 1, message: '操作员ID必须大于0', trigger: 'blur' },
  ],
}

const handleStockIn = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await ElMessageBox.confirm(
          `确认入库产品ID: ${stockInForm.productId}, 数量: ${stockInForm.quantity}?`,
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
    productId: 0,
    quantity: 0,
    operatorId: userStore.userInfo?.userId || 0,
  })
}
</script>

<style scoped>
.stock-in-container {
  height: 100%;
}
</style>

