import request from '@/utils/request'
import type { Result, StockWarning } from '@/types/api'

/**
 * 库存预警API
 */
export const stockWarningApi = {
  /**
   * 获取库存预警列表
   */
  getWarningList(threshold?: number): Promise<Result<StockWarning[]>> {
    const params: any = {}
    if (threshold !== undefined) params.threshold = threshold
    return request.get('/stock-warning/list', { params })
  },
}

