import request from '@/utils/request'
import type { Result, LoginRequest, LoginResponse } from '@/types/api'

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
}

