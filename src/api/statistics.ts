import request from '@/utils/request'
import type {Result, StatisticsVO, StockInChartVO, SaleDetailVO, SaleChartVO} from '@/types/api'

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
   * 入库统计图表数据
   */
  getStockInChart(startDate?: string, endDate?: string): Promise<Result<StockInChartVO>> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return request.get('/statistics/stock-in-chart', { params })
  },

  /**
   * 出库统计图表数据
   */
  getStockOutChart(startDate?: string, endDate?: string): Promise<Result<StockInChartVO>> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return request.get('/statistics/stock-out-chart', { params })
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
   * 销售统计详情
   */
  getSaleDetailStatistics(startDate?: string, endDate?: string): Promise<Result<SaleDetailVO[]>> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return request.get('/statistics/sale-detail', { params })
  },

  /**
   * 销售统计图表数据
   */
  getSaleChart(startDate?: string, endDate?: string): Promise<Result<SaleChartVO>> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return request.get('/statistics/sale-chart', { params })
  },
}

