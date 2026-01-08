<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>家电库存管理系统</h2>
        </div>
      </template>

      <el-form :model="loginForm" :rules="rules" ref="formRef" label-width="80px" @submit.prevent="handleLogin">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" clearable />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password
            @keyup.enter="handleLogin" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button type="default" @click="showRegisterDialog" style="width: 100%">
            注册
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 注册对话框 -->
    <el-dialog v-model="registerDialogVisible" title="用户注册" width="400px" :close-on-click-modal="false">
      <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码（至少6位）" 
            show-password clearable />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" 
            show-password clearable />
        </el-form-item>
        
        <el-form-item label="角色类型" prop="roleId">
          <el-select v-model="registerForm.roleId" placeholder="请选择角色类型" style="width: 100%">
            <el-option label="库存人员" :value="2" />
            <el-option label="销售人员" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="registerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRegister" :loading="registerLoading">注册</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { authApi } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)
const registerLoading = ref(false)
const registerDialogVisible = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  roleId: 2, // 默认选择库存人员
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// 验证确认密码
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色类型', trigger: 'change' }
  ],
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await authApi.login(loginForm)
        userStore.setToken(res.data.token)
        userStore.setUserInfo(res.data)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error: any) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const showRegisterDialog = () => {
  registerDialogVisible.value = true
  // 重置注册表单
  registerForm.username = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerForm.roleId = 2
  // 清除验证状态
  if (registerFormRef.value) {
    registerFormRef.value.clearValidate()
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      registerLoading.value = true
      try {
        await authApi.register({
          username: registerForm.username,
          password: registerForm.password,
          roleId: registerForm.roleId
        })
        ElMessage.success('注册成功，请登录')
        registerDialogVisible.value = false
        // 自动填充用户名到登录表单
        loginForm.username = registerForm.username
      } catch (error: any) {
        console.error('注册失败:', error)
      } finally {
        registerLoading.value = false
      }
    }
  })
}

</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}
</style>
