/**
 * API响应结果类型
 */
export interface Result<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 产品信息
 */
export interface Product {
  id: number
  productName: string
  typeId: number
  price: number
  stock: number
  status: number
  createTime: string
}

/**
 * 销售请求参数
 */
export interface SaleRequest {
  productId: number
  quantity: number
  salesmanId: number
}

/**
 * 库存操作请求参数
 */
export interface StockRequest {
  productId: number
  quantity: number
  operatorId: number
}

