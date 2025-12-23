import request from '@/utils/request'
import type { Result, User } from '@/types/api'

/**
 * 用户API
 */
export const userApi = {
  /**
   * 查询所有用户
   */
  getUserList(): Promise<Result<User[]>> {
    return request.get('/user/list')
  },

  /**
   * 根据ID查询用户
   */
  getUserById(id: number): Promise<Result<User>> {
    return request.get(`/user/${id}`)
  },

  /**
   * 新增用户
   */
  saveUser(data: User): Promise<Result> {
    return request.post('/user', data)
  },

  /**
   * 更新用户
   */
  updateUser(data: User): Promise<Result> {
    return request.put('/user', data)
  },

  /**
   * 删除用户
   */
  deleteUser(id: number): Promise<Result> {
    return request.delete(`/user/${id}`)
  },
}

