import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/blocks/status-badge'
import { mockData } from '@/lib/mock-data'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { BarChart, LineChart } from 'echarts/charts'

// 注册必要组件
echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  BarChart,
  LineChart
])

const DashboardContent = () => {
  const stats = mockData.dashboardStats

  // 生产进度趋势数据
  const dates = ['3/12', '3/13', '3/14', '3/15', '3/16', '3/17', '3/18']
  const plannedData = [1200, 1200, 1300, 1300, 1400, 1400, 1500]
  const actualData = [1150, 1180, 1250, 1280, 1350, 1380, 720]

  // 生产进度柱状图配置 - 专业工业配色
  const productionOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      textStyle: {
        color: '#f1f5f9',
        fontSize: 12
      }
    },
    legend: {
      data: ['计划产量', '实际产量'],
      textStyle: {
        fontSize: 12,
        color: '#cbd5e1'
      },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        fontSize: 11,
        color: '#cbd5e1'
      },
      axisLine: {
        lineStyle: {
          color: '#475569'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '产量',
      axisLabel: {
        fontSize: 11,
        color: '#cbd5e1'
      },
      axisLine: {
        lineStyle: {
          color: '#475569'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#1e293b'
        }
      }
    },
    series: [
      {
        name: '计划产量',
        type: 'bar',
        data: plannedData,
        itemStyle: {
          color: '#3b82f6'
        },
        barWidth: '35%'
      },
      {
        name: '实际产量',
        type: 'bar',
        data: actualData,
        itemStyle: {
          color: '#22c55e'
        },
        barWidth: '35%'
      }
    ]
  }

  // 质量合格率数据
  const qualityTrendData = [
    ['3/12', 98.5, 99.2, 98.8],
    ['3/13', 97.8, 99.5, 98.6],
    ['3/14', 99.2, 99.0, 99.1],
    ['3/15', 98.0, 98.8, 98.4],
    ['3/16', 99.5, 99.6, 99.5],
    ['3/17', 97.5, 99.1, 98.3],
    ['3/18', 98.8, 99.3, 99.0],
  ]

  // 质量合格率折线图配置 - 专业工业配色
  const qualityOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      formatter: '{b}<br/>{a}: {c}%',
      textStyle: {
        color: '#f1f5f9',
        fontSize: 12
      }
    },
    legend: {
      data: ['首检合格率', '巡检合格率', '综合合格率'],
      textStyle: {
        fontSize: 12,
        color: '#cbd5e1'
      },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: qualityTrendData.map(item => item[0]),
      boundaryGap: false,
      axisLabel: {
        fontSize: 11,
        color: '#cbd5e1'
      },
      axisLine: {
        lineStyle: {
          color: '#475569'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 96,
      max: 100,
      axisLabel: {
        fontSize: 11,
        formatter: '{value}%',
        color: '#cbd5e1'
      },
      axisLine: {
        lineStyle: {
          color: '#475569'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#1e293b'
        }
      }
    },
    series: [
      {
        name: '首检合格率',
        type: 'line',
        data: qualityTrendData.map(item => item[1]),
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#3b82f6'
        },
        itemStyle: {
          color: '#3b82f6'
        },
        symbolSize: 6
      },
      {
        name: '巡检合格率',
        type: 'line',
        data: qualityTrendData.map(item => item[2]),
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#22c55e'
        },
        itemStyle: {
          color: '#22c55e'
        },
        symbolSize: 6
      },
      {
        name: '综合合格率',
        type: 'line',
        data: qualityTrendData.map(item => item[3]),
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#f59e0b'
        },
        itemStyle: {
          color: '#f59e0b'
        },
        symbolSize: 6
      }
    ]
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="数据看板"
        subtitle="生产运营实时监控"
        breadcrumbs={[
          { label: '首页' }
        ]}
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="card-hover bg-blue-500/20 backdrop-blur-sm" style={{ borderLeft: '4px solid #3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.25)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-blue-200 font-medium">在制订单</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {stats.inProgressOrders}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover bg-amber-500/20 backdrop-blur-sm" style={{ borderLeft: '4px solid #f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.25)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-amber-200 font-medium">待派工</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {stats.pendingOrders}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover bg-green-500/20 backdrop-blur-sm" style={{ borderLeft: '4px solid #22c55e', backgroundColor: 'rgba(34, 197, 94, 0.25)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-green-200 font-medium">生产中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              12
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover bg-slate-400/20 backdrop-blur-sm" style={{ borderLeft: '4px solid #94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.25)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-200 font-medium">已完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {stats.completedOrders}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover bg-blue-500/20 backdrop-blur-sm" style={{ borderLeft: '4px solid #3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.25)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-blue-200 font-medium">今日产量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {stats.todayOutput}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover bg-red-500/20 backdrop-blur-sm" style={{ borderLeft: '4px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.25)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-red-200 font-medium">设备OEE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {stats.equipmentOEE}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 生产进度趋势 */}
        <Card className="bg-blue-500/10 backdrop-blur-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader className="border-b" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <CardTitle className="text-base font-semibold text-blue-200">生产进度趋势</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ReactECharts
              option={productionOption}
              style={{ height: '300px' }}
              opts={{ renderer: 'canvas' }}
            />
          </CardContent>
        </Card>

        {/* 质量合格率 */}
        <Card className="bg-green-500/10 backdrop-blur-sm" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <CardHeader className="border-b" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
            <CardTitle className="text-base font-semibold text-green-200">质量合格率趋势</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ReactECharts
              option={qualityOption}
              style={{ height: '300px' }}
              opts={{ renderer: 'canvas' }}
            />
          </CardContent>
        </Card>
      </div>

      {/* 设备状态和待办事项 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 设备运行状态 */}
        <Card className="bg-slate-500/10 backdrop-blur-sm" style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)', borderColor: 'rgba(148, 163, 184, 0.3)' }}>
          <CardHeader className="border-b" style={{ borderColor: 'rgba(148, 163, 184, 0.3)' }}>
            <CardTitle className="text-base font-semibold text-slate-200">设备运行状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {mockData.equipments.slice(0, 10).map((eq) => (
                <div
                  key={eq.id}
                  className={`p-3 min-h-[88px] rounded-lg border text-center transition-all duration-200 cursor-pointer ${
                    eq.status === '运行中' ? 'border-green-500/50 bg-green-500/15 hover:bg-green-500/20' :
                    eq.status === '空闲' ? 'border-slate-400/50 bg-slate-400/15 hover:bg-slate-400/20' :
                    eq.status === '故障' ? 'border-red-500/50 bg-red-500/15 hover:bg-red-500/20' :
                    'border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/20'
                  }`}
                >
                  <div className="font-semibold text-sm text-white">{eq.equipmentId}</div>
                  <div className={`text-xs mt-1 ${
                    eq.status === '运行中' ? 'text-green-400' :
                    eq.status === '空闲' ? 'text-blue-300' :
                    eq.status === '故障' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>{eq.status}</div>
                  {eq.oee && <div className="text-xs text-blue-200 mt-1">{eq.oee.toFixed(1)}%</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 待办事项 */}
        <Card className="bg-amber-500/10 backdrop-blur-sm" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <CardHeader className="border-b" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <CardTitle className="text-base font-semibold text-amber-200">待办事项</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/40 bg-red-500/15 hover:bg-red-500/20 transition-colors duration-200 cursor-pointer">
                <div>
                  <div className="font-medium text-white text-sm">首检待检验</div>
                  <div className="text-xs text-blue-200">WO25030001 - 产品A</div>
                </div>
                <StatusBadge status="紧急" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/20 transition-colors duration-200 cursor-pointer">
                <div>
                  <div className="font-medium text-white text-sm">设备保养提醒</div>
                  <div className="text-xs text-blue-200">C03 加工中心</div>
                </div>
                <StatusBadge status="警告" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-blue-500/40 bg-blue-500/15 hover:bg-blue-500/20 transition-colors duration-200 cursor-pointer">
                <div>
                  <div className="font-medium text-white text-sm">外协送检</div>
                  <div className="text-xs text-blue-200">外协单 OS-2025-001</div>
                </div>
                <StatusBadge status="处理中" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-400/40 bg-slate-400/15 hover:bg-slate-400/20 transition-colors duration-200 cursor-pointer">
                <div>
                  <div className="font-medium text-white text-sm">库存预警</div>
                  <div className="text-xs text-blue-200">铝板6061 库存不足</div>
                </div>
                <StatusBadge status="提醒" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function DashboardPage() {
  return <DashboardContent />
}
