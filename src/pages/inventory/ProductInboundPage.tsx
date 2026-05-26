/**
 * 成品入库页面
 * 对终检合格的零件进行入库操作
 */

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList, useModelSave, useModelGetItems } from '@airiot/client'
import { toast } from 'sonner'
import { LoadingDots } from '@/components/ui/loading-dots'
import {
  CheckCircle,
  Package,
  Calendar,
  Warehouse
} from 'lucide-react'
import { PartStatus, FIELD_KEYS, PartStatusLabel } from '@/types/part-production'

const tableId = '生产跟单'

const ProductInboundContent: React.FC = () => {
  const { items, loading } = useModelList()
  const { saveItem } = useModelSave()
  const { getItems } = useModelGetItems()

  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>('')
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)
  const [selectedPartIds, setSelectedPartIds] = useState<Set<string>>(new Set())
  const hasInitialized = useRef(false)

  const workOrders = items as any[]

  // 获取当前工单的合格零件列表
  const qualifiedParts = Array.isArray(selectedWorkOrder?.[FIELD_KEYS.PART_RECORDS])
    ? selectedWorkOrder[FIELD_KEYS.PART_RECORDS].filter(
        (part: any) => part.partStatus === PartStatus.FINAL_CHECK_PASS
      )
    : []

  // 初始化选择第一个工单
  useEffect(() => {
    if (!hasInitialized.current && workOrders.length > 0 && !selectedWorkOrderId) {
      const firstOrder = workOrders[0]
      const woId = firstOrder.id || firstOrder.woId || firstOrder['serial-number']
      setSelectedWorkOrderId(woId)
      setSelectedWorkOrder(firstOrder)
      hasInitialized.current = true
    }
  }, [workOrders, selectedWorkOrderId])

  // 当选择的工单ID改变时
  useEffect(() => {
    if (selectedWorkOrderId && workOrders.length > 0) {
      const selected = workOrders.find((wo) => {
        const woId = wo.id || wo.woId || wo['serial-number']
        return woId === selectedWorkOrderId
      })
      if (selected) {
        setSelectedWorkOrder(selected)
        setSelectedPartIds(new Set()) // 重置选中的零件
      }
    }
  }, [selectedWorkOrderId, workOrders])

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = qualifiedParts.map((part: any) => part.partID)
      setSelectedPartIds(new Set(allIds))
    } else {
      setSelectedPartIds(new Set())
    }
  }

  // 选择单个零件
  const handleSelectPart = (partId: string, checked: boolean) => {
    const newSelected = new Set(selectedPartIds)
    if (checked) {
      newSelected.add(partId)
    } else {
      newSelected.delete(partId)
    }
    setSelectedPartIds(newSelected)
  }

  // 批量入库
  const handleInbound = async () => {
    if (selectedPartIds.size === 0) {
      toast.error('请选择要入库的零件')
      return
    }

    try {
      // 获取现有零件记录
      const existingParts = Array.isArray(selectedWorkOrder[FIELD_KEYS.PART_RECORDS])
        ? [...selectedWorkOrder[FIELD_KEYS.PART_RECORDS]]
        : []

      // TODO: 这里应该创建库存记录到库存总表
      // 由于没有库存表的结构，暂时只更新跟单状态

      // 往 processRecord 追加入库记录
      const existingProcessRecord = Array.isArray(selectedWorkOrder.orderFollowLog)
        ? [...selectedWorkOrder.orderFollowLog]
        : []

      existingProcessRecord.push({
        processNo: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/[/:]/g, '').replace(/\s/g, '').replace(/,/g, ''),
        processName: `入库 ${selectedPartIds.size} 个合格零件`,
        operator: '系统',
      })

      await saveItem({
        ...selectedWorkOrder,
        orderFollowLog: existingProcessRecord,
      })

      await getItems()
      toast.success(`成功入库 ${selectedPartIds.size} 个零件`)
      setSelectedPartIds(new Set())
    } catch (error) {
      toast.error('入库失败，请稍后重试')
    }
  }

  const allSelected = qualifiedParts.length > 0 && selectedPartIds.size === qualifiedParts.length

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">成品入库</h2>
          <p className="text-sm text-blue-200 mt-1">对终检合格的零件进行入库操作</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 左侧：可入库工单列表 */}
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-100 text-base">可入库工单 ({workOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {loading ? (
              <LoadingDots />
            ) : workOrders.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>暂无可入库工单</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {workOrders.slice(0, 10).map((wo, index) => {
                  const woId = wo.id || wo.woId || wo['serial-number']
                  const displayWoNo = wo.woId || wo['serial-number'] || '无编号'
                  const displayProduct = wo.productName || wo.product_code || '未知产品'

                  // 计算该工单的合格零件数量
                  const qualifiedCount = Array.isArray(wo[FIELD_KEYS.PART_RECORDS])
                    ? wo[FIELD_KEYS.PART_RECORDS].filter(
                        (part: any) => part.partStatus === PartStatus.FINAL_CHECK_PASS
                      ).length
                    : 0

                  return (
                    <div
                      key={woId || index}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                        selectedWorkOrderId === woId
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-blue-400/30 bg-blue-500/5 hover:bg-blue-500/10'
                      }`}
                      onClick={() => setSelectedWorkOrderId(woId)}
                    >
                      <div className="font-medium text-white text-sm">{displayWoNo}</div>
                      <div className="text-xs text-blue-200 truncate">{displayProduct}</div>
                      <div className="text-xs text-green-400 mt-1">合格零件: {qualifiedCount} 个</div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右侧：零件列表和入库操作 */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedWorkOrder ? (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-blue-300/50" />
                <p className="text-blue-200">请从左侧选择可入库的工单</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 工单信息 */}
              <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-100 text-base">工单信息</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-blue-300">工单编号</p>
                      <p className="text-sm font-semibold text-white">
                        {selectedWorkOrder.woId || selectedWorkOrder['serial-number'] || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300">产品名称</p>
                      <p className="text-sm font-semibold text-white truncate">
                        {selectedWorkOrder.productName || '未知产品'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300">合格零件</p>
                      <p className="text-sm font-semibold text-green-400">{qualifiedParts.length} 个</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300">已选零件</p>
                      <p className="text-sm font-semibold text-cyan-300">{selectedPartIds.size} 个</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 合格零件列表 */}
              <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-100 text-base flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      合格零件列表 ({qualifiedParts.length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm text-blue-200 cursor-pointer">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={(checked) => handleSelectAll(checked === true)}
                        />
                        全选
                      </label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {qualifiedParts.length === 0 ? (
                    <div className="text-center py-8 text-blue-200">
                      <p>暂无合格零件</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-blue-400/30">
                            <th className="text-left py-2 px-3 w-12">
                              <Checkbox
                                checked={allSelected}
                                onCheckedChange={(checked) => handleSelectAll(checked === true)}
                              />
                            </th>
                            <th className="text-left py-2 px-3 text-blue-200 font-medium">零件ID</th>
                            <th className="text-left py-2 px-3 text-blue-200 font-medium">开始时间</th>
                            <th className="text-left py-2 px-3 text-blue-200 font-medium">结束时间</th>
                            <th className="text-left py-2 px-3 text-blue-200 font-medium">操作人</th>
                            <th className="text-left py-2 px-3 text-blue-200 font-medium">检验人</th>
                            <th className="text-left py-2 px-3 text-blue-200 font-medium">检验时间</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualifiedParts.map((part: any, index: number) => {
                            const partId = part.partID
                            const isSelected = selectedPartIds.has(partId)

                            return (
                              <tr
                                key={partId || index}
                                className={`border-b border-blue-400/20 ${isSelected ? 'bg-blue-500/20' : ''}`}
                              >
                                <td className="py-2 px-3">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => handleSelectPart(partId, checked === true)}
                                  />
                                </td>
                                <td className="py-2 px-3 text-cyan-300 font-medium">{partId}</td>
                                <td className="py-2 px-3 text-blue-100">
                                  {part.startTime
                                    ? new Date(part.startTime).toLocaleString('zh-CN', { hour12: false })
                                    : '-'}
                                </td>
                                <td className="py-2 px-3 text-blue-100">
                                  {part.endTime
                                    ? new Date(part.endTime).toLocaleString('zh-CN', { hour12: false })
                                    : '-'}
                                </td>
                                <td className="py-2 px-3 text-white">{part.operator || '-'}</td>
                                <td className="py-2 px-3 text-white">{part.inspector || '-'}</td>
                                <td className="py-2 px-3 text-blue-100">
                                  {part.inspectorTime
                                    ? new Date(part.inspectorTime).toLocaleString('zh-CN', { hour12: false })
                                    : '-'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 入库操作按钮 */}
              {qualifiedParts.length > 0 && (
                <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                  style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                          <Warehouse className="w-4 h-4" />
                          入库操作
                        </h3>
                        <p className="text-xs text-blue-200 mt-1">
                          已选择 {selectedPartIds.size} / {qualifiedParts.length} 个零件
                        </p>
                      </div>
                      <Button
                        onClick={handleInbound}
                        disabled={selectedPartIds.size === 0}
                        className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        确认入库 ({selectedPartIds.size})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function ProductInboundPage() {
  // 设置查询过滤条件：productionStatus=6 (生产完成，可入库)
  const tableFilters = {
    'productionStatus': '6'
  }

  return (
    <ViewModel tableId={tableId} initQuery={true} tableFilters={tableFilters}>
      <ProductInboundContent />
    </ViewModel>
  )
}

export default ProductInboundPage
