<template>
  <div class="product-type-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品类型管理</span>
          <el-button type="primary" @click="handleAdd">新增类型</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="typeList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="typeName" label="类型名称" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        @close="resetForm"
      >
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
          <el-form-item label="类型名称" prop="typeName">
            <el-input v-model="form.typeName" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { productTypeApi } from '@/api/productType'
import type { ProductType } from '@/types/api'

const loading = ref(false)
const typeList = ref<ProductType[]>([])
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<ProductType>({
  id: 0,
  typeName: '',
  remark: '',
})

const rules: FormRules = {
  typeName: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
}

const dialogTitle = ref('新增类型')

const loadTypeList = async () => {
  loading.value = true
  try {
    const res = await productTypeApi.getTypeList()
    typeList.value = res.data || []
  } catch (error) {
    console.error('加载类型列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增类型'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: ProductType) => {
  dialogTitle.value = '编辑类型'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = async (row: ProductType) => {
  try {
    await ElMessageBox.confirm('确定要删除该类型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await productTypeApi.deleteType(row.id!)
    ElMessage.success('删除成功')
    loadTypeList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          await productTypeApi.updateType(form)
        } else {
          await productTypeApi.saveType(form)
        }
        ElMessage.success('操作成功')
        dialogVisible.value = false
        loadTypeList()
      } catch (error) {
        console.error('操作失败:', error)
      }
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: 0,
    typeName: '',
    remark: '',
  })
}

onMounted(() => {
  loadTypeList()
})
</script>

<style scoped>
.product-type-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

