import request from '@/utils/request'
import type { Result, StockRequest, StockInRecord, StockOutRecord } from '@/types/api'

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

  /**
   * 获取入库记录
   */
  getStockInRecords(): Promise<Result<StockInRecord[]>> {
    return request.get('/stock/in-records')
  },

  /**
   * 获取出库记录
   */
  getStockOutRecords(): Promise<Result<StockOutRecord[]>> {
    return request.get('/stock/out-records')
  },

  /**
   * 更新入库记录
   */
  updateStockInRecord(data: StockInRecord): Promise<Result> {
    return request.put('/stock/in', data)
  },

  /**
   * 删除入库记录
   */
  deleteStockInRecord(id: number): Promise<Result> {
    return request.delete(`/stock/in/${id.toString()}`)
  },

  /**
   * 更新出库记录
   */
  updateStockOutRecord(data: StockOutRecord): Promise<Result> {
    return request.put('/stock/out', data)
  },

  /**
   * 删除出库记录
   */
  deleteStockOutRecord(id: number): Promise<Result> {
    return request.delete(`/stock/out/${id.toString()}`)
  },
}

