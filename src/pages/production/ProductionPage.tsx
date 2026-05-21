/**
 * 正式生产页面
 * 首件检验通过后进行正式生产
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList, useModelSave, useModelGetItems, useModel , createAPI } from '@airiot/client'
import { toast } from 'sonner'
import OperationGuidePreview from '@/components/OperationGuidePreview'
import { useAuth } from '@/contexts/AuthContext'
import { PartStatus, generatePartId, FIELD_KEYS, PartStatusLabel } from '@/types/part-production'
import { LoadingDots } from '@/components/ui/loading-dots'
import {
  CheckCircle,
  Play,
  Square,
  BookOpen,
  ClipboardCheck,
  Package,
  Clock
} from 'lucide-react'

const tableId = '生产跟单'

// 计算已完成零件数量（包括首件）
const countCompletedParts = (parts: any[]): number => {
  return parts.filter(part => {
    const isFirstPart = part.partID?.endsWith('-01')
    if (isFirstPart) {
      return part.partStatus === PartStatus.FIRST_CHECK_PASS ||
             part.partStatus === PartStatus.PRODUCTION_COMPLETED
    }
    return part.partStatus === PartStatus.PRODUCTION_COMPLETED
  }).length
}

const ProductionContent: React.FC = () => {
  const { items, loading: modelLoading } = useModelList({ initQuery: false })
  const { saveItem } = useModelSave()
  const { getItems } = useModelGetItems()
  const { model } = useModel()
  const { user } = useAuth()

  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>('')
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)
  const [selectedPartId, setSelectedPartId] = useState<string>('') // 选中的零件ID（拆单模式）
  const hasInitialized = useRef(false)

  const workOrders = items as any[]
  const loading = modelLoading

  // 初始化查询
  const initializedRef = useRef(false)
  useEffect(() => {
    if (model?.properties && !initializedRef.current) {
      initializedRef.current = true
      const fields = Object.keys(model.properties)
      // 注释：使用 ViewModel 的 initQuery 代替手动调用
      // getItems({
      //   fields: fields,
      //   wheres: { filter: tableFilters }
      // })
    }
  }, [model])

  // 获取当前工单的零件列表
  const partRecords = Array.isArray(selectedWorkOrder?.[FIELD_KEYS.PART_RECORDS])
    ? selectedWorkOrder[FIELD_KEYS.PART_RECORDS]
    : []

  // 找到当前生产中的零件
  const producingPart = partRecords.find(
    part => part.partStatus === PartStatus.PRODUCING
  )

  // 计划数量
  const planQuantity = selectedWorkOrder?.plannedInputQuantity || 0

  // 已完成生产的零件数量（包括首件）
  const completedParts = countCompletedParts(partRecords)

  // 是否达到计划数量
  const reachedPlanLimit = completedParts >= planQuantity

  // 判断是否拆单返工模式
  // 检查父级跟单ID字段（已修正为 parentWorkOrderID）
  const hasParentId = !!selectedWorkOrder?.[FIELD_KEYS.PARENT_ORDER_ID]

  const isSplitReworkMode = hasParentId && partRecords.length > 0

  // 可选零件：状态为 PENDING 或 TRIAL_PRODUCING 的零件（拆单模式）
  // 注意：拆单后零件可能处于待生产或试产中状态
  const selectableParts = partRecords.filter(
    part => part.partStatus === PartStatus.PENDING ||
            part.partStatus === PartStatus.TRIAL_PRODUCING
  )


  // 初始化选择第一个工单
  useEffect(() => {
    if (!hasInitialized.current && workOrders.length > 0 && !selectedWorkOrderId) {
      const firstOrder = workOrders[0]
      const woId = firstOrder.woId || firstOrder['serial-number'] || firstOrder.id
      setSelectedWorkOrderId(woId)
      setSelectedWorkOrder(firstOrder)
      hasInitialized.current = true
    }
  }, [workOrders, selectedWorkOrderId])

  // 当选择的工单ID改变时
  useEffect(() => {
    if (selectedWorkOrderId && workOrders.length > 0) {
      const selected = workOrders.find((wo) => {
        const woId = wo.woId || wo['serial-number'] || wo.id
        return woId === selectedWorkOrderId
      })
      if (selected) {
        setSelectedWorkOrder(selected)
      }
    }
  }, [selectedWorkOrderId, workOrders])

  // 开始生产
  const handleStart = async () => {
    try {
      // 检查是否已有零件在生产中
      if (producingPart) {
        toast.error('已有零件正在生产中，请先完成当前零件')
        return
      }

      // 拆单返工模式：使用选中的零件
      if (isSplitReworkMode) {
        // 检查是否已选择零件
        if (!selectedPartId) {
          toast.error('请先选择一个零件')
          return
        }

        // 获取现有零件记录
        const existingParts = Array.isArray(selectedWorkOrder[FIELD_KEYS.PART_RECORDS])
          ? [...selectedWorkOrder[FIELD_KEYS.PART_RECORDS]]
          : []

        // 找到选中的零件并更新状态
        const partIndex = existingParts.findIndex(p => p.partID === selectedPartId)
        if (partIndex === -1) {
          toast.error('未找到选中的零件')
          return
        }

        // 更新选中零件状态为 PRODUCING
        existingParts[partIndex] = {
          ...existingParts[partIndex],
          partStatus: PartStatus.PRODUCING,
          startTime: new Date().toISOString(),
          equipment: selectedWorkOrder.equipment || '',
          operator: user?.name || user?.username || '',
        }

        // 往 processRecord 追加生产记录
        const existingProcessRecord = Array.isArray(selectedWorkOrder.processRecord)
          ? [...selectedWorkOrder.processRecord]
          : []

        existingProcessRecord.push({
          processNo: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/[/:]/g, '').replace(/\s/g, '').replace(/,/g, ''),
          processName: `开始返工零件 ${existingParts[partIndex].partID}`,
          operator: user?.name || user?.username || '',
        })

        await saveItem({
          ...selectedWorkOrder,
          [FIELD_KEYS.PART_RECORDS]: existingParts,
          processRecord: existingProcessRecord,
          'productionStatus': '4', // 生产中
        })

        toast.success(`开始返工零件 ${existingParts[partIndex].partID}`)
        return
      }

      // 常规模式：自动创建新零件
      // 获取现有零件记录，确保为数组
      const existingParts = Array.isArray(selectedWorkOrder[FIELD_KEYS.PART_RECORDS])
        ? [...selectedWorkOrder[FIELD_KEYS.PART_RECORDS]]
        : selectedWorkOrder[FIELD_KEYS.PART_RECORDS] === null ? [] : []

      // 计算已完成的零件数量（包括首件）
      const completedCount = countCompletedParts(existingParts)

      // 检查是否达到计划数量
      const planQty = selectedWorkOrder?.plannedInputQuantity || 0
      if (completedCount >= planQty) {
        toast.error(`已达到计划数量 ${planQty}，无法继续生产`)
        return
      }

      // 生成工单号
      const workOrderNo = selectedWorkOrder.woId || selectedWorkOrder['serial-number'] || selectedWorkOrder.id || 'UNKNOWN'

      // 计算下一个零件序号（排除首件，从序号2开始）
      const nextSeq = existingParts.length > 0 ? existingParts.length + 1 : 2

      // 创建新零件记录（子表字段不需要前缀）
      const newPart = {
        partID: generatePartId(workOrderNo, existingParts.length + 1),
        partStatus: PartStatus.PRODUCING,
        startTime: new Date().toISOString(),
        equipment: selectedWorkOrder.equipment || '',
        operator: user?.name || user?.username || '',
      }

      // 往 processRecord 追加生产记录
      const existingProcessRecord = Array.isArray(selectedWorkOrder.processRecord)
        ? [...selectedWorkOrder.processRecord]
        : []

      existingProcessRecord.push({
        processNo: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/[/:]/g, '').replace(/\s/g, '').replace(/,/g, ''),
        processName: `开始生产零件 ${newPart[FIELD_KEYS.PART_ID]}`,
        operator: user?.name || user?.username || '',
      })

      await saveItem({
        ...selectedWorkOrder,
        [FIELD_KEYS.PART_RECORDS]: [...existingParts, newPart],
        processRecord: existingProcessRecord,
        'productionStatus': '4', // 生产中
      })
      // 不刷新列表，只更新当前工单数据
      toast.success(`开始生产零件 ${newPart[FIELD_KEYS.PART_ID]}`)
    } catch (error) {
      toast.error('保存失败，请稍后重试')
    }
  }

  // 生产结束
  const handleEnd = async () => {
    try {
      // 从 items 列表中重新找到当前选中的工单（确保是最新数据）
      const currentWorkOrder = workOrders.find(wo => {
        const woId = wo.woId || wo['serial-number'] || wo.id
        return woId === selectedWorkOrderId
      })

      if (!currentWorkOrder) {
        toast.error('未找到当前工单')
        return
      }

      // 获取当前工单的零件列表
      const currentParts = Array.isArray(currentWorkOrder?.[FIELD_KEYS.PART_RECORDS])
        ? [...currentWorkOrder[FIELD_KEYS.PART_RECORDS]]
        : currentWorkOrder[FIELD_KEYS.PART_RECORDS] === null ? [] : []

      if (currentParts.length === 0) {
        toast.error('没有零件记录')
        return
      }

      // ✅ 直接修改最后一条记录（就是刚刚开始生产的那个）
      const lastIndex = currentParts.length - 1
      const lastPart = currentParts[lastIndex]

      // 更新最后一条零件记录的状态
      currentParts[lastIndex] = {
        ...lastPart,
        partStatus: PartStatus.PRODUCTION_COMPLETED,
        endTime: new Date().toISOString(),
      }

      // 往 processRecord 追加生产记录
      const existingProcessRecord = Array.isArray(currentWorkOrder.processRecord)
        ? [...currentWorkOrder.processRecord]
        : []

      existingProcessRecord.push({
        processNo: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/[/:]/g, '').replace(/\s/g, '').replace(/,/g, ''),
        processName: `完成零件 ${lastPart[FIELD_KEYS.PART_ID]}`,
        operator: user?.name || user?.username || '',
      })

      await saveItem({
        ...currentWorkOrder,
        [FIELD_KEYS.PART_RECORDS]: currentParts,
        processRecord: existingProcessRecord,
      })
      // 生产中不刷新列表，只更新当前记录
      toast.success(`零件 ${lastPart.partID} 生产完成`)

      // 检查是否达到计划数量（完成数量 >= 计划数量）
      const planQty = currentWorkOrder?.plannedInputQuantity || 0
      const completedCount = countCompletedParts(currentParts)

      // 只有当达到计划数量时，才更新跟单状态为"生产完成"并刷新列表
      if (completedCount >= planQty && planQty > 0) {
        await saveItem({
          ...currentWorkOrder,
          [FIELD_KEYS.PART_RECORDS]: currentParts,
          'productionStatus': '5', // 生产完成
        })
        await getItems() // 只在100%完成时刷新左侧列表
        toast.success('所有零件生产完成，请进行终检')
      }
    } catch (error) {
      toast.error('保存失败，请稍后重试')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">正式生产</h2>
          <p className="text-sm text-blue-200 mt-1">首件检验通过后执行正式生产</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 左侧：生产工单列表 */}
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-100 text-base">生产工单 ({workOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {loading ? (
              <LoadingDots />
            ) : workOrders.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>暂无生产工单</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {workOrders.slice(0, 10).map((wo, index) => {
                  const woId = wo.woId || wo['serial-number'] || wo.id
                  // 尝试从 relatedProductionNoticeNo 或 pid 中获取通知单号
                  const notificationNo = wo.relatedProductionNoticeNo?.notificationNumber ||
                                        wo.pid?.notificationNumber ||
                                        wo.pid?.productionOrderNo ||
                                        ''
                  const displayWoNo = notificationNo || wo.woId || wo['serial-number'] || '无编号'
                  const displayProduct = wo.productName || wo.product_code || '未知产品'

                  return (
                    <div
                      key={woId || index}
                      className={`p-2 border rounded-lg cursor-pointer transition-all duration-150 ${selectedWorkOrderId === woId
                        ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                        : 'border-blue-400/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-400/50'
                        }`}
                      onClick={() => setSelectedWorkOrderId(woId)}
                    >
                      <div className="font-medium text-white text-sm">{displayWoNo}</div>
                      <div className="text-xs text-blue-200 truncate">{displayProduct}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右侧：生产控制区域 */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedWorkOrder ? (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardContent className="p-12 text-center">
                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-blue-300/50" />
                <p className="text-blue-200">请从左侧选择生产工单</p>
              </CardContent>
            </Card>
          ) : (
          <>
          {/* 工单信息 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
            style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-4 mb-3">
                <div>
                  <p className="text-xs text-blue-300">工单编号</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedWorkOrder.woId || selectedWorkOrder['serial-number']}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">产品名称</p>
                  <p className="text-sm font-semibold text-white truncate">
                    {selectedWorkOrder.productName || '未知产品'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">工序</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedWorkOrder.processName || '未知工序'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">设备</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedWorkOrder.equipment || '未分配'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">计划数量</p>
                  <p className="text-sm font-semibold text-cyan-300">
                    {planQuantity} 个
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-blue-400/20">
                <BookOpen className="w-4 h-4 text-blue-300" />
                <span className="text-sm text-blue-200">操作指导书:</span>
                <OperationGuidePreview
                  files={selectedWorkOrder.operationGuide || selectedWorkOrder['操作指导书']}
                />
              </div>
            </CardContent>
          </Card>

          {/* 生产操作 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
            style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">生产操作</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-xs text-blue-200">
                      {producingPart ? `正在生产: ${producingPart[FIELD_KEYS.PART_ID]}` : '等待开始生产'}
                    </p>
                    <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-200">生产进度:</span>
                    <span className={`text-sm font-semibold ${reachedPlanLimit ? 'text-red-400' : 'text-green-400'}`}>
                      {completedParts} / {planQuantity}
                    </span>
                    <span className="text-xs text-blue-300">
                      ({planQuantity > 0 ? ((completedParts / planQuantity) * 100).toFixed(1) : 0}%)
                    </span>
                    {isSplitReworkMode && (
                      <>
                        <span className="mx-2 text-blue-400/30">|</span>
                        <span className="text-xs text-blue-200">当前选中:</span>
                        <span className="text-sm font-semibold text-cyan-300">
                          {selectedPartId || '未选择'}
                        </span>
                      </>
                    )}
                  </div>
                  </div>
                  {reachedPlanLimit && (
                    <p className="text-xs text-red-400 mt-2">⚠️ 已达到计划数量，无法继续生产</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleStart}
                    disabled={!!producingPart || reachedPlanLimit || (isSplitReworkMode && !selectedPartId)}
                    className="bg-gradient-to-r from-blue-400 to-cyan-400"
                    size="sm"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    开始生产
                  </Button>
                  <Button
                    onClick={handleEnd}
                    disabled={!producingPart}
                    className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500"
                    size="sm"
                  >
                    <Square className="w-3 h-3 mr-1" />
                    生产结束
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 零件列表 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
            style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-100 text-base">零件列表 ({partRecords.length})</CardTitle>
                <div className="text-xs text-blue-200">
                  含首件: {partRecords.length} 个
                  {partRecords.length > 0 && (
                    <span className="ml-2">正式生产: {partRecords.length - 1} 个</span>
                  )}
                </div>
              </div>
              {isSplitReworkMode && (
                <div className="mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-xs text-amber-300">⚠️ 拆单返工模式：请选择一个待生产零件开始生产</p>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              {partRecords.length === 0 ? (
                <div className="text-center py-8 text-blue-200">
                  <p>暂无零件记录</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-blue-400/30 bg-blue-950/90">
                        {isSplitReworkMode && <th className="text-left py-2 px-3 text-blue-200 font-medium">选择</th>}
                        <th className="text-left py-2 px-3 text-blue-200 font-medium">零件ID</th>
                        <th className="text-left py-2 px-3 text-blue-200 font-medium">类型</th>
                        <th className="text-left py-2 px-3 text-blue-200 font-medium">状态</th>
                        <th className="text-left py-2 px-3 text-blue-200 font-medium">开始时间</th>
                        <th className="text-left py-2 px-3 text-blue-200 font-medium">结束时间</th>
                        <th className="text-left py-2 px-3 text-blue-200 font-medium">操作人</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partRecords.map((part, index) => {
                        const status = part.partStatus
                        const statusLabel = PartStatusLabel[status] || status
                        const isProducing = status === PartStatus.PRODUCING
                        // 判断是否为首件：partID 以 "-01" 结尾
                        const isFirstPart = part.partID?.endsWith('-01')
                        // 拆单模式下，判断是否可选（状态为 PENDING 或 TRIAL_PRODUCING）
                        const isSelectable = isSplitReworkMode && (
                          part.partStatus === PartStatus.PENDING ||
                          part.partStatus === PartStatus.TRIAL_PRODUCING
                        )
                        // 斑马纹：偶数行加背景
                        const isEvenRow = index % 2 === 0

                        return (
                          <tr
                            key={part.partID || index}
                            className={`border-b border-blue-400/20 ${isEvenRow ? 'bg-blue-500/5' : ''} ${isProducing ? 'bg-blue-500/20' : ''} ${isSelectable ? 'cursor-pointer hover:bg-blue-500/10' : ''}`}
                            onClick={() => isSelectable && setSelectedPartId(part.partID)}
                          >
                            {isSplitReworkMode && (
                              <td className="py-2 px-3">
                                <input
                                  type="radio"
                                  name="part-selection"
                                  checked={selectedPartId === part.partID}
                                  onChange={() => setSelectedPartId(part.partID)}
                                  disabled={!isSelectable}
                                  className="w-4 h-4 text-cyan-400 bg-blue-500/10 border-blue-400/30 focus:ring-cyan-400"
                                />
                              </td>
                            )}
                            <td className="py-2 px-3 text-cyan-300 font-medium">{part.partID}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isFirstPart ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {isFirstPart ? '首件' : '正式'}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isProducing ? 'bg-green-500/20 text-green-400' :
                                status === PartStatus.PRODUCTION_COMPLETED ? 'bg-blue-500/20 text-blue-300' :
                                status === PartStatus.PENDING ? 'bg-amber-500/20 text-amber-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-blue-100">
                              {part.startTime ? new Date(part.startTime).toLocaleString('zh-CN', { hour12: false }) : '-'}
                            </td>
                            <td className="py-2 px-3 text-blue-100">
                              {part.endTime ? new Date(part.endTime).toLocaleString('zh-CN', { hour12: false }) : '-'}
                            </td>
                            <td className="py-2 px-3 text-white">{part.operator || '-'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 生产信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-100 text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  生产计划
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">生产令号</span>
                    <span className="text-white font-medium">
                      {selectedWorkOrder.batchComponentSerialNumber || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">批次令号</span>
                    <span className="text-white font-medium">
                      {selectedWorkOrder.batchOrderNo || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">投入日期</span>
                    <span className="text-white font-medium">
                      {selectedWorkOrder.inputDate || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">计划数量</span>
                    <span className="text-white font-medium">
                      {selectedWorkOrder.planQuantity || '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-100 text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  生产进度
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">完成数量</span>
                    <span className="text-white font-medium">
                      {selectedWorkOrder.completedQuantity || 0} / {selectedWorkOrder.planQuantity || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">合格数量</span>
                    <span className="text-white font-medium">
                      {selectedWorkOrder.qualifiedQuantity || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">不良数量</span>
                    <span className="text-white font-medium">
                      {selectedWorkOrder.defectiveQuantity || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">合格率</span>
                    <span className="text-white font-medium">
                      {selectedWorkOrder.qualifiedQuantity && selectedWorkOrder.completedQuantity
                        ? `${((selectedWorkOrder.qualifiedQuantity / selectedWorkOrder.completedQuantity) * 100).toFixed(1)}%`
                        : '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}

export function ProductionPage() {
  // 设置查询过滤条件：productionStatus=3 (首件检验通过) 或 productionStatus=4 (生产中)
  const tableFilters = {
    "$or": [
      { "productionStatus": "3" },
      { "productionStatus": "4" }
    ]
  }

  const [queryFields, setQueryFields] = React.useState<string[] | undefined>(undefined)

  React.useEffect(() => {
    createAPI({ resource: `core/t/schema/${encodeURIComponent(tableId)}` }).fetch('')
      .then((res: any) => {
        const schema = res?.json?.schema || res?.json || res?.schema || res
        if (schema?.properties) {
          setQueryFields(Object.keys(schema.properties))
        }
      })
  }, [])

  return (
    <div className="space-y-0">
      <ViewModel tableId={tableId} initQuery={true} queryFields={queryFields} tableFilters={tableFilters}>
        <ProductionContent />
      </ViewModel>
    </div>
  )
}

export default ProductionPage
