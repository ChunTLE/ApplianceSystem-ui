import request from '@/utils/request'
import type { Result, Product, PageResult } from '@/types/api'

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
    return request.get(`/product/${id.toString()}`)
  },

  /**
   * 搜索产品
   */
  searchProduct(productName?: string, typeId?: number): Promise<Result<Product[]>> {
    const params: any = {}
    if (productName) params.productName = productName
    if (typeId) params.typeId = typeId
    return request.get('/product/search', { params })
  },

  /**
   * 新增产品
   */
  saveProduct(product: Omit<Product, 'id'>): Promise<Result<number>> {
    return request.post('/product', product)
  },

  /**
   * 更新产品
   */
  updateProduct(product: Product): Promise<Result> {
    return request.put(`/product/${product.id.toString()}`, product)
  },

  /**
   * 删除产品
   */
  deleteProduct(id: number): Promise<Result> {
    return request.delete(`/product/${id.toString()}`)
  },

  /**
   * 获取所有产品（用于前端分页）
   */
  getAllProducts(): Promise<Result<Product[]>> {
    return request.get('/product/list')
  },
}
