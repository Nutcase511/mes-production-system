import cloneDeep from 'lodash/cloneDeep'
import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isEmpty from 'lodash/isEmpty'
import merge from 'lodash/merge'
import React from 'react'
import { BaseChart, BaseChartProps } from './BaseChart'

// 递归，字符串转函数
const StrToFunction = (obj: any): any => {
  const result = cloneDeep(obj)
  for (const key in result) {
    if (isString(result[key]) && result[key].indexOf(' => ') > -1) {
      try {
        const func = new Function(`return ${result[key]}`)
        result[key] = func()
      } catch (e) {
        result[key] = result[key]
      }
    } else if (isObject(result[key])) {
      result[key] = StrToFunction(result[key])
    }
  }
  return result
}

export interface ChartEchartsProps extends Omit<BaseChartProps, 'option'> {
  title?: string
  option?: any
  chartCode?: string
  chartData?: any
  seriesOption?: any
}

const ChartEcharts: React.FC<ChartEchartsProps> = (props) => {
  const { option, chartCode, chartData, seriesOption} = props

  let newOption = option || { series: [seriesOption] }

  if (chartData && !isEmpty(chartData)) {
    const dataset = chartData
    newOption = {
      ...newOption,
      dataset
    }

    const d = chartData?.dimensions
    if (d && d[0] && d[0]?.type == 'time') {
      if (newOption.xAxis) newOption = merge(newOption, { xAxis: { type: 'time' } })
      newOption.series = newOption.series.slice(0, d.length - 1).map((s: any, i: number) => {
        return ['bar', 'line'].indexOf(s.type) > -1 ? { ...s, encode: { x: 0, y: i + 1 } } : s
      })
    }
  } else if (chartData) {
    // 如果配置了数据源，但是还没查询回来的话，不展示默认值
    delete newOption.dataset
  }

  return (
    <BaseChart
      option={StrToFunction(newOption || option)}
      chartCode={chartCode}
      {...props}
    />
  )
}

export { ChartEcharts }
