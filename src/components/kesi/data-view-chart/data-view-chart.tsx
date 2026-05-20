import cloneDeep from 'lodash/cloneDeep'
import has from 'lodash/has'
import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isEmpty from 'lodash/isEmpty'
import isNaN from 'lodash/isNaN'
import merge from 'lodash/merge'
import React from 'react'
import dayjs from 'dayjs'
import { BaseChart, BaseChartProps } from '@/components/kesi/chart-echarts/BaseChart'
import { createAPI, getSettings } from '@airiot/client'

// ECharts 图表类型定义
interface EChartSchema {
  key: string
  echartType: string
  roseType?: boolean
}

const echartSchema: EChartSchema[] = [
  { key: 'bar', echartType: 'bar' },
  { key: 'line', echartType: 'line' },
  { key: 'scatter', echartType: 'scatter' },
  { key: 'pie', echartType: 'pie', roseType: false }
]

// 图表统计数据接口
interface ChartStat {
  stacked?: boolean
  nCategories?: number
  nStacks?: number
  nValues?: number
  grouped?: boolean
}

// 图表字段接口
interface ChartField {
  name: string
  alias?: string
  alias_en?: string
  biType?: string
}

// 图表维度接口
interface ChartDimension {
  id?: string
  name: string
  alias?: string
  alias_en?: string
  timeFormat?: string
}

// 图表数据接口
interface ChartData {
  fields: ChartField[]
  data?: any[][]
  stat?: ChartStat
  style?: {
    dimension?: ChartDimension[]
    echartType?: string
    measure?: any[]
    baseValue?: {
      option?: any
    }
  }
}

