import _ from 'lodash'
import dayjs from 'dayjs'

/**
 * 生成时间查询条件
 * @param timeRange 时间范围配置
 * @returns 查询条件数组或 null
 */
export const timeQuery = (timeRange: any) => {
  const { type, count, unit, fromNow, time, range, historyTime } = timeRange
  const start = historyTime ? dayjs(historyTime) : dayjs()
  const end = historyTime ? dayjs(historyTime) : dayjs()

  if (type == 'forward' && count && unit) {
    if (!fromNow) {
      return [
        `time >= '${start.startOf(unit).subtract(count, unit).toISOString()}'`,
        `time < '${end.startOf(unit).toISOString()}'`
      ]
    } else {
      return [
        `time >= '${start.subtract(count, unit).toISOString()}'`,
        `time < '${end.toISOString()}'`
      ]
    }
  }

  if (type == 'backward' && count && unit) {
    if (!fromNow) {
      return [
        `time < '${start.endOf(unit).add(count, unit).toISOString()}'`,
        `time > '${end.endOf(unit).toISOString()}'`
      ]
    } else {
      return [
        `time < '${start.add(count, unit).toISOString()}'`,
        `time > '${end.toISOString()}'`
      ]
    }
  }

  if (type == 'now' && unit) {
    return [`time > '${start.startOf(unit).toISOString()}'`, `time <= '${end.toISOString()}'`]
  }

  if (type == 'before' && time) {
    return [`time < '${dayjs(time).toISOString()}'`]
  }

  if (type == 'after' && time) {
    return [`time >= '${dayjs(time).toISOString()}'`]
  }

  if (type == 'between' && range && range.lte && range.gte) {
    return [
      `time >= '${dayjs(range.gte).toISOString()}'`,
      `time <= '${dayjs(range.lte).toISOString()}'`
    ]
  } else if (type === 'between' && range && range.financialMonth) {
    // 处理财务月时间范围
    const { financialMonth } = range
    const { date: financialDate, time: financialTime } = range.financialMonth || {}

    if (financialMonth && financialDate && financialTime) {
      // 解析财务月，格式如 "2025-02"
      const [year, month] = financialMonth.split('-').map(Number)

      // 计算财务月开始时间：当前月的指定日期和时间
      const startTime = dayjs()
        .year(year)
        .month(month - 1) // dayjs的月份从0开始
        .date(financialDate)
        .startOf('day')
        .add(dayjs.duration(financialTime))

      // 计算财务月结束时间：下个月的指定日期和时间减1秒
      const endTime = dayjs(startTime)
        .add(1, 'month')
        .subtract(1, 'second')

      return [
        `time >= '${startTime.toISOString()}'`,
        `time <= '${endTime.toISOString()}'`
      ]
    }
  }

  return null
}

/**
 * 数字格式化
 */
export const numberFormat = (format: string, value: any): any => {
  const num = Number(value)
  if (isNaN(num)) {
    return null
  }

  let result: any = num
  const regex = /^[0-9]$/

  if (format && !regex.test(format)) {
    // 预定义格式
    switch (format) {
      case 'percent':
        result = _.isNumber(result) ? (_.round(result * 100) + '%') : (result || 'n/a')
        break
      case 'percentPoint':
        result = _.isNumber(result) ? (_.round(result * 100, 2) + '%') : (result || 'n/a')
        break
      case 'thousandth':
        result = _.isNumber(result) ? _.round(result).toLocaleString() : (result || 'n/a')
        break
      case 'thousandthPoint':
        result = _.isNumber(result) ? _.round(result, 2).toLocaleString() : (result || 'n/a')
        break
      default:
        break
    }
  } else {
    // 保留 X 位小数
    result = result.toFixed(parseInt(format) || 0)
  }

  if (_.isNaN(result) || result === 'NaN') {
    result = null
  }

  return result
}

/**
 * 日期格式化
 */
export const dateFormat = (format: string, value: any): any => {
  if (!value) {
    return null
  }

  const t = dayjs(value)
  let time: any = t

  switch (format) {
    case '秒级时间戳':
      time = t.unix().toString()
      break
    case '毫秒级时间戳':
      time = t.valueOf().toString()
      break
    case '历史数据时间':
      time = t.toISOString()
      break
    default:
      time = t.format(format)
      break
  }

  if (time === 'Invalid Date') {
    time = null
  }

  return time
}
