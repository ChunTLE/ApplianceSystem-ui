import request from '@/utils/request'
import type { Result, SaleRequest, SaleRecord } from '@/types/api'

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

  /**
   * 获取销售记录
   */
  getSaleRecords(): Promise<Result<SaleRecord[]>> {
    return request.get('/sale/records')
  },

  /**
   * 更新销售记录
   */
  updateSaleRecord(data: Partial<SaleRecord>): Promise<Result> {
    return request.put('/sale/update', data)
  },

  /**
   * 删除销售记录
   */
  deleteSaleRecord(id: number): Promise<Result> {
    return request.delete(`/sale/${id.toString()}`)
  },
}

