import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { Result } from '@/types/api'

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加token到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data as Result
    // 如果返回的状态码为0，说明接口请求成功
    if (res.code === 0) {
      return res
    } else {
      // 检查是否是Token过期（code为401）
      if (res.code === 401) {
        // Token过期或无效，清除本地存储并跳转到登录页
        handleTokenExpired(res.message || '登录已过期，请重新登录')
        return Promise.reject(new Error(res.message || '登录已过期'))
      }
      // 否则提示错误信息
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    // 处理HTTP错误
    let message = '请求失败'
    let needRedirect = false
    
    if (error.response) {
      const res = error.response.data as Result
      
      // 优先检查响应体中的code字段（Token过期会在这里）
      if (res && res.code === 401) {
        message = res.message || '登录已过期，请重新登录'
        needRedirect = true
      } else {
        // 根据HTTP状态码处理
        switch (error.response.status) {
          case 400:
            // 检查是否是Token相关的400错误
            if (res && res.code === 401) {
              message = res.message || '登录已过期，请重新登录'
              needRedirect = true
            } else {
              message = res?.message || '请求参数错误'
            }
            break
          case 401:
            message = res?.message || '未授权或Token已过期，请重新登录'
            needRedirect = true
            break
          case 403:
            message = '拒绝访问'
            break
          case 404:
            message = '请求地址不存在'
            break
          case 500:
            message = '服务器内部错误'
            break
          default:
            message = res?.message || `请求失败，状态码：${error.response.status}`
        }
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络'
    }
    
    if (needRedirect) {
      handleTokenExpired(message)
    } else {
      ElMessage.error(message)
    }
    
    return Promise.reject(error)
  }
)

// 标记是否正在处理token过期，避免重复处理
let isHandlingTokenExpired = false

// 处理Token过期的统一方法
function handleTokenExpired(message: string) {
  // 如果正在处理，直接返回，避免重复处理
  if (isHandlingTokenExpired) {
    return
  }
  
  // 立即清除token和用户信息，避免路由守卫再次使用过期token
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  
  // 检查当前是否已经在登录页
  const currentPath = window.location.pathname
  if (currentPath === '/login' || currentPath.startsWith('/login')) {
    // 已经在登录页，只提示，不跳转
    ElMessage.warning(message)
    return
  }
  
  // 标记正在处理
  isHandlingTokenExpired = true
  
  // 显示提示
  ElMessage.warning(message)
  
  // 跳转到登录页
  setTimeout(() => {
    // 再次检查路径，避免重复跳转
    const currentPath = window.location.pathname
    if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
      // 使用replace避免在历史记录中留下记录
      window.location.replace('/login')
    }
    // 重置标记
    setTimeout(() => {
      isHandlingTokenExpired = false
    }, 1000)
  }, 500)
}

export default request

