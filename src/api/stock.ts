import request from '@/utils/request'
import type { Result, StockRequest } from '@/types/api'

/**
 * 库存API
 */
export const stockApi = {
  /**
   * 产品入库
   */
  stockIn(data: StockRequest): Promise<Result> {
    const params = new URLSearchParams()
    params.append('productId', data.productId.toString())
    params.append('quantity', data.quantity.toString())
    params.append('operatorId', data.operatorId.toString())
    return request.post(`/stock/in?${params.toString()}`)
  },

  /**
   * 产品出库
   */
  stockOut(data: StockRequest): Promise<Result> {
    const params = new URLSearchParams()
    params.append('productId', data.productId.toString())
    params.append('quantity', data.quantity.toString())
    params.append('operatorId', data.operatorId.toString())
    return request.post(`/stock/out?${params.toString()}`)
  },
}

