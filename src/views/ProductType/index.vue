<template>
  <div class="product-type-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品类型管理</span>
          <el-button type="primary" @click="handleAdd">新增类型</el-button>
        </div>
      </template>

      <!-- 搜索条件 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="类型名称">
          <el-input
            v-model="searchForm.typeName"
            placeholder="请输入类型名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="typeList" stripe style="width: 100%">
        <el-table-column prop="typeName" label="类型名称" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
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

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

// 存储所有类型数据
const allTypes = ref<ProductType[]>([])

const form = reactive<ProductType>({
  id: 0,
  typeName: '',
  remark: '',
})

const rules: FormRules = {
  typeName: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
}

const dialogTitle = ref('新增类型')

// 查询相关状态
const searchForm = reactive({
  typeName: '',
})

const loadTypeList = async () => {
  loading.value = true
  try {
    const res = await productTypeApi.getTypeList()
    allTypes.value = res.data || []
    
    // 根据查询条件过滤数据
    let filteredData = allTypes.value
    if (searchForm.typeName) {
      filteredData = filteredData.filter(item => 
        item.typeName.toLowerCase().includes(searchForm.typeName.toLowerCase())
      )
    }
    
    // 计算总数
    totalRecords.value = filteredData.length
    
    // 计算当前页数据
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    typeList.value = filteredData.slice(startIndex, endIndex)
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
    // 重新加载数据并重置到第一页
    currentPage.value = 1
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
        // 重新加载数据并重置到第一页
        currentPage.value = 1
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

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1  // 每次改变页面大小时回到第一页
  // 重新计算当前页数据
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  typeList.value = allTypes.value.slice(startIndex, endIndex)
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 计算当前页数据
  const filteredData = allTypes.value.filter(item => 
    !searchForm.typeName || item.typeName.toLowerCase().includes(searchForm.typeName.toLowerCase())
  )
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  typeList.value = filteredData.slice(startIndex, endIndex)
}

// 处理查询
const handleSearch = () => {
  currentPage.value = 1  // 查询时回到第一页
  loadTypeList()
}

// 重置查询
const resetSearch = () => {
  searchForm.typeName = ''
  currentPage.value = 1  // 重置时回到第一页
  loadTypeList()
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

.search-form {
  margin-bottom: 20px;
}
</style>

