/**
 * 现场服务记录页面
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'
import { LoadingDots } from '@/components/ui/loading-dots'
import { Wrench, Package } from 'lucide-react'

const tableId = '现场服务记录'

const FieldServiceContent: React.FC = () => {
  const { items, loading } = useModelList()
  const records = items as any[]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            现场服务记录
          </h2>
          <p className="text-sm text-blue-200 mt-1">售后服务现场支持记录</p>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
        style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardHeader>
          <CardTitle className="text-blue-100">服务记录 ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <LoadingDots />
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-blue-200">
              <Package className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
              <p>暂无服务记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-400/30">
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">服务单号</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">顾客名称</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">服务类型</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">服务地点</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">服务日期</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">服务人员</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">顾客评价</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 20).map((record, index) => (
                    <tr key={record.id || index} className="border-b border-blue-400/20 hover:bg-blue-500/10">
                      <td className="py-2 px-3 text-cyan-300 font-medium">{record.id || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.customer_name || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.service_type || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.service_location || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.service_date || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.service_person || '-'}</td>
                      <td className="py-2 px-3">
                        <Badge className={`${record.customer_rating >= 4 ? 'bg-green-500' : record.customer_rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                          {record.customer_rating ? `${record.customer_rating}分` : '未评价'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge className={`${record.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
                          {record.status === 'completed' ? '已完成' : '进行中'}
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

export function FieldServicePage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <FieldServiceContent />
    </ViewModel>
  )
}

export default FieldServicePage
