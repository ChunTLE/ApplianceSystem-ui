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
    // 可以在这里添加token等
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
      // 否则提示错误信息
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    // 处理HTTP错误
    let message = '请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
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
          message = error.response.data?.message || `请求失败，状态码：${error.response.status}`
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络'
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request

