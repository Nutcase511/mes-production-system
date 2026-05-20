import { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import titleBackground from '@/image/大屏标题背景.png'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { GaugeChart, GraphChart } from 'echarts/charts'
import 'echarts-gl'
import { useModelList, useModel, useModelGetItems } from '@airiot/client'
import { Model } from '@airiot/client'
import ViewModel from '@/components/kesi/view-model/view-model'

echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  GaugeChart,
  GraphChart
])

// 滚动数字组件
function RollingNumber({ value, label, unit = '', color = '#3b82f6' }: {
  value: number
  label: string
  unit?: string
  color?: string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="text-center">
      <div className="text-4xl font-bold font-mono" style={{
        color,
        textShadow: `0 0 10px ${color}40`
      }}>
        {displayValue.toLocaleString()}<span className="text-xl ml-1">{unit}</span>
      </div>
      <div className="text-xs mt-1 text-slate-400">{label}</div>
    </div>
  )
}

// 设备点位图配置
function getEquipmentLayoutOption(equipmentList: any[] = []) {
  // 如果没有真实数据，使用默认数据
  const defaultNodes = [
    // 产线1 - 上方
    { id: 'line1', name: '产线1', category: 0, symbolSize: 0, x: 300, y: 50, fixed: true },
    { id: 'c01', name: 'C01', category: 0, symbolSize: 50, x: 100, y: 100, value: 92, status: '运行中' },
    { id: 'c02', name: 'C02', category: 3, symbolSize: 50, x: 200, y: 100, value: 88, status: '维护中' },
    { id: 'c03', name: 'C03', category: 0, symbolSize: 50, x: 300, y: 100, value: 95, status: '运行中' },
    { id: 'c04', name: 'C04', category: 1, symbolSize: 50, x: 400, y: 100, value: 78, status: '空闲' },

    // 产线2 - 中间
    { id: 'line2', name: '产线2', category: 0, symbolSize: 0, x: 300, y: 200, fixed: true },
    { id: 'm01', name: 'M01', category: 3, symbolSize: 50, x: 100, y: 200, value: 85, status: '维护中' },
    { id: 'm02', name: 'M02', category: 3, symbolSize: 50, x: 200, y: 200, value: 90, status: '维护中' },
    { id: 'm03', name: 'M03', category: 1, symbolSize: 50, x: 300, y: 200, value: 72, status: '空闲' },
    { id: 'm04', name: 'M04', category: 0, symbolSize: 50, x: 400, y: 200, value: 91, status: '运行中' },

    // 产线3 - 下方
    { id: 'line3', name: '产线3', category: 0, symbolSize: 0, x: 300, y: 350, fixed: true },
    { id: 'w01', name: 'W01', category: 1, symbolSize: 50, x: 100, y: 350, value: 68, status: '空闲' },
    { id: 'w02', name: 'W02', category: 3, symbolSize: 50, x: 200, y: 350, value: 82, status: '维护中' },
    { id: 'w03', name: 'W03', category: 2, symbolSize: 50, x: 300, y: 350, value: 0, status: '故障' },
    { id: 'w04', name: 'W04', category: 3, symbolSize: 50, x: 400, y: 350, value: 87, status: '维护中' },
  ]

  // 如果有真实数据，转换格式
  let nodes = defaultNodes
  if (equipmentList.length > 0) {
    nodes = equipmentList.map((eq: any, index: number) => {
      // 根据设备状态确定分类
      let category = 0
      if (eq.deviceStatus === '运行中') category = 0
      else if (eq.deviceStatus === '空闲') category = 1
      else if (eq.deviceStatus === '故障') category = 2
      else if (eq.deviceStatus === '维护中') category = 3
      else if (eq.deviceStatus === '停用') category = 4

      // 根据索引确定位置（增加间距）
      const row = Math.floor(index / 8)  // 每行8个设备
      const col = index % 8
      const x = 100 + col * 150  // x 方向间距：150px
      const y = 100 + row * 200  // y 方向间距：200px

      // 根据设备状态设置对应的颜色值
      let colorValue = 50
      if (eq.deviceStatus === '运行中') {
        colorValue = 95  // 绿色
      } else if (eq.deviceStatus === '空闲') {
        colorValue = 75  // 蓝色
      } else if (eq.deviceStatus === '故障') {
        colorValue = 0   // 红色
      } else if (eq.deviceStatus === '维护中') {
        colorValue = 85  // 黄色
      } else if (eq.deviceStatus === '停用') {
        colorValue = -1  // 紫红色
      }

      return {
        id: eq.id || eq.name || `eq_${index}`,
        name: eq.name || eq.equipmentName || `设备${index + 1}`,
        category,
        symbolSize: 50,
        x,
        y,
        value: eq.oee || colorValue,
        status: eq.deviceStatus || '未知'  // 保存状态信息用于 tooltip 显示
      }
    })
  }

  const links = [
    // 产线1连接
    { source: 'c01', target: 'c02' },
    { source: 'c02', target: 'c03' },
    { source: 'c03', target: 'c04' },
    // 产线2连接
    { source: 'm01', target: 'm02' },
    { source: 'm02', target: 'm03' },
    { source: 'm03', target: 'm04' },
    // 产线3连接
    { source: 'w01', target: 'w02' },
    { source: 'w02', target: 'w03' },
    { source: 'w03', target: 'w04' },
  ]

  const statusCategories = [
    { name: '运行中' },
    { name: '空闲' },
    { name: '故障' },
    { name: '维护中' },
    { name: '停用' },
  ]

  return {
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const status = params.data.status || '未知'
          let statusColor = '#94a3b8'
          let statusText = status

          if (status === '运行中') {
            statusColor = '#22c55e'
          } else if (status === '空闲') {
            statusColor = '#3b82f6'
          } else if (status === '故障') {
            statusColor = '#ef4444'
          } else if (status === '维护中') {
            statusColor = '#eab308'
          } else if (status === '停用') {
            statusColor = '#ec4899'
          }

          return `
            <div style="padding: 8px;">
              <div style="color: #3b82f6; font-size: 14px; margin-bottom: 5px;">${params.data.name}</div>
              <div style="color: ${statusColor};">状态: ${statusText}</div>
              ${params.data.value > 0 && params.data.value !== -1 ? `<div style="color: #22c55e;">OEE: ${params.data.value}%</div>` : ''}
            </div>
          `
        }
        return params.data.name
      }
    },
    legend: [{
      data: statusCategories.map((s, index) => ({
        name: s.name,
        itemStyle: {
          color: index === 0 ? '#22c55e' :  // 运行中：绿色
                 index === 1 ? '#3b82f6' :  // 空闲：蓝色
                 index === 2 ? '#ef4444' :  // 故障：红色
                 index === 3 ? '#eab308' :  // 维护中：黄色
                 '#ec4899'                  // 停用：紫红色
        }
      })),
      textStyle: { color: '#cbd5e1', fontSize: 12 },
      top: 10,
      left: 10
    }],
    series: [{
      type: 'graph',
      layout: 'none',
      data: nodes.map(node => {
        // 根据状态确定颜色
        let color = '#f97316' // 默认橙色
        if ((node.value ?? 0) === 0) color = '#ef4444' // 故障：红色
        else if ((node.value ?? 0) === -1) color = '#ec4899' // 停用：紫红色
        else if ((node.value ?? 0) > 90) color = '#22c55e' // 运行中：绿色
        else if ((node.value ?? 0) > 80) color = '#eab308' // 维护中：黄色
        else if ((node.value ?? 0) > 70) color = '#3b82f6' // 空闲：蓝色

        // 车床图标 SVG path
        const machineToolPath = 'M15,5 L85,5 L85,15 L75,15 L75,25 L80,25 L80,30 L70,30 L70,35 L75,35 L75,40 L25,40 L25,35 L30,35 L30,30 L20,30 L20,25 L25,25 L25,15 L15,15 Z M35,20 L65,20 L65,30 L35,30 Z M40,10 L60,10 L60,15 L40,15 Z'

        return {
          ...node,
          symbol: `path://${machineToolPath}`,
          symbolSize: 80,
          itemStyle: {
            color: color,
            shadowBlur: 20,
            shadowColor: color === '#ef4444'
              ? 'rgba(239, 68, 68, 0.8)'
              : color === '#ec4899'
              ? 'rgba(236, 72, 153, 0.8)'
              : color === '#22c55e'
              ? 'rgba(34, 197, 94, 0.8)'
              : color === '#eab308'
              ? 'rgba(234, 179, 8, 0.8)'
              : color === '#3b82f6'
              ? 'rgba(59, 130, 246, 0.8)'
              : 'rgba(249, 115, 22, 0.8)'
          },
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            position: 'bottom'
          }
        }
      }),
      links: links.map(link => ({
        ...link,
        lineStyle: {
          color: 'rgba(59, 130, 246, 0.3)',
          width: 2,
          curveness: 0
        }
      })),
      categories: statusCategories,
      roam: false,
      scaleLimit: { min: 0.8, max: 1.2 },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { width: 4 },
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(59, 130, 246, 0.8)'
        }
      }
    }]
  }
}

