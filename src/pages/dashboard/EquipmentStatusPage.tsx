import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Settings, Thermometer, Activity, Gauge, Zap, AlertCircle } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import {
  GridComponent,
  TooltipComponent
} from 'echarts/components'
import { GaugeChart, LineChart } from 'echarts/charts'

echarts.use([
  GridComponent,
  TooltipComponent,
  GaugeChart,
  LineChart
])

export function EquipmentStatusPage() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedDevice, setSelectedDevice] = useState('C01')

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

  // 温度趋势
  const tempTrendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00f0ff',
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
      data: Array.from({ length: 30 }, (_, i) => `${i}m`),
      axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.3)' } },
      axisLabel: { color: '#00f0ff', fontSize: 9 }
    },
    yAxis: {
      type: 'value',
      min: 40,
      max: 90,
      axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.3)' } },
      axisLabel: { color: '#00f0ff', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.1)' } }
    },
    series: [{
      type: 'line',
      data: Array.from({ length: 30 }, () => Math.random() * 20 + 55),
      smooth: true,
      itemStyle: { color: '#ef4444' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
          { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
        ])
      }
    }]
  }

  // 健康度仪表盘
  const healthGaugeOption = (value: number) => ({
    series: [{
      type: 'gauge',
      center: ['50%', '60%'],
      radius: '85%',
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 20,
          color: [
            [0.4, '#ef4444'],
            [0.7, '#f59e0b'],
            [1, '#22c55e']
          ]
        }
      },
      pointer: { width: 8, itemStyle: { color: '#00f0ff' } },
      axisTick: { distance: -20, length: 5 },
      splitLine: { distance: -20, length: 15 },
      axisLabel: { distance: -12, color: '#fff', fontSize: 10 },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        color: '#00f0ff',
        fontSize: 32,
        offsetCenter: [0, '15%']
      },
      data: [{ value }]
    }]
  })

  // 设备列表
  const devices = [
    { id: 'C01', name: '数控车床', status: 'running', health: 92, temp: 58.2 },
    { id: 'C02', name: '数控车床2', status: 'running', health: 88, temp: 62.5 },
    { id: 'C03', name: '数控车床3', status: 'running', health: 95, temp: 55.8 },
    { id: 'M01', name: '加工中心', status: 'warning', health: 75, temp: 72.3 },
    { id: 'M02', name: '加工中心2', status: 'running', health: 91, temp: 60.1 },
    { id: 'M03', name: '加工中心3', status: 'running', health: 89, temp: 59.7 },
    { id: 'W01', name: '焊接机', status: 'running', health: 94, temp: 45.2 },
    { id: 'W02', name: '焊接机2', status: 'running', health: 96, temp: 43.8 },
    { id: 'W03', name: '焊接机3', status: 'error', health: 0, temp: 0 },
    { id: 'W04', name: '焊接机4', status: 'running', health: 82, temp: 48.5 },
  ]

  // 获取选中设备的详细信息
  const getSelectedDevice = () => devices.find(d => d.id === selectedDevice) || devices[0]

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden flex flex-col">
      {/* 顶部 */}
      <header className="flex-shrink-0 h-14 border-b border-cyan-500/30 backdrop-blur-xl bg-blue-950/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Settings className="w-5 h-5 text-cyan-400" />
          <div className="text-xl font-mono text-cyan-300">
            {currentTime.toLocaleTimeString('zh-CN')}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-400">
          设备状态监控大屏
        </h1>

        <button
          onClick={() => navigate('/dashboard')}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded bg-cyan-500/10 border border-cyan-500/40"
        >
          <X className="w-4 h-4 text-cyan-300" />
        </button>
      </header>

      {/* 主内容 */}
      <main className="flex-1 p-4 grid grid-cols-4 gap-4 overflow-hidden">
        {/* 左侧 - 设备列表 */}
        <div className="col-span-1 flex flex-col gap-2 overflow-hidden">
          <div className="text-cyan-300 font-semibold mb-2">设备列表</div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {devices.map((device) => (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                className={`backdrop-blur-xl border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedDevice === device.id
                    ? 'bg-cyan-500/20 border-cyan-400'
                    : 'bg-blue-950/30 border-cyan-500/30 hover:border-cyan-400/60'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-cyan-300" />
                    <span className="text-cyan-300 font-medium">{device.id}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    device.status === 'running' ? 'bg-green-400 animate-pulse' :
                    device.status === 'warning' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}></div>
                </div>
                <div className="text-xs text-cyan-200/70">{device.name}</div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-cyan-200/70">健康度</span>
                  <span className={
                    device.health > 90 ? 'text-green-400' :
                    device.health > 70 ? 'text-yellow-400' :
                    'text-red-400'
                  }>{device.health}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中间 - 设备详情 */}
        <div className="col-span-2 grid grid-rows-2 gap-3">
          {/* 健康度大仪表 */}
          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4">
            <h3 className="text-cyan-300 font-semibold mb-2 text-center">
              {getSelectedDevice().name} - 整体健康度
            </h3>
            <div className="h-48">
              <ReactECharts
                option={healthGaugeOption(getSelectedDevice().health)}
                style={{ height: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            </div>
          </div>

          {/* 温度趋势 */}
          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4">
            <h3 className="text-cyan-300 font-semibold mb-2 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-red-400" />
              温度趋势（近30分钟）
            </h3>
            <div className="h-32">
              <ReactECharts
                option={tempTrendOption}
                style={{ height: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            </div>
          </div>
        </div>

        {/* 右侧 - 详细参数 */}
        <div className="col-span-1 flex flex-col gap-3">
          {/* 核心参数 */}
          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4 flex-1">
            <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              核心参数
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-400" />
                  <span className="text-cyan-200/70 text-sm">主轴温度</span>
                </div>
                <span className="text-xl font-mono text-red-300">{getSelectedDevice().temp}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-400" />
                  <span className="text-cyan-200/70 text-sm">振动幅度</span>
                </div>
                <span className="text-xl font-mono text-yellow-300">
                  {(Math.random() * 3 + 2).toFixed(1)} mm/s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span className="text-cyan-200/70 text-sm">液压压力</span>
                </div>
                <span className="text-xl font-mono text-blue-300">
                  {(Math.random() * 5 + 10).toFixed(1)} MPa
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="text-cyan-200/70 text-sm">电流负载</span>
                </div>
                <span className="text-xl font-mono text-yellow-300">
                  {(Math.random() * 20 + 60).toFixed(1)} %
                </span>
              </div>
            </div>
          </div>

          {/* 状态信息 */}
          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4 flex-1">
            <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              状态信息
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-cyan-500/10">
                <span className="text-cyan-200/70">运行时间</span>
                <span className="text-cyan-300 font-mono">8h 32m</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cyan-500/10">
                <span className="text-cyan-200/70">累计产量</span>
                <span className="text-cyan-300 font-mono">1,258 件</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cyan-500/10">
                <span className="text-cyan-200/70">刀具寿命</span>
                <span className="text-cyan-300 font-mono">78%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-cyan-200/70">下次保养</span>
                <span className="text-cyan-300 font-mono">120h</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
