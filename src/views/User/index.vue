<template>
  <div class="user-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="userList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="roleId" label="角色ID" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.roleId)">
              {{ getRoleName(row.roleId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
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

      <!-- 编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        @close="resetForm"
      >
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password" v-if="!form.id">
            <el-input v-model="form.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="角色ID" prop="roleId">
            <el-select v-model="form.roleId" style="width: 100%">
              <el-option label="管理员" :value="1" />
              <el-option label="库存人员" :value="2" />
              <el-option label="销售人员" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
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
import { userApi } from '@/api/user'
import type { User } from '@/types/api'

const loading = ref(false)
const userList = ref<User[]>([])
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<User>({
  id: 0,
  username: '',
  password: '',
  roleId: 1,
  status: 1,
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur', validator: (rule, value, callback) => {
      if (!form.id && !value) {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }},
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const dialogTitle = ref('新增用户')

const loadUserList = async () => {
  loading.value = true
  try {
    const res = await userApi.getUserList()
    userList.value = res.data || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增用户'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: User) => {
  dialogTitle.value = '编辑用户'
  Object.assign(form, { ...row, password: '' })
  dialogVisible.value = true
}

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await userApi.deleteUser(row.id!)
    ElMessage.success('删除成功')
    loadUserList()
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
          await userApi.updateUser(form)
        } else {
          await userApi.saveUser(form)
        }
        ElMessage.success('操作成功')
        dialogVisible.value = false
        loadUserList()
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
    username: '',
    password: '',
    roleId: 1,
    status: 1,
  })
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const getRoleName = (roleId: number) => {
  const map: Record<number, string> = { 1: '管理员', 2: '库存人员', 3: '销售人员' }
  return map[roleId] || '未知'
}

const getRoleTagType = (roleId: number) => {
  const map: Record<number, string> = { 1: 'danger', 2: 'warning', 3: 'success' }
  return map[roleId] || ''
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.user-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

