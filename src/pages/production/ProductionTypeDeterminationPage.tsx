/**
 * 生产类型判定页面
 * 功能：
 * 1. 自动判定订单的生产类型（研制/外协/常规）
 * 2. 支持人工修正判定结果
 * 3. 记录判定依据和历史
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList, useModel } from '@airiot/client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { toastApi } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'
import {
  determineProductionType,
  createDeterminationRecord,
  updateDeterminationRecord,
  validateDeterminationData,
  getProductionTypeInfo,
  type ProductionType
} from '@/services/production-type.service'
import { LoadingDots } from '@/components/ui/loading-dots'

const tableId = '生产类型判定'

const ProductionTypeDeterminationContent: React.FC = () => {
  const { items, loading: ordersLoading } = useModelList()
  const { model } = useModel()

  const orders = items as any[]

  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [currentDetermination, setCurrentDetermination] = useState<any>(null)
  const hasInitialized = useRef(false)

  // 编辑弹窗状态
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<{
    finalType: ProductionType
    remark: string
  }>({
    finalType: 'normal',
    remark: ''
  })

  // 筛选待判定的订单（模拟 - 实际应从判定记录表获取）
  const pendingOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return []
    return orders.filter(order => {
      if (!order) return false
      return true // 简化逻辑，实际应检查是否已判定
    })
  }, [orders])

  // 初始化选择第一个订单（只执行一次）
  useEffect(() => {
    if (!hasInitialized.current && pendingOrders.length > 0 && !selectedOrderId) {
      const firstOrder = pendingOrders[0]
      const orderId = firstOrder.notificationNumber || firstOrder.orderNo || firstOrder['serial-number'] || firstOrder.id
      setSelectedOrderId(orderId)
      setSelectedOrder(firstOrder)
      hasInitialized.current = true
    }
  }, [pendingOrders, selectedOrderId])

  // 当选择的订单ID改变时，更新对应的订单数据
  useEffect(() => {
    if (selectedOrderId && orders && orders.length > 0) {
      const selected = orders.find((order) => {
        if (!order) return false
        const orderId = order.notificationNumber || order.orderNo || order['serial-number'] || order.id
        return orderId === selectedOrderId
      })
      if (selected) {
        setSelectedOrder(selected)

        // 自动判定
        const determination = determineProductionType({
          id: selected.id,
          orderNo: selected.notificationNumber || selected.orderNo,
          productName: selected.productName || '',
          customerName: selected.customerName || '',
          isNewProduct: selected.isNewProduct || false,
          requiresSpecialProcess: selected.requiresSpecialProcess || false,
          hasCustomMaterial: selected.hasCustomMaterial || false,
          isPrototype: selected.isPrototype || false,
          capacityOverload: selected.capacityOverload || false,
          requiresExternalEquipment: selected.requiresExternalEquipment || false,
          isSpecialProcess: selected.isSpecialProcess || false,
        })

        setCurrentDetermination(determination)
      }
    }
  }, [selectedOrderId, orders])

  // 确认判定
  const handleConfirmDetermination = async () => {
    if (!selectedOrder || !currentDetermination) {
      toastApi.error('请先选择订单')
      return
    }

    const record = createDeterminationRecord(
      {
        id: selectedOrder.id,
        orderNo: selectedOrder.notificationNumber || selectedOrder.orderNo || '未知编号',
        productName: selectedOrder.productName || '未知产品',
        customerName: selectedOrder.customerName || '未指定',
      },
      currentDetermination
    )

    try {
      // TODO: 保存到数据库
      toastApi.success('判定已确认')

      // 选择下一个待判定订单
      const nextIndex = pendingOrders.findIndex(o => {
        const orderId = o.notificationNumber || o.orderNo || o['serial-number'] || o.id
        return orderId === selectedOrderId
      }) + 1

      if (nextIndex < pendingOrders.length) {
        const nextOrder = pendingOrders[nextIndex]
        const nextOrderId = nextOrder.notificationNumber || nextOrder.orderNo || nextOrder['serial-number'] || nextOrder.id
        setSelectedOrderId(nextOrderId)
      } else {
        setSelectedOrderId('')
        setSelectedOrder(null)
        setCurrentDetermination(null)
      }
    } catch (error) {
      toastApi.error('确认失败：' + (error as Error).message)
    }
  }

  // 打开编辑弹窗
  const handleOpenEdit = (determination: any) => {
    setEditForm({
      finalType: determination.finalType || determination.originalType,
      remark: determination.remark || ''
    })
    setCurrentDetermination(determination)
    setIsEditOpen(true)
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!currentDetermination) return

    const validation = validateDeterminationData({
      ...editForm,
      orderId: currentDetermination.orderId,
      orderNo: currentDetermination.orderNo
    })

    if (!validation.valid) {
      toastApi.error(validation.errors.join(', '))
      return
    }

    toastApi.success('修改成功')
    setIsEditOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">生产类型判定</h2>
          <p className="text-sm text-blue-200 mt-1">自动判定订单生产类型，支持人工修正</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 左侧：待判定订单列表 */}
        <Card className="lg:col-span-1 backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-100 text-base">待判定订单 ({pendingOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {ordersLoading ? (
              <LoadingDots text="加载中..." />
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>所有订单已判定</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {pendingOrders.slice(0, 10).map((order, index) => {
                  if (!order) return null
                  const orderId = order.notificationNumber || order.orderNo || order['serial-number'] || order.id
                  const displayOrderNo = order.notificationNumber || order.orderNo || '无编号'
                  const displayProduct = order.productName || '未知产品'

                  return (
                    <div
                      key={orderId || index}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                        selectedOrderId === orderId
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-blue-400/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-400/50'
                      }`}
                      onClick={() => setSelectedOrderId(orderId)}
                    >
                      <div className="font-medium text-white text-sm">{displayOrderNo}</div>
                      <div className="text-xs text-blue-200 truncate">{displayProduct}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右侧：判定详情 */}
        <div className="lg:col-span-3 space-y-4">
          {/* 当前判定 - 紧凑版 */}
          {selectedOrder && currentDetermination && (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardContent className="p-6">
                {/* 订单信息 - 单行显示 */}
                <div className="flex items-center gap-4 mb-3 pb-3 border-b border-blue-400/20">
                  <div className="flex-1">
                    <p className="text-xs text-blue-300">订单编号</p>
                    <p className="text-sm font-semibold text-white">
                      {selectedOrder.notificationNumber || selectedOrder.orderNo || '无编号'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-blue-300">产品名称</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {selectedOrder.productName || '未知产品'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-blue-300">客户名称</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {selectedOrder.customerName || '未指定'}
                    </p>
                  </div>
                  <div className="flex-1">
                    {currentDetermination?.type && (
                      <Badge className={getProductionTypeInfo(currentDetermination.type)?.color || 'bg-gray-500'}>
                        {getProductionTypeInfo(currentDetermination.type)?.label || '未知类型'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 判定依据 - 紧凑显示 */}
                <div className="mb-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-300" />
                      <span className="text-blue-200">
                        置信度: {Math.round((currentDetermination.confidence || 0) * 100)}%
                      </span>
                    </div>
                    {currentDetermination.reasons && currentDetermination.reasons.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {currentDetermination.reasons.slice(0, 3).map((reason: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmDetermination}
                    className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
                    size="sm"
                  >
                    确认判定
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedOrder && currentDetermination && handleOpenEdit({
                      orderId: selectedOrder.id,
                      orderNo: selectedOrder.notificationNumber || selectedOrder.orderNo || '未知编号',
                      originalType: currentDetermination.type
                    })}
                    disabled={!currentDetermination}
                  >
                    人工修正
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 已判定记录 - 紧凑列表 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
            style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-100 text-base">已判定记录</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="text-center py-8 text-blue-200">
                <p>暂无判定记录</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 编辑弹窗 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>修正生产类型</DialogTitle>
            <DialogDescription>
              修改订单的生产类型判定结果
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>订单编号</Label>
              <p className="text-sm text-white mt-1">{currentDetermination?.orderNo || '未知编号'}</p>
            </div>

            <div>
              <Label>系统判定</Label>
              <p className="text-sm text-blue-200 mt-1">
                {currentDetermination?.originalType && getProductionTypeInfo(currentDetermination.originalType)?.label
                  ? getProductionTypeInfo(currentDetermination.originalType).label
                  : '未知'}
              </p>
            </div>

            <div>
              <Label>修正后的类型 *</Label>
              <Select
                value={editForm.finalType}
                onValueChange={(value: ProductionType) =>
                  setEditForm({ ...editForm, finalType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">研制生产</SelectItem>
                  <SelectItem value="outsourcing">外协生产</SelectItem>
                  <SelectItem value="normal">常规生产</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>修正说明</Label>
              <Textarea
                value={editForm.remark}
                onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })}
                placeholder="请输入修正原因..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveEdit}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function ProductionTypeDeterminationPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <ProductionTypeDeterminationContent />
    </ViewModel>
  )
}
