import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Activity, Cpu, Thermometer, Gauge, Zap, Wifi, Waves } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { LineChart, GaugeChart } from 'echarts/charts'

echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  LineChart,
  GaugeChart
])

export function IoTPage() {
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

  // 传感器数据趋势
  const sensorTrendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00f0ff',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['温度', '振动', '压力'],
      textStyle: { color: '#00f0ff', fontSize: 11 },
      top: 5
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 20 }, (_, i) => `${i * 5}s`),
      axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.3)' } },
      axisLabel: { color: '#00f0ff', fontSize: 9 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.3)' } },
      axisLabel: { color: '#00f0ff', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.1)' } }
    },
    series: [
      {
        name: '温度',
        type: 'line',
        data: Array.from({ length: 20 }, () => Math.random() * 30 + 40),
        smooth: true,
        itemStyle: { color: '#ef4444' }
      },
      {
        name: '振动',
        type: 'line',
        data: Array.from({ length: 20 }, () => Math.random() * 5 + 2),
        smooth: true,
        itemStyle: { color: '#f59e0b' }
      },
      {
        name: '压力',
        type: 'line',
        data: Array.from({ length: 20 }, () => Math.random() * 3 + 10),
        smooth: true,
        itemStyle: { color: '#3b82f6' }
      }
    ]
  }

  // 设备健康度仪表盘
  const healthGaugeOption = (value: number) => ({
    series: [{
      type: 'gauge',
      center: ['50%', '60%'],
      radius: '80%',
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 15,
          color: [
            [0.3, '#ef4444'],
            [0.7, '#f59e0b'],
            [1, '#22c55e']
          ]
        }
      },
      pointer: { itemStyle: { color: '#00f0ff' } },
      axisTick: { distance: -15, length: 4, lineStyle: { color: '#fff', width: 1 } },
      splitLine: { distance: -15, length: 12, lineStyle: { color: '#fff', width: 2 } },
      axisLabel: { distance: -8, color: 'rgba(255, 255, 255, 0.6)', fontSize: 9 },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        color: '#00f0ff',
        fontSize: 24,
        offsetCenter: [0, '10%']
      },
      data: [{ value, name: '健康度' }]
    }]
  })

  // IoT设备数据
  const devices = [
    {
      id: 'C01',
      name: '车床主轴',
      online: true,
      temp: 65.2,
      vibration: 3.2,
      pressure: 12.5,
      health: 92,
      status: 'normal'
    },
    {
      id: 'M01',
      name: '加工中心',
      online: true,
      temp: 72.8,
      vibration: 4.1,
      pressure: 14.2,
      health: 85,
      status: 'warning'
    },
    {
      id: 'W03',
      name: '焊接设备',
      online: false,
      temp: 0,
      vibration: 0,
      pressure: 0,
      health: 0,
      status: 'offline'
    },
    {
      id: 'M02',
      name: '加工中心2',
      online: true,
      temp: 58.4,
      vibration: 2.8,
      pressure: 11.8,
      health: 95,
      status: 'normal'
    },
    {
      id: 'C02',
      name: '车床2',
      online: true,
      temp: 68.1,
      vibration: 3.5,
      pressure: 13.1,
      health: 88,
      status: 'normal'
    },
    {
      id: 'W04',
      name: '焊接设备2',
      online: true,
      temp: 45.2,
      vibration: 2.1,
      pressure: 8.5,
      health: 78,
      status: 'normal'
    }
  ]

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden flex flex-col">
      {/* 顶部 */}
      <header className="flex-shrink-0 h-14 border-b border-cyan-500/30 backdrop-blur-xl bg-blue-950/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Wifi className="w-5 h-5 text-cyan-400" />
          <div className="text-xl font-mono text-cyan-300">
            {currentTime.toLocaleTimeString('zh-CN')}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
          工业 IoT 大屏
        </h1>

        <div className="flex items-center gap-4 group">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-200">在线: {devices.filter(d => d.online).length}</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded bg-cyan-500/10 border border-cyan-500/40"
          >
            <X className="w-4 h-4 text-cyan-300" />
          </button>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 p-4 grid grid-cols-4 gap-4 overflow-hidden">
        {/* 左侧 - 设备列表 */}
        <div className="col-span-1 flex flex-col gap-2 overflow-y-auto">
          {devices.map((device) => (
            <div
              key={device.id}
              className={`backdrop-blur-xl border rounded-lg p-3 ${
                !device.online
                  ? 'bg-red-950/30 border-red-500/30'
                  : device.status === 'warning'
                  ? 'bg-yellow-950/30 border-yellow-500/30'
                  : 'bg-blue-950/30 border-cyan-500/30'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span className="text-cyan-300 font-medium">{device.id}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  !device.online ? 'bg-red-500' : 'bg-green-400 animate-pulse'
                }`}></div>
              </div>

              {device.online ? (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-red-400" />
                    <span className="text-cyan-200">{device.temp}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-yellow-400" />
                    <span className="text-cyan-200">{device.vibration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-blue-400" />
                    <span className="text-cyan-200">{device.pressure}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-red-300">离线</div>
              )}
            </div>
          ))}
        </div>

        {/* 中间 - 趋势图 */}
        <div className="col-span-2 backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-4">
          <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
            <Waves className="w-4 h-4" />
            实时传感器数据
          </h3>
          <div className="h-64">
            <ReactECharts
              option={sensorTrendOption}
              style={{ height: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        {/* 右侧 - 健康度 */}
        <div className="col-span-1 flex flex-col gap-3">
          {devices.slice(0, 3).map((device) => (
            device.online && (
              <div key={device.id} className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-3 flex-1">
                <div className="text-xs text-cyan-200/70 text-center mb-2">{device.name}</div>
                <ReactECharts
                  option={healthGaugeOption(device.health)}
                  style={{ height: '100px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            )
          ))}
        </div>
      </main>

      {/* 底部 - 能耗统计 */}
      <footer className="flex-shrink-0 h-28 border-t border-cyan-500/30 backdrop-blur-xl bg-blue-950/50 p-3">
        <div className="grid grid-cols-4 gap-3 h-full">
          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-3 flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            <div className="flex-1">
              <div className="text-xs text-cyan-200/70">电力消耗</div>
              <div className="text-2xl font-mono text-cyan-300">1,258 kW·h</div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-3 flex items-center gap-3">
            <Waves className="w-8 h-8 text-blue-400" />
            <div className="flex-1">
              <div className="text-xs text-cyan-200/70">用水量</div>
              <div className="text-2xl font-mono text-cyan-300">328 m³</div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-3 flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-400" />
            <div className="flex-1">
              <div className="text-xs text-cyan-200/70">压缩空气</div>
              <div className="text-2xl font-mono text-cyan-300">1,856 m³</div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-blue-950/30 border border-cyan-500/30 rounded-lg p-3 flex items-center gap-3">
            <Wifi className="w-8 h-8 text-cyan-400" />
            <div className="flex-1">
              <div className="text-xs text-cyan-200/70">数据采集</div>
              <div className="text-2xl font-mono text-cyan-300">500ms</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