// 自动滚动组件
function AutoScrollContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    // 检查内容是否溢出
    const checkOverflow = () => {
      const isOverflowing = content.scrollHeight > container.clientHeight
      setShouldScroll(isOverflowing)
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)

    return () => {
      window.removeEventListener('resize', checkOverflow)
    }
  }, [children])

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div
        ref={contentRef}
        className={shouldScroll ? 'animate-scroll-up' : ''}
      >
        <div className="space-y-3 pb-3">
          {children}
        </div>
        {shouldScroll && (
          <div className="space-y-3 pb-3">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

export function Dashboard2Page() {
  return (
    <ViewModel
      tableId="设备台账"
      initQuery={true}
      limit={99999}  // 查询全部数据，不限制数量
    >
      <Dashboard2Content />
    </ViewModel>
  )
}

// 内部组件，可以使用 Model hooks
function Dashboard2Content() {
  const navigate = useNavigate()
  const { model } = useModel()
  const { getItems } = useModelGetItems()
  const { items: equipmentData, loading } = useModelList({ initQuery: false })

  // 初始化查询
  const initializedRef = useRef(false)
  useEffect(() => {
    if (model?.properties && !initializedRef.current) {
      initializedRef.current = true
      const fields = Object.keys(model.properties)
      const query = {
        fields: fields,
        withCount: true
      }
      getItems(query)
    }
  }, [model])

  const [currentTime, setCurrentTime] = useState(new Date())
  const [announcements] = useState([
    '【通知】设备W03故障维修中，预计14:00恢复',
    '【提醒】产线2今日产量目标完成85%',
    '【通知】下午16:00进行车间安全检查',
    '【提醒】铝板6061库存低于预警值，请及时补料'
  ])
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAnnouncement(prev => (prev + 1) % announcements.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [announcements.length])

  // ESC键退出
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/dashboard')
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [navigate])

  // 模拟实时告警数据
  const alarms = [
    { time: '10:23:45', level: '紧急', device: 'W03', content: '设备过热保护触发' },
    { time: '10:15:30', level: '警告', device: 'C02', content: '主轴温度偏高' },
    { time: '09:58:12', level: '提示', device: 'M01', content: '刀具寿命预警' },
    { time: '09:45:00', level: '紧急', device: 'W04', content: '液压系统压力异常' },
    { time: '09:30:15', level: '警告', device: '产线2', content: '产线节拍下降' },
  ]

  // 模拟能耗数据
  const energyData = [
    { name: '电力', value: 85.6, unit: 'kW', trend: 'up' },
    { name: '水', value: 12.3, unit: 'm³/h', trend: 'stable' },
    { name: '压缩空气', value: 45.2, unit: 'm³/h', trend: 'down' },
    { name: '天然气', value: 23.8, unit: 'm³/h', trend: 'up' },
  ]

  // 模拟产线状态
  const lineStatus = [
    { name: '产线1', output: 320, target: 400, rate: 80, status: 'running' },
    { name: '产线2', output: 285, target: 350, rate: 81, status: 'running' },
    { name: '产线3', output: 180, target: 300, rate: 60, status: 'warning' },
  ]

  // 操作日志
  const logs = [
    { time: '10:25:30', user: '张三', action: '报工', detail: 'WO25030015 OP10 完成' },
    { time: '10:24:15', user: '系统', action: '告警', detail: 'W03 设备过热' },
    { time: '10:22:00', user: '李四', action: '领料', detail: '铝板6061 50kg' },
    { time: '10:20:45', user: '王五', action: '质检', detail: 'WO25030016 首检合格' },
    { time: '10:18:30', user: '赵六', action: '换刀', detail: 'M02 刀具更换' },
  ]

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col"
      // 暂时移除背景色，如有需要可恢复
      // style={{ bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' }}
    >
      {/* 顶部标题栏 */}
      <header
        className="flex-shrink-0 h-18 border-b border-blue-500/30 flex items-center justify-between px-6 relative"
        // 暂时移除毛玻璃效果：backdrop-blur-xl
        // 暂时移除背景色：bg-slate-950/50
        style={{
          backgroundImage: `url(${titleBackground})`,
          backgroundSize: '100% 300%',  // 宽度100%，高度300%
          backgroundPosition: 'center -64px',  // 向上移动64px
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'transparent'
        }}
      >
        {/* 装饰线 */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>

        {/* 左侧 - 时间日期 */}
        <div className="flex items-center gap-6 w-1/4">
          <div className="text-center">
            <div className="text-2xl font-mono text-blue-300">
              {currentTime.toLocaleTimeString('zh-CN')}
            </div>
            <div className="text-xs text-slate-400">
              {currentTime.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                weekday: 'long'
              })}
            </div>
          </div>
        </div>

        {/* 中间 - 标题 */}
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400"
              style={{
                letterSpacing: '0.3em'
              }}>
            智能制造车间监控中心
          </h1>
        </div>

        {/* 右侧 - 关键指标 + 人员 + 返回按钮 */}
        <div className="flex items-center gap-6 w-1/4 justify-end group">
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-lg font-mono text-green-400">1256</div>
              <div className="text-xs text-slate-400">今日产量</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-amber-400">85%</div>
              <div className="text-xs text-slate-400">达成率</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-blue-400">18</div>
              <div className="text-xs text-slate-400">在岗人数</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-lg bg-blue-500/10 border border-blue-500/40 hover:bg-blue-500/20 hover:border-blue-400/60 transition-all"
            title="返回首页 (ESC)"
          >
            <X className="w-5 h-5 text-blue-300" />
          </button>
        </div>
      </header>

      {/* 滚动公告栏 */}
      <div className="flex-shrink-0 h-8 bg-gradient-to-r from-slate-900/50 via-blue-900/50 to-slate-900/50 border-b border-blue-500/20 flex items-center px-4">
        <div className="flex items-center gap-2 text-blue-300 text-sm font-medium">
          <span className="animate-pulse">📢</span>
          <span className="text-slate-400">公告：</span>
        </div>
        <div className="flex-1 mx-4 overflow-hidden">
          <div className="text-slate-200 text-sm whitespace-nowrap animate-[marquee_20s_linear_infinite]">
            {announcements[currentAnnouncement]}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="min-h-0 flex-1 flex overflow-hidden">
        {/* 左侧面板 */}
        <aside className="w-80 min-h-0 flex flex-col gap-3 p-3 overflow-hidden">
          {/* 生产KPI */}
          <div className="backdrop-blur-xl bg-slate-900/30 border border-blue-500/30 rounded-lg p-4 flex-1 flex flex-col">
            <h3 className="text-blue-300 text-base font-semibold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-400"></span>
              生产KPI指标
            </h3>
            <div className="grid grid-cols-2 gap-3 flex-1">
              <RollingNumber value={1256} label="今日产量" unit="件" color="#22c55e" />
              <RollingNumber value={85} label="OEE" unit="%" color="#f59e0b" />
              <RollingNumber value={98.5} label="直通率" unit="%" color="#3b82f6" />
              <RollingNumber value={0.8} label="不良率" unit="%" color="#ef4444" />
            </div>
          </div>

          {/* 设备实时数据 */}
          <div className="backdrop-blur-xl bg-slate-900/30 border border-blue-500/30 rounded-lg p-4 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-blue-300 text-base font-semibold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-400"></span>
              设备实时数据
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {[
                { name: 'C01 主轴转速', value: '3200 rpm', status: 'normal' },
                { name: 'C01 进给速度', value: '500 mm/min', status: 'normal' },
                { name: 'M01 主轴温度', value: '42°C', status: 'warning' },
                { name: 'M02 液压压力', value: '12.5 MPa', status: 'normal' },
                { name: 'W03 焊接电流', value: '--', status: 'error' },
                { name: 'W04 保护气体', value: '18 L/min', status: 'normal' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-blue-500/10">
                  <span className="text-slate-400">{item.name}</span>
                  <span className={
                    item.status === 'normal' ? 'text-green-400 font-mono' :
                    item.status === 'warning' ? 'text-amber-400 font-mono' :
                    'text-red-400 font-mono'
                  }>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 能耗监控 */}
          <div className="backdrop-blur-xl bg-slate-900/30 border border-blue-500/30 rounded-lg p-4 flex-1 flex flex-col">
            <h3 className="text-blue-300 text-base font-semibold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-400"></span>
              能耗监控
            </h3>
            <div className="flex-1 flex flex-col justify-around">
              {energyData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono text-blue-300">{item.value}</span>
                    <span className="text-xs text-blue-300">{item.unit}</span>
                    <span className={
                      item.trend === 'up' ? 'text-red-400 text-xs' :
                      item.trend === 'down' ? 'text-green-400 text-xs' :
                      'text-slate-400 text-xs'
                    }>
                      {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 中间区域 - 设备点位图 */}
        <main className="flex-1 min-h-0 p-3 flex flex-col">
          <div className="backdrop-blur-xl bg-slate-900/20 border border-blue-500/30 rounded-lg flex-1 relative overflow-hidden">
            {/* 网格背景 */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <ReactECharts
                option={getEquipmentLayoutOption(equipmentData || [])}
                style={{ width: '100%', height: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            </div>

            {/* 角标装饰 */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-blue-400/50"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-blue-400/50"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-blue-400/50"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-400/50"></div>
          </div>
        </main>

        {/* 右侧面板 */}
        <aside className="w-80 min-h-0 flex flex-col gap-3 p-3 overflow-hidden">
          {/* 告警信息 */}
          <div className="backdrop-blur-xl bg-slate-900/30 border border-blue-500/30 rounded-lg p-4 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-blue-300 text-base font-semibold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-red-400"></span>
              实时告警
              <span className="ml-auto text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded animate-pulse">
                {alarms.length}
              </span>
            </h3>
            <AutoScrollContainer className="flex-1">
              {alarms.map((alarm, i) => (
                <div key={i} className={`backdrop-blur-sm rounded p-2 border-l-2 ${
                  alarm.level === '紧急'
                    ? 'bg-red-500/10 border-red-500'
                    : alarm.level === '警告'
                    ? 'bg-amber-500/10 border-amber-500'
                    : 'bg-blue-500/10 border-blue-500'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium ${
                      alarm.level === '紧急' ? 'text-red-300' :
                      alarm.level === '警告' ? 'text-amber-300' :
                      'text-blue-300'
                    }`}>{alarm.level}</span>
                    <span className="text-xs text-blue-300">{alarm.time}</span>
                  </div>
                  <div className="text-xs text-slate-200">
                    <span className="text-blue-300">{alarm.device}</span> {alarm.content}
                  </div>
                </div>
              ))}
            </AutoScrollContainer>
          </div>

          {/* 生产进度 */}
          <div className="backdrop-blur-xl bg-slate-900/30 border border-blue-500/30 rounded-lg p-4 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-blue-300 text-base font-semibold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-green-400"></span>
              生产进度
            </h3>
            <AutoScrollContainer className="flex-1">
              {[
                { wo: 'WO25030015', product: '产品A', progress: 85, qty: '850/1000' },
                { wo: 'WO25030016', product: '产品B', progress: 62, qty: '620/1000' },
                { wo: 'WO25030017', product: '产品C', progress: 45, qty: '450/1000' },
                { wo: 'WO25030018', product: '产品A', progress: 30, qty: '300/1000' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-300">{item.wo}</span>
                    <span className="text-slate-400">{item.qty}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </AutoScrollContainer>
          </div>

          {/* 操作日志 */}
          <div className="backdrop-blur-xl bg-slate-900/30 border border-blue-500/30 rounded-lg p-4 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-blue-300 text-base font-semibold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-400"></span>
              操作日志
            </h3>
            <AutoScrollContainer className="flex-1">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 py-1 border-b border-blue-500/10 text-xs">
                  <span className="text-blue-300 whitespace-nowrap font-mono">{log.time}</span>
                  <div className="flex-1">
                    <span className="text-blue-300">{log.user}</span>
                    <span className="text-slate-400">{log.action}</span>
                    <span className="text-blue-300">{log.detail}</span>
                  </div>
                </div>
              ))}
            </AutoScrollContainer>
          </div>
        </aside>
      </main>

      {/* 底部栏 */}
      <footer className="flex-shrink-0 h-40 border-t border-blue-500/30 backdrop-blur-xl bg-slate-950/50 flex gap-3 p-3">
        {/* 产线状态 */}
        <div className="flex-1 backdrop-blur-xl bg-slate-900/30 border border-blue-500/30 rounded-lg p-3">
          <h3 className="text-blue-300 text-sm font-semibold mb-2 flex items-center gap-2">
            <span className="w-1 h-3 bg-blue-400"></span>
            产线状态
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {lineStatus.map((line, i) => (
              <div key={i} className={`backdrop-blur-sm rounded p-2 border ${
                line.status === 'running'
                  ? 'bg-green-500/10 border-green-500/40'
                  : 'bg-amber-500/10 border-amber-500/40'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white text-sm font-medium">{line.name}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    line.status === 'running' ? 'bg-green-400 animate-pulse' : 'bg-amber-400'
                  }`}></span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">产量</span>
                  <span className="text-blue-300 font-mono">{line.output}/{line.target}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full ${
                      line.status === 'running' ? 'bg-green-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${line.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 系统状态 */}
        <div className="w-64 backdrop-blur-xl bg-slate-900/30 border border-blue-500/30 rounded-lg p-3">
          <h3 className="text-blue-300 text-sm font-semibold mb-2 flex items-center gap-2">
            <span className="w-1 h-3 bg-blue-400"></span>
            系统状态
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">服务器</span>
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                正常
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">数据库</span>
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                正常
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">IoT网关</span>
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                正常
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">数据采集</span>
              <span className="text-blue-300 font-mono">1s</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        .animate-scroll-up {
          animation: scroll-up 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
