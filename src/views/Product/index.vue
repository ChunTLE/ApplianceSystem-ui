<template>
  <div class="product-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品列表</span>
          <div>
            <el-button type="primary" @click="handleNew">新建</el-button>
            <el-button type="primary" @click="loadProductList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="productList"
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'id', order: 'ascending' }"
      >
        <el-table-column prop="id" label="产品ID" width="100" sortable />
        <el-table-column prop="productName" label="产品名称" min-width="150" />
        <el-table-column prop="typeName" label="产品类型" width="150">
          <template #default="{ row }">
            <span v-if="row.typeName">{{ row.typeName }}</span>
            <span v-else>{{ getTypeNameById(row.typeId) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.price?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="{ row }">
            <el-tag :type="row.stock > 50 ? 'success' : row.stock > 10 ? 'warning' : 'danger'">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品类型" prop="typeId">
          <el-select v-model="form.typeId" placeholder="请选择产品类型" style="width: 100%" clearable>
            <el-option
              v-for="type in typeList"
              :key="type.id"
              :label="type.typeName"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number 
            v-model="form.price" 
            :min="0" 
            :precision="2"
            :step="0.01"
            placeholder="请输入价格" 
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number 
            v-model="form.stock" 
            :min="0" 
            :precision="0"
            placeholder="请输入库存" 
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { productApi } from '@/api/product'
import { productTypeApi } from '@/api/productType'
import type { Product, ProductType } from '@/types/api'

const loading = ref(false)
const productList = ref<Product[]>([])
const typeList = ref<ProductType[]>([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('编辑产品')
const formRef = ref<FormInstance>()
const form = ref<Omit<Product, 'createTime' | 'typeName'> & { createTime?: string, typeName?: string }>({
  id: 0,
  productName: '',
  typeId: 0,
  price: 0,
  stock: 0,
  status: 1
})

const rules: FormRules = {
  productName: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
    { min: 1, max: 50, message: '产品名称长度应在1-50个字符之间', trigger: 'blur' }
  ],
  typeId: [
    { required: true, message: '请输入产品类型', trigger: 'blur' },
    { type: 'number', min: 1, message: '类型ID必须大于0', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能小于0', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const loadProductList = async () => {
  loading.value = true
  try {
    const res = await productApi.getProductList()
    productList.value = res.data || []
    // 调试：检查数据
    console.log('产品列表数据:', productList.value)
    if (productList.value.length > 0) {
      console.log('第一个产品的数据:', productList.value[0])
      console.log('第一个产品的typeName:', productList.value[0].typeName)
    }
    // ElMessage.success('加载成功')
  } catch (error) {
    console.error('加载产品列表失败:', error)
    ElMessage.error('加载产品列表失败')
  } finally {
    loading.value = false
  }
}

// 加载产品类型列表
const loadTypeList = async () => {
  try {
    const res = await productTypeApi.getTypeList()
    typeList.value = res.data || []
  } catch (error) {
    console.error('加载类型列表失败:', error)
    ElMessage.error('加载类型列表失败')
  }
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

// 根据类型ID获取类型名称
const getTypeNameById = (typeId: number) => {
  const type = typeList.value.find(t => t.id === typeId)
  return type ? type.typeName : `类型ID: ${typeId}`
}

// 新建功能
const handleNew = () => {
  dialogTitle.value = '新建产品'
  resetForm()
  dialogVisible.value = true
}

// 编辑功能
const handleEdit = (row: Product) => {
  dialogTitle.value = '编辑产品'
  // 复制产品数据到表单
  Object.assign(form.value, { ...row })
  // console.log('编辑产品数据:', form.value)
  dialogVisible.value = true
}

// 删除功能
const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品 "${row.productName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 验证id是否存在
    if (!row.id) {
      ElMessage.error('产品ID不存在，无法删除')
      console.error('删除失败: 产品ID为', row)
      return
    }
    
    await productApi.deleteProduct(row.id)
    ElMessage.success('删除成功')
    loadProductList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      // 显示错误消息
      const errorMessage = error?.response?.data?.message || error?.message || '删除失败，请稍后重试'
      ElMessage.error(errorMessage)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.value.id) {
          // 更新产品
          await productApi.updateProduct(form.value as Product)
          ElMessage.success('更新成功')
        } else {
          // 新增产品
          await productApi.saveProduct({
            productName: form.value.productName,
            typeId: form.value.typeId,
            price: form.value.price,
            stock: form.value.stock,
            status: form.value.status
          })
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadProductList()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form.value, {
    id: 0,
    productName: '',
    typeId: 0,
    price: 0,
    stock: 0,
    status: 1
  })
}

onMounted(() => {
  loadProductList()
  loadTypeList()
})
</script>

<style scoped>
.product-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>