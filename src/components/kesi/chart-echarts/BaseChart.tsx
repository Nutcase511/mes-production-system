import * as echarts from 'echarts'
import * as echartsStat from 'echarts-stat'
import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'
import elementResizeEvent from 'element-resize-event'
import isEmpty from 'lodash/isEmpty'
import merge from 'lodash/merge'

// 注册 echarts-stat 的转换器
echarts.registerTransform(echartsStat.transform.regression)
import 'echarts-gl'

// 判断 dataset 格式是否正确
const dataValid = (data: any): boolean => {
  if (isEmpty(data)) return true
  if (data.source) return true
  if (data[0]?.source) return true
  return false
}

// 绑定事件
const bindEvents = (instance: any, events: Record<string, Function> = {}) => {
  for (const eventName in events) {
    if (typeof eventName === 'string' && typeof events[eventName] === 'function') {
      instance.off(eventName)
      instance.on(eventName, (param: any) => {
        events[eventName](param, instance)
      })
    }
  }
}

export interface BaseChartProps {
  size?: { width?: string | number; height?: string | number }
  theme?: any
  option?: any
  chartCode?: string
  cellKey?: string
  style?: React.CSSProperties
  className?: string
  onEvents?: Record<string, Function>
  onChartReady?: (chartInstance: any) => void
}

// 声明全局 window 类型
declare global {
  interface Window {
    echartOption?: Record<string, any>
  }
}

export const BaseChart: React.FC<BaseChartProps> = (props) => {
  const { size, theme, option, chartCode, cellKey = 'default-chart', style, className, onEvents, onChartReady } = props

  const echartDom = useRef<HTMLDivElement>(null)
  const resizeDOM = useRef<HTMLDivElement>(null)
  const seriesNum = useRef<number>(0)
  const myChartRef = useRef<any>(null)

  const [error, setError] = useState<string | null>(null)

  const getEchartsInstance = () => {
    let chartInstance
    const domChartInstance = echarts.getInstanceByDom(echartDom.current!)
    if (domChartInstance) {
      chartInstance = domChartInstance
    } else {
      chartInstance = echarts.init(echartDom.current!, theme)
      bindEvents(chartInstance, onEvents || {})
      if (typeof onChartReady === 'function') onChartReady(chartInstance)
      myChartRef.current = chartInstance
    }
    return chartInstance
  }

  useEffect(() => {
    return () => {
      myChartRef?.current && echarts.dispose(myChartRef.current)
    }
  }, [])

  useLayoutEffect(() => {
    elementResizeEvent(resizeDOM.current!, () => {
      const echartObj = getEchartsInstance()
      try { echartObj && echartObj.resize() }catch (err) {
        // Silently ignore resize errors
      }
    })

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const echartObj = getEchartsInstance()
          echartObj && echartObj.resize()
        }
      })
    }, {
      threshold: 0.1
    })

    observer.observe(resizeDOM.current!)

    return () => {
      observer?.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    if (option) {
      try {
        const myChart = getEchartsInstance()
        const dataset = props.option?.dataset || {}
        let codeOption: any = {}
        let chartOption: any = {}

        try {
          if (!isEmpty(chartCode)) {
            const res = new Function('myChart', 'dataset', 'props', 'let option,codeOption; ' + chartCode + ';\n return { option, codeOption }')(myChart, dataset, props)
            if (res.option) chartOption = res.option
            if (res.codeOption) codeOption = res.codeOption
            setError(null)
          }
        } catch (e: any) {
          setError(`图表代码有误: ${e.message}`)
          return
        }

        let op = {
          ...merge(option, codeOption),
          dataset: codeOption?.dataset || option?.dataset
        }

        // 只有当 chartOption 明显是完整配置时才完全替换（有 series 或 xAxis/yAxis 等核心配置）
        if (!isEmpty(chartOption) && (chartOption.series || chartOption.xAxis || chartOption.yAxis)) {
          op = chartOption
          op['dataset'] = op.dataset || chartOption?.dataset
        }

        if (dataValid(op.dataset)) {
          if (op.series?.length < seriesNum.current) {
            myChart.clear()
          }
          seriesNum.current = op.series?.length || 0

          // 保存到全局 window 对象
          if (window.echartOption) {
            window.echartOption[cellKey] = op
          } else {
            window.echartOption = { [cellKey]: op }
          }

          myChart.setOption(op)
          myChart.resize()
          setError(null)
        }
      } catch (error: any) {
        setError(`图表代码有误: ${error}`)
      }
    }
  }, [JSON.stringify(option) + chartCode, JSON.stringify(theme)])

  const errElement = error ? <span style={{ color: 'red' }}>{error}</span> : null

  return (
    <>
      {errElement}
      <div ref={resizeDOM} style={{ ...(size ? size : { width: '100%', height: '100%' }), ...style }}>
        <div ref={echartDom} className={className} style={{ width: '100%', height: '100%' }} />
      </div>
    </>
  )
}

export default BaseChart
