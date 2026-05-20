import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, BarChart3, TrendingUp, PieChart as PieChartIcon, Target, Award, AlertCircle } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'

echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  BarChart,
  LineChart,
  PieChart,
  RadarChart
])

export function FactoryDataPage() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/dashboard')
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [navigate])

  // 生产数据对比柱状图
  const productionBarOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00f0ff',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['计划', '实际', '良品'],
      textStyle: { color: '#00f0ff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.3)' } },
      axisLabel: { color: '#00f0ff' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.3)' } },
      axisLabel: { color: '#00f0ff' },
      splitLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.1)' } }
    },
    series: [
      {
        name: '计划',
        type: 'bar',
        data: [5000, 5200, 5500, 5800, 6000, 6200],
        itemStyle: { color: '#64748b' }
      },
      {
        name: '实际',
        type: 'bar',
        data: [4800, 5100, 5600, 5700, 6100, 6150],
        itemStyle: { color: '#00f0ff' }
      },
      {
        name: '良品',
        type: 'bar',
        data: [4700, 5000, 5500, 5600, 6000, 6080],
        itemStyle: { color: '#22c55e' }
      }
    ]
  }

  // 质量指标雷达图
  const qualityRadarOption = {
    tooltip: {
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00f0ff',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['本月', '上月'],
      textStyle: { color: '#00f0ff' }
    },
    radar: {
      indicator: [
        { name: '直通率', max: 100 },
        { name: 'CPK', max: 2 },
        { name: '不良率', max: 5 },
        { name: '客户投诉', max: 10 },
        { name: '返工率', max: 10 }
      ],
      axisName: { color: '#00f0ff' },
      splitLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.2)' } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [98.5, 1.67, 0.8, 2, 3],
          name: '本月',
          itemStyle: { color: '#00f0ff' },
          areaStyle: { color: 'rgba(0, 240, 255, 0.3)' }
        },
        {
          value: [97.2, 1.45, 1.2, 4, 5],
          name: '上月',
          itemStyle: { color: '#f59e0b' },
          areaStyle: { color: 'rgba(245, 158, 11, 0.3)' }
        }
      ]
    }]
  }

  // 部门效率对比
  const deptPieOption = {
    tooltip: {
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00f0ff',
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      textStyle: { color: '#00f0ff' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      data: [
        { value: 35, name: '生产部', itemStyle: { color: '#00f0ff' } },
        { value: 25, name: '质量部', itemStyle: { color: '#22c55e' } },
        { value: 20, name: '设备部', itemStyle: { color: '#f59e0b' } },
        { value: 12, name: '调度部', itemStyle: { color: '#ef4444' } },
        { value: 8, name: '其他', itemStyle: { color: '#8b5cf6' } }
      ],
      label: { color: '#fff' }
    }]
  }

  // KPI数据
  const kpis = [
    { label: '总产值', value: '¥2.58亿', trend: 'up', rate: '+12.5%' },
    { label: '产量', value: '36,850', trend: 'up', rate: '+8.3%' },
    { label: '良品率', value: '98.5%', trend: 'up', rate: '+0.5%' },
    { label: '人均产出', value: '¥8.5万', trend: 'down', rate: '-2.1%' },
    { label: '设备利用率', value: '87.2%', trend: 'up', rate: '+3.2%' },
    { label: '订单交付', value: '96.8%', trend: 'up', rate: '+1.8%' }
  ]

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden flex flex-col">
      {/* 顶部 */}
      <header className="flex-shrink-0 h-14 border-b border-cyan-500/30 backdrop-blur-xl bg-blue-950/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <div className="text-xl font-mono text-cyan-300">
            {currentTime.toLocaleTimeString('zh-CN')}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
          工厂数据可视化大屏
        </h1>

        <button
          onClick={() => navigate('/dashboard')}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded bg-cyan-500/10 border border-cyan-500/40"
        >
          <X className="w-4 h-4 text-cyan-300" />
        </button>
      </header>

      {/* KPI卡片 */}
      <div className="flex-shrink-0 p-4">
        <div className="grid grid-cols-6 gap-3">
          {kpis.map((kpi, i) => (
            <div key={i} className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-3">
              <div className="text-xs text-cyan-200/70 mb-1">{kpi.label}</div>
              <div className="text-2xl font-bold text-cyan-300 mb-1">{kpi.value}</div>
              <div className={`flex items-center gap-1 text-xs ${
                kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                {kpi.rate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 主内容 */}
      <main className="flex-1 p-4 grid grid-cols-3 gap-4 overflow-hidden">
        {/* 左侧 - 柱状图 */}
        <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4 flex flex-col">
          <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            月度生产数据对比
          </h3>
          <div className="flex-1">
            <ReactECharts
              option={productionBarOption}
              style={{ height: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        {/* 中间 - 雷达图 */}
        <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4 flex flex-col">
          <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            质量指标对比
          </h3>
          <div className="flex-1">
            <ReactECharts
              option={qualityRadarOption}
              style={{ height: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        {/* 右侧 - 饼图 */}
        <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4 flex flex-col">
          <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            部门效率分布
          </h3>
          <div className="flex-1">
            <ReactECharts
              option={deptPieOption}
              style={{ height: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>
      </main>

      {/* 底部 - 数据列表 */}
      <footer className="flex-shrink-0 h-40 border-t border-cyan-500/30 backdrop-blur-xl bg-blue-950/50 p-3">
        <div className="grid grid-cols-2 gap-3 h-full">
          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-3">
            <h3 className="text-cyan-300 font-semibold mb-2 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              异常数据
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-cyan-500/10">
                <span className="text-red-300">W03 离线超时</span>
                <span className="text-cyan-200">2小时</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyan-500/10">
                <span className="text-yellow-300">M01 温度偏高</span>
                <span className="text-cyan-200">72°C</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cyan-300">库存预警</span>
                <span className="text-cyan-200">3项</span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-3">
            <h3 className="text-cyan-300 font-semibold mb-2 text-sm">今日目标达成</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">85%</div>
                <div className="text-xs text-cyan-200/70">产量</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">98%</div>
                <div className="text-xs text-cyan-200/70">质量</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">92%</div>
                <div className="text-xs text-cyan-200/70">交付</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
