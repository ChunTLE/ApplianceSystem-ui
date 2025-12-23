<template>
  <div class="stock-container">
    <el-row :gutter="20">
      <!-- 入库 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>产品入库</span>
          </template>

          <el-form
            :model="stockInForm"
            :rules="rules"
            ref="stockInFormRef"
            label-width="120px"
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
              <el-button type="success" @click="handleStockIn" :loading="stockInSubmitting">
                确认入库
              </el-button>
              <el-button @click="resetStockInForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 出库 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>产品出库</span>
          </template>

          <el-form
            :model="stockOutForm"
            :rules="rules"
            ref="stockOutFormRef"
            label-width="120px"
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
              <el-button type="warning" @click="handleStockOut" :loading="stockOutSubmitting">
                确认出库
              </el-button>
              <el-button @click="resetStockOutForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { stockApi } from '@/api/stock'
import type { StockRequest } from '@/types/api'

const stockInFormRef = ref<FormInstance>()
const stockOutFormRef = ref<FormInstance>()
const stockInSubmitting = ref(false)
const stockOutSubmitting = ref(false)

const stockInForm = reactive<StockRequest>({
  productId: 0,
  quantity: 0,
  operatorId: 0,
})

const stockOutForm = reactive<StockRequest>({
  productId: 0,
  quantity: 0,
  operatorId: 0,
})

const rules: FormRules = {
  productId: [
    { required: true, message: '请输入产品ID', trigger: 'blur' },
    { type: 'number', min: 1, message: '产品ID必须大于0', trigger: 'blur' },
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' },
  ],
  operatorId: [
    { required: true, message: '请输入操作员ID', trigger: 'blur' },
    { type: 'number', min: 1, message: '操作员ID必须大于0', trigger: 'blur' },
  ],
}

const handleStockIn = async () => {
  if (!stockInFormRef.value) return

  await stockInFormRef.value.validate(async (valid) => {
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

        stockInSubmitting.value = true
        await stockApi.stockIn(stockInForm)
        ElMessage.success('入库成功')
        resetStockInForm()
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('入库失败:', error)
        }
      } finally {
        stockInSubmitting.value = false
      }
    }
  })
}

const handleStockOut = async () => {
  if (!stockOutFormRef.value) return

  await stockOutFormRef.value.validate(async (valid) => {
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

        stockOutSubmitting.value = true
        await stockApi.stockOut(stockOutForm)
        ElMessage.success('出库成功')
        resetStockOutForm()
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('出库失败:', error)
        }
      } finally {
        stockOutSubmitting.value = false
      }
    }
  })
}

const resetStockInForm = () => {
  stockInFormRef.value?.resetFields()
  Object.assign(stockInForm, {
    productId: 0,
    quantity: 0,
    operatorId: 0,
  })
}

const resetStockOutForm = () => {
  stockOutFormRef.value?.resetFields()
  Object.assign(stockOutForm, {
    productId: 0,
    quantity: 0,
    operatorId: 0,
  })
}
</script>

<style scoped>
.stock-container {
  height: 100%;
}
</style>

