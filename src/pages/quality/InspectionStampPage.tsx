/**
 * 检验印章管理页面
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'
import { LoadingDots } from '@/components/ui/loading-dots'
import { Stamp, Package } from 'lucide-react'

const tableId = '检验印章管理'

const InspectionStampContent: React.FC = () => {
  const { items, loading } = useModelList()
  const records = items as any[]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Stamp className="w-6 h-6" />
            检验印章管理
          </h2>
          <p className="text-sm text-blue-200 mt-1">检验人员印章登记与授权管理</p>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
        style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardHeader>
          <CardTitle className="text-blue-100">印章记录 ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <LoadingDots />
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-blue-200">
              <Package className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
              <p>暂无印章记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-400/30">
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">印章编号</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">印章类型</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">持有人</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">授权范围</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">发放日期</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">有效期至</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 20).map((record, index) => (
                    <tr key={record.id || index} className="border-b border-blue-400/20 hover:bg-blue-500/10">
                      <td className="py-2 px-3 text-cyan-300 font-medium">{record.id || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.stamp_type || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.holder || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.authorization_scope || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.issue_date || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.expiry_date || '-'}</td>
                      <td className="py-2 px-3">
                        <Badge className={`${record.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                          {record.status === 'active' ? '有效' : '已注销'}
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

export function InspectionStampPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <InspectionStampContent />
    </ViewModel>
  )
}

export default InspectionStampPage
