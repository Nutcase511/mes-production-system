/**
 * 借物管理页面
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'
import { LoadingDots } from '@/components/ui/loading-dots'
import { Hand, Package } from 'lucide-react'

const tableId = '借物管理'

const LoanManagementContent: React.FC = () => {
  const { items, loading } = useModelList()
  const records = items as any[]

  const statusCount = {
    borrowed: records.filter(r => r.status === 'borrowed').length,
    returned: records.filter(r => r.status === 'returned').length,
    overdue: records.filter(r => r.status === 'overdue').length
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Hand className="w-6 h-6" />
            借物管理
          </h2>
          <p className="text-sm text-blue-200 mt-1">物资借出与归还管理</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="backdrop-blur-xl bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-200">借出中</p>
                <p className="text-2xl font-bold text-blue-400">{statusCount.borrowed}</p>
              </div>
              <Hand className="w-8 h-8 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-200">已归还</p>
                <p className="text-2xl font-bold text-green-400">{statusCount.returned}</p>
              </div>
              <Package className="w-8 h-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-200">逾期未还</p>
                <p className="text-2xl font-bold text-red-400">{statusCount.overdue}</p>
              </div>
              <Package className="w-8 h-8 text-red-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
        style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardHeader>
          <CardTitle className="text-blue-100">借物记录 ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <LoadingDots />
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-blue-200">
              <Package className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
              <p>暂无借物记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-400/30">
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">借物单号</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">物资名称</th>
                    <th className="text-right py-2 px-3 text-blue-200 font-medium">借出数量</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">借用人</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">借出日期</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">应还日期</th>
                    <th className="text-left py-2 px-3 text-blue-200 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 20).map((record, index) => (
                    <tr key={record.id || index} className="border-b border-blue-400/20 hover:bg-blue-500/10">
                      <td className="py-2 px-3 text-cyan-300 font-medium">{record.id || '-'}</td>
                      <td className="py-2 px-3 text-white">{record.material_name || '-'}</td>
                      <td className="py-2 px-3 text-right text-blue-100">{record.quantity || 0}</td>
                      <td className="py-2 px-3 text-white">{record.borrower || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.borrow_date || '-'}</td>
                      <td className="py-2 px-3 text-blue-100">{record.due_date || '-'}</td>
                      <td className="py-2 px-3">
                        <Badge className={`${record.status === 'returned' ? 'bg-green-500' : record.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                          {record.status === 'returned' ? '已归还' : record.status === 'overdue' ? '逾期' : '借出中'}
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

export function LoanManagementPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <LoanManagementContent />
    </ViewModel>
  )
}

export default LoanManagementPage
