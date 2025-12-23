import request from '@/utils/request'
import type { Result, SaleRequest } from '@/types/api'

/**
 * 销售API
 */
export const saleApi = {
  /**
   * 销售产品
   */
  sell(data: SaleRequest): Promise<Result> {
    const params = new URLSearchParams()
    params.append('productId', data.productId.toString())
    params.append('quantity', data.quantity.toString())
    params.append('salesmanId', data.salesmanId.toString())
    return request.post(`/sale/sell?${params.toString()}`)
  },
}

