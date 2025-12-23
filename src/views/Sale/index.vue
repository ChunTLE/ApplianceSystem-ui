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
        <el-form-item label="产品ID" prop="productId">
          <el-input-number
            v-model="saleForm.productId"
            :min="1"
            placeholder="请输入产品ID"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="销售数量" prop="quantity">
          <el-input-number
            v-model="saleForm.quantity"
            :min="1"
            placeholder="请输入销售数量"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="销售员ID" prop="salesmanId">
          <el-input-number
            v-model="saleForm.salesmanId"
            :min="1"
            placeholder="请输入销售员ID"
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { saleApi } from '@/api/sale'
import type { SaleRequest } from '@/types/api'

const formRef = ref<FormInstance>()
const submitting = ref(false)

const saleForm = reactive<SaleRequest>({
  productId: 0,
  quantity: 0,
  salesmanId: 0,
})

const rules: FormRules = {
  productId: [
    { required: true, message: '请输入产品ID', trigger: 'blur' },
    { type: 'number', min: 1, message: '产品ID必须大于0', trigger: 'blur' },
  ],
  quantity: [
    { required: true, message: '请输入销售数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '销售数量必须大于0', trigger: 'blur' },
  ],
  salesmanId: [
    { required: true, message: '请输入销售员ID', trigger: 'blur' },
    { type: 'number', min: 1, message: '销售员ID必须大于0', trigger: 'blur' },
  ],
}

const handleSale = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await ElMessageBox.confirm(
          `确认销售产品ID: ${saleForm.productId}, 数量: ${saleForm.quantity}?`,
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
    productId: 0,
    quantity: 0,
    salesmanId: 0,
  })
}
</script>

<style scoped>
.sale-container {
  height: 100%;
}
</style>

