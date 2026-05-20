/**
 * 试验准备状态检查页面
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'
import { LoadingDots } from '@/components/ui/loading-dots'
import { ClipboardCheck, Package } from 'lucide-react'

const tableId = '试验准备检查'

const TestPreparationCheckContent: React.FC = () => {
  const { items, loading } = useModelList()
  const records = items as any[]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6" />
            试验准备状态检查
          </h2>
          <p className="text-sm text-blue-200 mt-1">试验前设备、人员、环境准备情况检查</p>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
        style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardHeader>
          <CardTitle className="text-blue-100">检查记录 ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <LoadingDots />
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-blue-200">
              <Package className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
              <p>暂无检查记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-400/30">
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">检查单号</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">试验项目</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">检查日期</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">设备状态</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">人员资质</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">检查人</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">结论</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 20).map((record, index) => (
                    <tr key={record.id || index} className="border-b border-blue-400/20 hover:bg-blue-500/10">
                      <td className="py-2 px-3 text-cyan-300 font-medium">{record.id || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.test_project || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.check_date || '-'}</td>
                      <td className="py-2 px-3">
                        <Badge className={`${record.device_status === 'pass' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                          {record.device_status === 'pass' ? '合格' : '不合格'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge className={`${record.personnel_qualification === 'pass' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                          {record.personnel_qualification === 'pass' ? '合格' : '不合格'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-white">{record.checker || '-'}</td>
                      <td className="py-2 px-3">
                        <Badge className={`${record.conclusion === 'pass' ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                          {record.conclusion === 'pass' ? '可试验' : '待整改'}
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

export function TestPreparationCheckPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <TestPreparationCheckContent />
    </ViewModel>
  )
}

export default TestPreparationCheckPage
