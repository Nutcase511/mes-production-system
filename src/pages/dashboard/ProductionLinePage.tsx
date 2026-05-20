import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, TrendingUp, AlertTriangle, Activity } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { LineChart, GaugeChart, PieChart } from 'echarts/charts'
import 'echarts-gl'

echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  LineChart,
  GaugeChart,
  PieChart
])

export function ProductionLinePage() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/dashboard')
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [navigate])

  // 产线实时产量趋势
  const productionTrendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00f0ff',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
      axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.3)' } },
      axisLabel: { color: '#00f0ff', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.3)' } },
      axisLabel: { color: '#00f0ff', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.1)' } }
    },
    series: [
      {
        name: '产线1',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210, 182, 191],
        smooth: true,
        itemStyle: { color: '#00f0ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 240, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 240, 255, 0.05)' }
          ])
        }
      },
      {
        name: '产线2',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310, 201, 154],
        smooth: true,
        itemStyle: { color: '#22c55e' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 197, 94, 0.3)' },
            { offset: 1, color: 'rgba(34, 197, 94, 0.05)' }
          ])
        }
      },
      {
        name: '产线3',
        type: 'line',
        data: [150, 232, 201, 154, 190, 330, 410, 282, 211],
        smooth: true,
        itemStyle: { color: '#f59e0b' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
            { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
          ])
        }
      }
    ]
  }

  // OEE仪表盘
  const oeeGaugeOption = (value: number, color: string) => ({
    series: [{
      type: 'gauge',
      center: ['50%', '60%'],
      radius: '75%',
      min: 0,
      max: 100,
      splitNumber: 5,
      axisLine: {
        lineStyle: {
          width: 12,
          color: [
            [0.3, '#ef4444'],
            [0.7, '#f59e0b'],
            [1, color]
          ]
        }
      },
      pointer: {
        itemStyle: { color: color }
      },
      axisTick: { distance: -12, length: 4, lineStyle: { color: '#fff', width: 1 } },
      splitLine: { distance: -12, length: 12, lineStyle: { color: '#fff', width: 2 } },
      axisLabel: { distance: -8, color: 'rgba(255, 255, 255, 0.6)', fontSize: 9 },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        color: '#fff',
        fontSize: 20,
        offsetCenter: [0, '10%']
      },
      data: [{ value }]
    }]
  })

  // 故障率饼图
  const faultPieOption = {
    tooltip: {
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00f0ff',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#00f0ff', fontSize: 11 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      data: [
        { value: 5, name: '产线1', itemStyle: { color: '#00f0ff' } },
        { value: 8, name: '产线2', itemStyle: { color: '#22c55e' } },
        { value: 12, name: '产线3', itemStyle: { color: '#f59e0b' } }
      ],
      label: { color: '#fff', fontSize: 11 }
    }]
  }

  // 产线数据
  const lines = [
    {
      id: 1,
      name: '产线1 - 精加工线',
      status: 'running',
      output: 1850,
      target: 2000,
      oee: 87.5,
      fault: 2,
      products: ['产品A', '产品B'],
      color: '#00f0ff'
    },
    {
      id: 2,
      name: '产线2 - 装配线',
      status: 'running',
      output: 2230,
      target: 2500,
      oee: 92.3,
      fault: 1,
      products: ['产品C', '产品D'],
      color: '#22c55e'
    },
    {
      id: 3,
      name: '产线3 - 包装线',
      status: 'warning',
      output: 980,
      target: 1500,
      oee: 65.4,
      fault: 5,
      products: ['产品E', '产品F'],
      color: '#f59e0b'
    }
  ]

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden flex flex-col">
      {/* 顶部标题栏 */}
      <header className="flex-shrink-0 h-14 border-b border-cyan-500/30 backdrop-blur-xl bg-blue-950/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="text-xl font-mono text-cyan-300" style={{
            textShadow: '0 0 10px rgba(0, 240, 255, 0.8)'
          }}>
            {currentTime.toLocaleTimeString('zh-CN')}
          </div>
          <div className="text-xs text-cyan-200/70">
            {currentTime.toLocaleDateString('zh-CN')}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"
            style={{ textShadow: '0 0 20px rgba(0, 240, 255, 0.6)' }}>
          产线监控大屏
        </h1>

        <div className="flex items-center gap-4 group">
          <button
            onClick={() => navigate('/dashboard')}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/40 hover:bg-cyan-500/20"
            title="返回 (ESC)"
          >
            <X className="w-4 h-4 text-cyan-300" />
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 p-4 grid grid-cols-3 gap-4 overflow-hidden">
        {/* 左侧 - 产线列表 */}
        <div className="flex flex-col gap-3 overflow-hidden">
          {lines.map((line) => (
            <div key={line.id} className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4 flex-1">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-cyan-300 font-semibold">{line.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {line.products.map(p => (
                      <span key={p} className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-200 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  line.status === 'running' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                }`}></div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono" style={{ color: line.color }}>
                    {line.output}
                  </div>
                  <div className="text-xs text-cyan-200/70">产量</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-mono text-cyan-300">{line.oee}%</div>
                  <div className="text-xs text-cyan-200/70">OEE</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-mono text-red-300">{line.fault}</div>
                  <div className="text-xs text-cyan-200/70">故障</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-200/70">目标完成</span>
                  <span className="text-cyan-300">{Math.round(line.output / line.target * 100)}%</span>
                </div>
                <div className="h-2 bg-cyan-950/50 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${line.output / line.target * 100}%`,
                      backgroundColor: line.color
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 中间 - 趋势图 */}
        <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4 flex flex-col">
          <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            产量趋势
          </h3>
          <div className="flex-1">
            <ReactECharts
              option={productionTrendOption}
              style={{ height: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        {/* 右侧 - OEE和故障 */}
        <div className="flex flex-col gap-3 overflow-hidden">
          {/* OEE对比 */}
          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4 flex-1">
            <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              OEE对比
            </h3>
            <div className="grid grid-cols-3 gap-2 h-full">
              <div>
                <div className="text-xs text-cyan-200/70 text-center mb-1">产线1</div>
                <ReactECharts option={oeeGaugeOption(87.5, '#00f0ff')} style={{ height: '120px' }} />
              </div>
              <div>
                <div className="text-xs text-cyan-200/70 text-center mb-1">产线2</div>
                <ReactECharts option={oeeGaugeOption(92.3, '#22c55e')} style={{ height: '120px' }} />
              </div>
              <div>
                <div className="text-xs text-cyan-200/70 text-center mb-1">产线3</div>
                <ReactECharts option={oeeGaugeOption(65.4, '#f59e0b')} style={{ height: '120px' }} />
              </div>
            </div>
          </div>

          {/* 故障分布 */}
          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4 flex-1">
            <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              故障分布
            </h3>
            <div className="h-40">
              <ReactECharts
                option={faultPieOption}
                style={{ height: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
