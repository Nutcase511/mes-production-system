/**
 * 外协超差处理页面
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'
import { LoadingDots } from '@/components/ui/loading-dots'
import { AlertTriangle, Package } from 'lucide-react'

const tableId = '外协超差处理'

const OutsourcedDeviationContent: React.FC = () => {
  const { items, loading } = useModelList()
  const records = items as any[]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            外协超差处理
          </h2>
          <p className="text-sm text-blue-200 mt-1">外协产品超差品审理</p>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
        style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardHeader>
          <CardTitle className="text-blue-100">超差处理记录 ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <LoadingDots />
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-blue-200">
              <Package className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
              <p>暂无超差处理记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-400/30">
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">处理单号</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">外协单位</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">产品名称</th>
                    <th className="text-right py-2 px-3 text-blue-200 font-medium">超差数量</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">超差原因</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">处理意见</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 20).map((record, index) => (
                    <tr key={record.id || index} className="border-b border-blue-400/20 hover:bg-blue-500/10">
                      <td className="py-2 px-3 text-cyan-300 font-medium">{record.id || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.supplier || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.product_name || '-'}</td>
                      <td className="py-2 px-3 text-right text-red-400">{record.quantity || 0}</td>
                      <td className="py-2 px-3 text-blue-100">{record.reason || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.disposal || '-'}</td>
                      <td className="py-2 px-3">
                        <Badge className="bg-blue-500 text-white">{record.status || '待处理'}</Badge>
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

export function OutsourcedDeviationPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <OutsourcedDeviationContent />
    </ViewModel>
  )
}

export default OutsourcedDeviationPage
