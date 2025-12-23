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
        <el-form-item label="产品ID" prop="productId">
          <el-input-number
            v-model="stockOutForm.productId"
            :min="1"
            placeholder="请输入产品ID"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="出库数量" prop="quantity">
          <el-input-number
            v-model="stockOutForm.quantity"
            :min="1"
            placeholder="请输入出库数量"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="操作员ID" prop="operatorId">
          <el-input-number
            v-model="stockOutForm.operatorId"
            :min="1"
            placeholder="请输入操作员ID"
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { stockApi } from '@/api/stock'
import { useUserStore } from '@/stores/user'
import type { StockRequest } from '@/types/api'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const stockOutForm = reactive<StockRequest>({
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
    { required: true, message: '请输入出库数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '出库数量必须大于0', trigger: 'blur' },
  ],
  operatorId: [
    { required: true, message: '请输入操作员ID', trigger: 'blur' },
    { type: 'number', min: 1, message: '操作员ID必须大于0', trigger: 'blur' },
  ],
}

const handleStockOut = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await ElMessageBox.confirm(
          `确认出库产品ID: ${stockOutForm.productId}, 数量: ${stockOutForm.quantity}?`,
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
    productId: 0,
    quantity: 0,
    operatorId: userStore.userInfo?.userId || 0,
  })
}
</script>

<style scoped>
.stock-out-container {
  height: 100%;
}
</style>

