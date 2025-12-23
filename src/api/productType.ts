import request from '@/utils/request'
import type { Result, ProductType } from '@/types/api'

/**
 * 产品类型API
 */
export const productTypeApi = {
  /**
   * 查询所有产品类型
   */
  getTypeList(): Promise<Result<ProductType[]>> {
    return request.get('/product-type/list')
  },

  /**
   * 根据ID查询产品类型
   */
  getTypeById(id: number): Promise<Result<ProductType>> {
    return request.get(`/product-type/${id}`)
  },

  /**
   * 新增产品类型
   */
  saveType(data: ProductType): Promise<Result> {
    return request.post('/product-type', data)
  },

  /**
   * 更新产品类型
   */
  updateType(data: ProductType): Promise<Result> {
    return request.put('/product-type', data)
  },

  /**
   * 删除产品类型
   */
  deleteType(id: number): Promise<Result> {
    return request.delete(`/product-type/${id}`)
  },
}

