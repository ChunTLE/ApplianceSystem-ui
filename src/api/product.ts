import request from '@/utils/request'
import type { Result, Product } from '@/types/api'

/**
 * 产品API
 */
export const productApi = {
  /**
   * 查询所有产品
   */
  getProductList(): Promise<Result<Product[]>> {
    return request.get('/product/list')
  },

  /**
   * 根据ID查询产品
   */
  getProductById(id: number): Promise<Result<Product>> {
    return request.get(`/product/${id}`)
  },
}

