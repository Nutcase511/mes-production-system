/**
 * 降级使用页面
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'
import { ArrowDownCircle, Package } from 'lucide-react'
import { LoadingDots } from '@/components/ui/loading-dots'

const tableId = '降级使用'

const DowngradeUseContent: React.FC = () => {
  const { items, loading } = useModelList()
  const records = items as any[]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ArrowDownCircle className="w-6 h-6" />
            降级使用
          </h2>
          <p className="text-sm text-blue-200 mt-1">不合格品降级使用管理</p>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
        style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardHeader>
          <CardTitle className="text-blue-100">降级使用记录 ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <LoadingDots />
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-blue-200">
              <Package className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
              <p>暂无降级使用记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-400/30">
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">降级单号</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">关联不合格品单号</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">物资名称</th>
                    <th className="text-right py-2 px-3 text-blue-200 font-medium">降级数量</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">降级原因</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">降级后用途</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 20).map((record, index) => (
                    <tr key={record.id || index} className="border-b border-blue-400/20 hover:bg-blue-500/10">
                      <td className="py-2 px-3 text-cyan-300 font-medium">{record.id || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.nc_review_id || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.material_name || '-'}</td>
                      <td className="py-2 px-3 text-right text-orange-400">{record.quantity || 0}</td>
                      <td className="py-2 px-3 text-blue-100">{record.reason || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.new_usage || '-'}</td>
                      <td className="py-2 px-3">
                        <Badge className="bg-orange-500 text-white">{record.status || '待审批'}</Badge>
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

export function DowngradeUsePage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <DowngradeUseContent />
    </ViewModel>
  )
}

export default DowngradeUsePage
