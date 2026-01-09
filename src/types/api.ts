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
  typeName?: string  // 产品类型名称
  price: number
  stock: number
  status: number
  createTime: string
}

/**
 * 产品类型
 */
export interface ProductType {
  id: number
  typeName: string
  remark?: string
}

/**
 * 用户信息
 */
export interface User {
  id: number | string  // 使用 string 或 number，避免大整数精度丢失
  username: string
  password?: string
  roleId: number
  status: number
  createTime?: string
}

/**
 * 登录请求
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  username: string
  password: string
  roleId: number // 2-库存人员，3-销售人员
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  userId: number
  username: string
  roleId: number
  roleName: string
  roleCode: string
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

/**
 * 统计信息
 */
export interface StatisticsVO {
  label: string
  count: number
  totalAmount: number
  productName?: string  // 产品名称（可选）
}

/**
 * 库存预警
 */
export interface StockWarning {
  productId: number
  productName: string
  stock: number
  threshold: number
  level: number
}
