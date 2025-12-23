import request from '@/utils/request'
import type { Result, StatisticsVO } from '@/types/api'

/**
 * 统计API
 */
export const statisticsApi = {
  /**
   * 入库统计（按日期）
   */
  getStockInStatistics(startDate?: string, endDate?: string): Promise<Result<StatisticsVO[]>> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return request.get('/statistics/stock-in', { params })
  },

  /**
   * 出库统计（按日期）
   */
  getStockOutStatistics(startDate?: string, endDate?: string): Promise<Result<StatisticsVO[]>> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return request.get('/statistics/stock-out', { params })
  },

  /**
   * 销售统计（按日期）
   */
  getSaleStatistics(startDate?: string, endDate?: string): Promise<Result<StatisticsVO[]>> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return request.get('/statistics/sale', { params })
  },

  /**
   * 销售统计（按产品）
   */
  getSaleStatisticsByProduct(startDate?: string, endDate?: string): Promise<Result<StatisticsVO[]>> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return request.get('/statistics/sale-by-product', { params })
  },
}

