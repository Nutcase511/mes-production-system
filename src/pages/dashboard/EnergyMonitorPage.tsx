/**
 * 能源监控页面
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'
import { LoadingDots } from '@/components/ui/loading-dots'
import { Activity, Zap } from 'lucide-react'

const tableId = '能源监控'

const EnergyMonitorContent: React.FC = () => {
  const { items, loading } = useModelList()
  const records = items as any[]

  // 计算统计数据
  const totalPower = records.reduce((sum, r) => sum + (r.power_consumption || 0), 0)
  const avgPower = records.length > 0 ? totalPower / records.length : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            能源监控
          </h2>
          <p className="text-sm text-blue-200 mt-1">生产能源消耗实时监控看板</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="backdrop-blur-xl bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-200">总能耗</p>
                <p className="text-2xl font-bold text-blue-400">{totalPower.toFixed(1)} kWh</p>
              </div>
              <Zap className="w-8 h-8 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-200">平均能耗</p>
                <p className="text-2xl font-bold text-green-400">{avgPower.toFixed(1)} kWh</p>
              </div>
              <Activity className="w-8 h-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-200">监控点数</p>
                <p className="text-2xl font-bold text-orange-400">{records.length}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
        style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardHeader>
          <CardTitle className="text-blue-100">监控数据 ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <LoadingDots />
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-blue-200">
              <Activity className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
              <p>暂无监控数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-400/30">
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">监控点</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">设备名称</th>
                    <th className="text-right py-2 px-3 text-blue-200 font-medium">功率(kW)</th>
                    <th className="text-right py-2 px-3 text-blue-200 font-medium">当日能耗(kWh)</th>
                    <th className="text-right py-2 px-3 text-blue-200 font-medium">本月能耗(kWh)</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">采集时间</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 20).map((record, index) => (
                    <tr key={record.id || index} className="border-b border-blue-400/20 hover:bg-blue-500/10">
                      <td className="py-2 px-3 text-cyan-300 font-medium">{record.monitor_point || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.device_name || '-'}</td>
                      <td className="py-2 px-3 text-right text-blue-100">{record.power?.toFixed(2) || '-'}</td>
                      <td className="py-2 px-3 text-right text-green-400">{record.daily_consumption?.toFixed(1) || '-'}</td>
                      <td className="py-2 px-3 text-right text-blue-100">{record.monthly_consumption?.toFixed(1) || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.collect_time || '-'}</td>
                      <td className="py-2 px-3">
                        <Badge className={`${record.status === 'normal' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                          {record.status === 'normal' ? '正常' : '异常'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function EnergyMonitorPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <EnergyMonitorContent />
    </ViewModel>
  )
}

export default EnergyMonitorPage
