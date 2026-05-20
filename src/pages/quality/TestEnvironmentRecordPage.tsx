/**
 * 试验环境温湿度监控页面
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'
import { LoadingDots } from '@/components/ui/loading-dots'
import { Thermometer, Package } from 'lucide-react'

const tableId = '试验环境监控'

const TestEnvironmentRecordContent: React.FC = () => {
  const { items, loading } = useModelList()
  const records = items as any[]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Thermometer className="w-6 h-6" />
            试验环境温湿度监控
          </h2>
          <p className="text-sm text-blue-200 mt-1">试验环境温湿度记录与监控</p>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
        style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardHeader>
          <CardTitle className="text-blue-100">监控记录 ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <LoadingDots />
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-blue-200">
              <Package className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
              <p>暂无监控记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-400/30">
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">记录号</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">监控区域</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">记录日期</th>
                    <th className="text-right py-2 px-3 text-blue-200 font-medium">温度(℃)</th>
                    <th className="text-right py-2 px-3 text-blue-200 font-medium">湿度(%RH)</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">是否符合要求</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">记录人</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 20).map((record, index) => (
                    <tr key={record.id || index} className="border-b border-blue-400/20 hover:bg-blue-500/10">
                      <td className="py-2 px-3 text-cyan-300 font-medium">{record.id || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.area || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.record_date || '-'}</td>
                      <td className="py-2 px-3 text-right text-blue-100">{record.temperature ?? '-'}</td>
                      <td className="py-2 px-3 text-right text-blue-100">{record.humidity ?? '-'}</td>
                      <td className="py-2 px-3">
                        <Badge className={`${record.is_compliant ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                          {record.is_compliant ? '符合' : '不符合'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-white">{record.recorder || '-'}</td>
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

export function TestEnvironmentRecordPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <TestEnvironmentRecordContent />
    </ViewModel>
  )
}

export default TestEnvironmentRecordPage
