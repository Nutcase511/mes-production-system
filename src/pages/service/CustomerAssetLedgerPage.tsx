/**
 * 顾客资产台账页面（视图）
 * 从移交清单自动生成
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LoadingDots } from '@/components/ui/loading-dots'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'
import { useState } from 'react'
import { Database, Search, Package } from 'lucide-react'

const tableId = '顾客资产台账'

const CustomerAssetLedgerContent: React.FC = () => {
  const { items, loading } = useModelList()
  const [searchTerm, setSearchTerm] = useState('')

  const records = items as any[]

  const filteredItems = records.filter(item => 
    item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.material_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            顾客资产台账
          </h2>
          <p className="text-sm text-blue-200 mt-1">从移交清单自动生成（视图）</p>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl"
        style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
              <Input
                placeholder="搜索顾客名称或物资名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
        style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardHeader>
          <CardTitle className="text-blue-100">资产明细 ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <LoadingDots />
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-blue-200">
              <Package className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
              <p>暂无资产记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-400/30">
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">台账编号</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">顾客名称</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">物资名称</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">规格型号</th>
                    <th className="text-right py-2 px-3 text-blue-200 font-medium">到货数量</th>
                    <th className="text-right py-2 px-3 text-blue-200 font-medium">领用数量</th>
                    <th className="text-right py-2 px-3 text-blue-200 font-medium">结存数量</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">材料状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.slice(0, 20).map((item, index) => (
                    <tr key={item.ledger_no || index} className="border-b border-blue-400/20 hover:bg-blue-500/10">
                      <td className="py-2 px-3 text-cyan-300 font-medium">{item.ledger_no || '-'}</td>
                      <td className="py-2 px-3 text-white">{item.customer_name || '-'}</td>
                      <td className="py-2 px-3 text-white">{item.material_name || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{item.spec || '-'}</td>
                      <td className="py-2 px-3 text-right text-green-400">{item.arrived_qty || 0}</td>
                      <td className="py-2 px-3 text-right text-blue-100">{item.issued_qty || 0}</td>
                      <td className="py-2 px-3 text-right font-semibold text-white">{item.balance_qty || 0}</td>
                      <td className="py-2 px-3">
                        <Badge className={`${item.material_status === '完整' ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                          {item.material_status || '完整'}
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

export function CustomerAssetLedgerPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <CustomerAssetLedgerContent />
    </ViewModel>
  )
}

export default CustomerAssetLedgerPage
