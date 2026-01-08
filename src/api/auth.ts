import request from '@/utils/request'
import type { Result, LoginRequest, LoginResponse, RegisterRequest } from '@/types/api'

/**
 * 认证API
 */
export const authApi = {
  /**
   * 用户登录
   */
  login(data: LoginRequest): Promise<Result<LoginResponse>> {
    return request.post('/auth/login', data)
  },
  
  /**
   * 用户注册
   */
  register(data: RegisterRequest): Promise<Result<void>> {
    return request.post('/auth/register', data)
  },
}