// 递归，字符串转函数
const StrToFunction = (obj: any): any => {
  const result = cloneDeep(obj)
  for (const key in result) {
    if (has(result, key)) {
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
  }
  return result
}

// 内容国际化
const getAliasLang = async (item: ChartField | undefined) => {
  if (!item) return undefined
  const settings = await getSettings()
  const { language } = settings

  if (language && language !== 'zh_Hans') {
    const aliasKey = `alias_${language}` as keyof ChartField
    return (item[aliasKey] as string) || item.alias
  }
  return item.alias
}

// 格式化时间
const formatTime = (datas: any[], chart: ChartData): any[] => {
  if (isEmpty(datas)) return datas
  const fs = chart.fields || []
  const ds = chart.style?.dimension || []
  return datas.map((d, i) => {
    if (fs[i]?.biType === 'time' && ds[i]?.timeFormat) {
      return d ? dayjs(d).format(ds[i].timeFormat!) : d
    }
    return d
  })
}

// 获取堆叠柱状图配置
const getStackBarOption = (chart: ChartData): any => {
  if (!chart.stat?.stacked || !chart.fields) {
    return {}
  }
  const n = chart.stat.nCategories || 0
  const m = (chart.stat.nCategories || 0) + (chart.stat.nStacks || 0)

  const labels = new Set<string>()
  const stacks = new Set<string>()
  const source: any[][] = []
  const stackField = chart.fields[m - 1]
  const stack = stackField?.name || 'stack'
  const dimensions = [
    chart.fields[0]?.name,
    chart.fields[m]?.name,
    stack
  ].filter(Boolean)

  if (chart.data) {
    chart.data.forEach(data => {
      const key = formatTime(data.slice(0, n), chart).join('\n')
      labels.add(key)
      source.push([key, data[m], data[m - 1]])
      stacks.add(data[m - 1])
    })
  }

  const dataset: Array<{ dimensions?: string[]; source?: any[][]; sourceHeader?: boolean; transform?: any }> = [{ dimensions, source, sourceHeader: false }]

  const stackList = Array.from(stacks)
  for (let i = 0; i < stackList.length; i++) {
    dataset.push({
      transform: {
        type: 'filter',
        config: { dimension: stack, value: stackList[i] }
      }
    })
  }

  const series = stackList.map((label) => ({
    type: 'bar',
    stack: 'total',
    datasetIndex: label ? stackList.indexOf(label) + 1 : 1,
    name: label,
    emphasis: {
      focus: 'series'
    }
  }))

  return {
    dataset,
    xAxis: { type: 'category' },
    yAxis: { type: 'value' },
    series,
    legend: { type: 'scroll', right: 10 },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
}

// 获取通用图表配置
const getCommonOption = (chart: ChartData): any => {
  if (isEmpty(chart) || !chart.stat) {
    return undefined
  }
  const n = chart.stat.nCategories || 0
  const m = (chart.stat.nCategories || 0) + (chart.stat.nStacks || 0)
  const nValues = chart.stat.nValues || 0

  const current = chart?.style?.echartType
    ? echartSchema.find((val) => chart?.style?.echartType === val?.key)
    : { key: 'bar', echartType: 'bar' }

  const source: any[][] = []
  const isXValue = n === 0 && nValues > 1 && ['line', 'scatter'].includes(current?.echartType || '')
  const d1 = chart?.fields?.slice(0, n)?.map((f) => getAliasLang(f) || f?.name).join('\n')
  const d2 = chart.fields?.[n]?.name
  const dimensions = chart?.fields?.length
    ? isXValue
      ? [chart.fields[0]?.name, chart.fields[1]?.name]
      : [d1, d2]
    : []

  if (chart.data) {
    chart.data.forEach((data) => {
      const key = formatTime(data.slice(0, n), chart).join('\n')
      if (isXValue) {
        source.push([data[0], data[1]])
      } else {
        source.push([key, data[m]])
      }
    })
  }

  if (chart.stat?.grouped && current?.echartType === 'pie') {
    source.forEach((s) => {
      if (!isNaN(Number(s[nValues]))) {
        s[nValues] = Number(s[nValues])
      }
    })
  }

  const series = chart?.style?.measure?.length
    ? chart?.style?.measure.map(() => {
      if (current?.echartType === 'pie') {
        const pieOption: any = {
          name: d2,
          type: current?.echartType,
          center: ['50%', '50%'],
          itemStyle: { borderRadius: 5 },
          label: { show: false },
          emphasis: { label: { show: true } },
          data: source.map((s) => s[nValues])
        }
        if (current?.roseType) {
          return {
            ...pieOption,
            radius: [20, 140],
            roseType: 'radius'
          }
        }
        return pieOption
      }
      return { type: current?.echartType, data: source.map((s) => s[nValues]) }
    })
    : []

  const option: any = {
    dataset: [{ dimensions, source, sourceHeader: false }],
    grid: {},
    legend: {
      right: 10
    },
    tooltip: {
      show: true
    },
    series
  }

  if (isXValue) {
    option.xAxis = { type: 'value', data: source.map((s) => s[0]) }
    option.yAxis = { type: 'value' }
  } else if (current?.echartType !== 'pie') {
    option.xAxis = { type: 'category', data: source.map((s) => s[0]) }
    option.yAxis = {}
    option.dataZoom = {}
  }
  return option
}

// 获取图表配置
const getChartOption = (data: ChartData | null, echartOption: any): any => {
  if (!data) return echartOption
  const eOption = echartOption || data?.style?.baseValue?.option || {}
  const chartOption = data?.stat?.stacked ? getStackBarOption(data) : getCommonOption(data)
  return chartOption ? merge({}, chartOption, JSON.parse(JSON.stringify(eOption))) : eOption
}

export interface View {
  id: string
  name: string
  datasetId: string
}

export interface ChartEchartsProps extends Omit<BaseChartProps, 'option'> {
  view?: View
  echartOption?: any
  chartCode?: string
}

const ChartEcharts: React.FC<ChartEchartsProps> = (props) => {
  const { view, echartOption, chartCode } = props

  const [chartData, setChartData] = React.useState<ChartData | null>(null)

  React.useEffect(() => {
    if (view?.id) {
      const api = createAPI({
        resource: 'ds/view/preview',
        name: 'ds-view-preview'
      })
      api
        .fetch(`?id=${view.id}`, {
          method: 'POST',
          body: JSON.stringify(view)
        })
        .then(({ json }: { json: ChartData }) => {
          setChartData(json)
        })
        .catch((error) => {
        })
    }
  }, [view?.id])

  if (!view?.id) {
    return null
  }

  const chartOption = getChartOption(chartData, echartOption)

  return (
    <BaseChart option={StrToFunction(chartOption)} chartCode={chartCode} {...props} />
  )
}

ChartEcharts.displayName = 'ChartEcharts'

export { ChartEcharts }
