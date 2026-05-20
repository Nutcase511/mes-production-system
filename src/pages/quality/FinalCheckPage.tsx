/**
 * 终检页面
 * 对正式生产完成的产品进行终检（逐个零件检验）
 * 可更新工序记录的数量统计
 */

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList, useModelSave, useModelGetItems, useModel } from '@airiot/client'
import { toast } from 'sonner'
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  Save,
  ClipboardCheck,
  Edit,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingDots } from '@/components/ui/loading-dots'
import { PartStatus, FIELD_KEYS, PartStatusLabel } from '@/types/part-production'

const tableId = '生产跟单'

// 设置查询过滤条件：productionStatus=5 (生产完成)
const tableFilters = {
  'productionStatus': '5'
}

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

const FinalCheckContent: React.FC = () => {
  const { items, loading: modelLoading } = useModelList({ initQuery: false })
  const { saveItem } = useModelSave()
  const { getItems } = useModelGetItems()
  const { model } = useModel()
  const { user } = useAuth()

  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>('')
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)
  const [selectedPartId, setSelectedPartId] = useState<string>('')
  const [showSplitDialog, setShowSplitDialog] = useState(false)

  // 工序统计编辑相关状态
  const [showProcessStatsDialog, setShowProcessStatsDialog] = useState(false)
  const [editingProcessStats, setEditingProcessStats] = useState<any[]>([])
  const [savingProcessStats, setSavingProcessStats] = useState(false)

  const hasInitialized = useRef(false)

  // 初始化查询：从 schema 获取所有字段
  useEffect(() => {
    if (model?.properties && !hasInitialized.current) {
      hasInitialized.current = true
      const fields = Object.keys(model.properties)



      getItems({
        fields: fields,
        wheres: { filter: tableFilters }
      })
    }
  }, [model])

  // 表单状态
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0])
  const [isQualified, setIsQualified] = useState<boolean | null>(null)
  const [failReason, setFailReason] = useState('')

  const workOrders = items as any[]
  const loading = modelLoading

  // 获取当前工单的所有零件记录
  const allPartRecords = Array.isArray(selectedWorkOrder?.[FIELD_KEYS.PART_RECORDS])
    ? selectedWorkOrder[FIELD_KEYS.PART_RECORDS]
    : []

  // 待检验和已检验的零件列表（包括首件）
  // 首件：首检合格（FIRST_CHECK_PASS）显示为已合格
  // 正式件：生产完成、待终检、已终检（合格/不合格）
  const partRecords = allPartRecords.filter(
    (part: any) => {
      const isFirstPart = part.partID?.endsWith('-01')
      if (isFirstPart) {
        // 首件：首检合格，显示在列表中但标记为已合格
        return part.partStatus === PartStatus.FIRST_CHECK_PASS
      }
      return part.partStatus === PartStatus.PRODUCTION_COMPLETED ||
        part.partStatus === PartStatus.WAITING_FINAL_CHECK ||
        part.partStatus === PartStatus.FINAL_CHECK_PASS ||
        part.partStatus === PartStatus.FINAL_CHECK_FAIL
    }
  )

  // 统计数量
  const completedPartsCount = countCompletedParts(allPartRecords) // 已完成生产（包括首件）

  // 已检验零件数量（包括首件）
  // 首件：首检合格（FIRST_CHECK_PASS）算作已检验
  // 正式件：终检合格或不合格（FINAL_CHECK_PASS 或 FINAL_CHECK_FAIL）
  const inspectedPartsCount = allPartRecords.filter(
    (part: any) => {
      const isFirstPart = part.partID?.endsWith('-01')
      if (isFirstPart) {
        return part.partStatus === PartStatus.FIRST_CHECK_PASS
      }
      return part.partStatus === PartStatus.FINAL_CHECK_PASS ||
        part.partStatus === PartStatus.FINAL_CHECK_FAIL
    }
  ).length

  const qualifiedPartsCount = allPartRecords.filter(
    (part: any) => {
      const isFirstPart = part.partID?.endsWith('-01')
      if (isFirstPart) {
        // 首件：首检合格算作合格
        return part.partStatus === PartStatus.FIRST_CHECK_PASS
      }
      return part.partStatus === PartStatus.FINAL_CHECK_PASS
    }
  ).length // 合格数量

  const failedPartsCount = allPartRecords.filter(
    (part: any) => part.partStatus === PartStatus.FINAL_CHECK_FAIL
  ).length // 不合格数量

  // 当前选中的零件
  const selectedPart = partRecords.find(
    (part: any) => part.partID === selectedPartId
  )

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
        setSelectedPartId('') // 重置选中的零件
      }
    }
  }, [selectedWorkOrderId, workOrders])

  // 当工单切换时，检查是否所有零件都已检验完成且有不合格零件，自动显示拆单对话框
  useEffect(() => {
    if (!selectedWorkOrder) return

    const partRecords = Array.isArray(selectedWorkOrder[FIELD_KEYS.PART_RECORDS])
      ? selectedWorkOrder[FIELD_KEYS.PART_RECORDS]
      : []

    if (partRecords.length === 0) return

    // 检查是否所有零件都已检验完成
    // 首件：首检合格（FIRST_CHECK_PASS）视为已检验
    // 正式件：终检合格或不合格（FINAL_CHECK_PASS 或 FINAL_CHECK_FAIL）
    const allChecked = partRecords.every((part: any) => {
      const isFirstPart = part.partID?.endsWith('-01')
      if (isFirstPart) {
        // 首件：首检合格即可
        return part.partStatus === PartStatus.FIRST_CHECK_PASS
      }
      // 正式件：需要终检合格或不合格
      return part.partStatus === PartStatus.FINAL_CHECK_PASS ||
        part.partStatus === PartStatus.FINAL_CHECK_FAIL
    })

    if (allChecked) {
      // 检查是否有不合格零件
      const hasFailed = partRecords.some(
        (part: any) => part.partStatus === PartStatus.FINAL_CHECK_FAIL
      )

      if (hasFailed) {
        // 显示拆单对话框
        setShowSplitDialog(true)
      }
    }
  }, [selectedWorkOrder])

  // 当选择零件改变时，重置表单状态
  useEffect(() => {
    if (!selectedPart) {
      setIsQualified(null)
      setFailReason('')
      setInspectionDate(new Date().toISOString().split('T')[0])
      return
    }

    // 如果零件已检验，显示检验结果
    const partStatus = selectedPart.partStatus
    if (partStatus === PartStatus.FINAL_CHECK_PASS) {
      setIsQualified(true)
      setFailReason(selectedPart.failReason || '')
      setInspectionDate(selectedPart.inspectorTime
        ? new Date(selectedPart.inspectorTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0])
    } else if (partStatus === PartStatus.FINAL_CHECK_FAIL) {
      setIsQualified(false)
      setFailReason(selectedPart.failReason || '')
      setInspectionDate(selectedPart.inspectorTime
        ? new Date(selectedPart.inspectorTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0])
    } else {
      // 未检验的零件，重置表单
      setIsQualified(null)
      setFailReason('')
      setInspectionDate(new Date().toISOString().split('T')[0])
    }
  }, [selectedPartId, selectedPart])

  // 提交单个零件的终检结果
  const handleSubmitPart = async () => {
    if (!selectedPart) {
      toast.error('请选择要检验的零件')
      return
    }

    if (isQualified === null) {
      toast.error('请选择合格或不合格')
      return
    }

    if (!isQualified && !failReason.trim()) {
      toast.error('不合格时请填写不合格原因')
      return
    }

    try {
      const inspectorName = user?.name || user?.username || ''

      // 获取现有零件记录
      const existingParts = Array.isArray(selectedWorkOrder[FIELD_KEYS.PART_RECORDS])
        ? [...selectedWorkOrder[FIELD_KEYS.PART_RECORDS]]
        : []

      // 更新选中的零件记录
      const partIndex = existingParts.findIndex(
        (part: any) => part.partID === selectedPartId
      )

      if (partIndex === -1) {
        toast.error('未找到零件记录')
        return
      }

      // 更新选中的零件记录（子表字段不需要前缀）
      existingParts[partIndex] = {
        ...existingParts[partIndex],
        partStatus: isQualified ? PartStatus.FINAL_CHECK_PASS : PartStatus.FINAL_CHECK_FAIL,
        inspector: inspectorName,
        inspectorTime: new Date().toISOString(),
        ...(isQualified ? {} : { failReason: failReason }),
      }

      // 往 processRecord 追加终检记录
      const existingProcessRecord = Array.isArray(selectedWorkOrder.processRecord)
        ? [...selectedWorkOrder.processRecord]
        : []

      existingProcessRecord.push({
        processNo: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/[/:]/g, '').replace(/\s/g, '').replace(/,/g, ''),
        processName: `终检零件 ${selectedPart.partId}: ${isQualified ? '合格' : '不合格'}`,
        operator: inspectorName,
      })

      // 保存更新
      await saveItem({
        ...selectedWorkOrder,
        [FIELD_KEYS.PART_RECORDS]: existingParts,
        processRecord: existingProcessRecord,
      })
      await getItems({
        wheres: { filter: tableFilters }
      })

      toast.success(`零件 ${selectedPart.partId} 终检${isQualified ? '合格' : '不合格'}`)

      // 重置表单并清除选中状态，让用户看到列表中的颜色反馈
      setIsQualified(null)
      setFailReason('')
      setSelectedPartId('')

      // 检查是否所有零件都已检验完成
      // 首件：首检合格（FIRST_CHECK_PASS）视为已检验
      // 正式件：终检合格或不合格（FINAL_CHECK_PASS 或 FINAL_CHECK_FAIL）
      const allChecked = existingParts.every((part: any) => {
        const isFirstPart = part.partID?.endsWith('-01')
        if (isFirstPart) {
          // 首件：首检合格即可
          return part.partStatus === PartStatus.FIRST_CHECK_PASS
        }
        // 正式件：需要终检合格或不合格
        return part.partStatus === PartStatus.FINAL_CHECK_PASS ||
          part.partStatus === PartStatus.FINAL_CHECK_FAIL
      })

      if (allChecked) {
        // 检查是否有不合格零件
        const hasFailed = existingParts.some(
          (part: any) => part.partStatus === PartStatus.FINAL_CHECK_FAIL
        )

        if (hasFailed) {
          // 显示拆单对话框
          setShowSplitDialog(true)
        } else {
          // 全部合格，更新状态为可入库
          await saveItem({
            ...selectedWorkOrder,
            [FIELD_KEYS.PART_RECORDS]: existingParts,
            'productionStatus': '6', // 生产完成，可入库
          })
          await getItems({
            wheres: { filter: tableFilters }
          })
          toast.success('所有零件终检合格，可以办理入库')
        }
      }
    } catch (error) {
      toast.error('提交失败，请稍后重试')
    }
  }

  // 拆单逻辑
  const handleSplitOrder = async () => {
    try {
      const existingParts = Array.isArray(selectedWorkOrder[FIELD_KEYS.PART_RECORDS])
        ? [...selectedWorkOrder[FIELD_KEYS.PART_RECORDS]]
        : []

      // 找出不合格的零件
      const failedParts = existingParts.filter(
        (part: any) => part.partStatus === PartStatus.FINAL_CHECK_FAIL
      )

      if (failedParts.length === 0) {
        toast.error('没有需要拆分的零件')
        return
      }

      // 获取被拆单子的跟单号
      const parentWorkOrderNo = selectedWorkOrder.woId || selectedWorkOrder['serial-number'] || selectedWorkOrder.id

      // 创建新跟单数据（子表字段不需要前缀）
      const newOrderData = {
        ...selectedWorkOrder,
        id: undefined, // 自动生成新ID
        name: `${selectedWorkOrder.name || selectedWorkOrder.woId || ''}（拆）`, // 名称加"（拆）"后缀
        parentWorkOrderID: parentWorkOrderNo, // 记录父级跟单号
        'productionStatus': '1', // 待试产
        'preparationStatus': '1', // 待准备检查
        'plannedInputQuantity': failedParts.length, // 计划投入数量设置为拆出来的零件个数
        [FIELD_KEYS.PART_RECORDS]: failedParts.map((part: any) => ({
          partID: part.partID, // ✅ 显式保留零件ID
          partStatus: PartStatus.PENDING, // 重置为待生产
          startTime: undefined,
          endTime: undefined,
          equipment: part.equipment, // 保留设备信息
          operator: undefined,
          inspector: undefined,
          inspectorTime: undefined,
          failReason: part.failReason, // 保留不合格原因
          inspectPhotos: part.inspectPhotos, // 保留检验照片
        })),
      }

      // 保存新跟单
      const savedNewOrder = await saveItem(newOrderData)

      // 更新当前跟单：移除不合格零件，保留合格零件和首件
      const qualifiedParts = existingParts.filter((part: any) => {
        const isFirstPart = part.partID?.endsWith('-01')
        if (isFirstPart) {
          // 首件：首检合格，保留在当前跟单中
          return part.partStatus === PartStatus.FIRST_CHECK_PASS
        }
        // 正式件：终检合格，保留在当前跟单中
        return part.partStatus === PartStatus.FINAL_CHECK_PASS
      })

      await saveItem({
        ...selectedWorkOrder,
        [FIELD_KEYS.PART_RECORDS]: qualifiedParts,
        'productionStatus': '6', // 生产完成，可入库
      })

      await getItems({
        wheres: { filter: tableFilters }
      })
      setShowSplitDialog(false)
      toast.success(`拆单成功，已创建新跟单包含 ${failedParts.length} 个不合格零件`)

      // 跳转到新跟单的试生产页面
      // TODO: 导航逻辑需要根据路由配置调整
    } catch (error) {
      toast.error('拆单失败，请稍后重试')
    }
  }

  // 打开工序统计编辑对话框
  const openProcessStatsDialog = () => {
    if (!selectedWorkOrder?.processRecord || !Array.isArray(selectedWorkOrder.processRecord)) {
      toast.error('该跟单暂无工序记录')
      return
    }
    // 复制一份用于编辑
    setEditingProcessStats([...selectedWorkOrder.processRecord])
    setShowProcessStatsDialog(true)
  }

  // 保存工序统计
  const handleSaveProcessStats = async () => {
    setSavingProcessStats(true)
    try {
      // 获取完整的 processRecord，只更新数量字段
      const updatedProcessRecord = selectedWorkOrder.processRecord.map((record: any, index: number) => ({
        ...record,
        qualifiedQuantity: editingProcessStats[index]?.qualifiedQuantity || 0,
        outOfToleranceQuantity: editingProcessStats[index]?.outOfToleranceQuantity || 0,
        scrapQuantity: editingProcessStats[index]?.scrapQuantity || 0,
      }))

      await saveItem({
        ...selectedWorkOrder,
        processRecord: updatedProcessRecord,
      })
      await getItems({
        wheres: { filter: tableFilters }
      })
      toast.success('工序统计更新成功')
      setShowProcessStatsDialog(false)
    } catch (error) {
      toast.error('保存失败，请稍后重试')
    } finally {
      setSavingProcessStats(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">终检</h2>
          <p className="text-sm text-blue-200 mt-1">对正式生产完成的零件进行终检（逐个检验）</p>
        </div>
        {selectedWorkOrder?.processRecord && Array.isArray(selectedWorkOrder.processRecord) && selectedWorkOrder.processRecord.length > 0 && (
          <Button
            variant="outline"
            onClick={openProcessStatsDialog}
            className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20"
          >
            <Edit className="w-4 h-4 mr-2" />
            更新工序统计
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 左侧：待终检工单列表 */}
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-100 text-base">待终检工单 ({workOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {loading ? (
              <LoadingDots />
            ) : workOrders.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>所有工单已完成终检</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {workOrders.slice(0, 10).map((wo, index) => {
                  const woId = wo.id || wo.woId || wo['serial-number']
                  const displayWoNo = wo.woId || wo['serial-number'] || '无编号'
                  const displayProduct = wo.productName || wo.product_code || '未知产品'

                  return (
                    <div
                      key={woId || index}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${selectedWorkOrderId === woId
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-blue-400/30 bg-blue-500/5 hover:bg-blue-500/10'
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

        {/* 右侧：检验区域 */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedWorkOrder ? (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardContent className="p-12 text-center">
                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-blue-300/50" />
                <p className="text-blue-200">请从左侧选择待终检的工单</p>
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
                      <p className="text-xs text-blue-300">待检验零件</p>
                      <p className="text-sm font-semibold text-cyan-300">{partRecords.length} 个</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300">已检验零件</p>
                      <p className="text-sm font-semibold text-green-400">
                        {inspectedPartsCount} 个
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300">合格/不合格</p>
                      <p className="text-sm font-semibold">
                        <span className="text-green-400">{qualifiedPartsCount}</span>
                        <span className="text-blue-300 mx-1">/</span>
                        <span className="text-red-400">{failedPartsCount}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 零件列表 */}
              <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-100 text-base">零件列表（包含已检验）</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {partRecords.length === 0 ? (
                    <div className="text-center py-8 text-blue-200">
                      <p>所有零件已检验完成</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {partRecords.map((part: any, index: number) => {
                        const partId = part.partID
                        const isSelected = selectedPartId === partId
                        const partStatus = part.partStatus
                        const isFirstPart = partId?.endsWith('-01')

                        // 判断零件状态
                        const isFirstPartQualified = isFirstPart && partStatus === PartStatus.FIRST_CHECK_PASS
                        const isQualified = partStatus === PartStatus.FINAL_CHECK_PASS
                        const isFailed = partStatus === PartStatus.FINAL_CHECK_FAIL
                        const isInspected = isFirstPartQualified || isQualified || isFailed
                        const canInspect = !isFirstPartQualified && !isQualified && !isFailed

                        // 根据状态确定背景色
                        let bgClass = 'border-blue-400/30 bg-blue-500/5 hover:bg-blue-500/10'
                        if (isSelected) {
                          bgClass = 'border-blue-500 bg-blue-500/20'
                        } else if (isFirstPartQualified || isQualified) {
                          bgClass = 'border-green-500/50 bg-green-500/10'
                        } else if (isFailed) {
                          bgClass = 'border-red-500/50 bg-red-500/10'
                        }

                        return (
                          <div
                            key={partId || index}
                            className={`p-3 border rounded-lg transition-colors ${bgClass} ${canInspect ? 'cursor-pointer' : 'cursor-default'}`}
                            onClick={() => canInspect && setSelectedPartId(partId)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-cyan-300">{partId}</div>
                              {isInspected && (
                                <Badge variant={isFirstPartQualified || isQualified ? "default" : "destructive"} className="text-xs">
                                  {isFirstPartQualified ? '首件合格' : (isQualified ? '合格' : '不合格')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 检验表单 */}
              {selectedPart && (
                <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                  style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-blue-100 text-base flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        零件信息: {selectedPart.partID}
                        {selectedPart.partStatus === PartStatus.FINAL_CHECK_PASS && (
                          <Badge className="bg-green-500">合格</Badge>
                        )}
                        {selectedPart.partStatus === PartStatus.FINAL_CHECK_FAIL && (
                          <Badge variant="destructive">不合格</Badge>
                        )}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* 首件提示 */}
                    {selectedPart.partID?.endsWith('-01') && selectedPart.partStatus === PartStatus.FIRST_CHECK_PASS ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                        <p className="text-lg font-semibold text-green-400 mb-2">首件已通过首检</p>
                        <p className="text-sm text-blue-200">首件在首检环节已确认为合格，无需进行终检</p>
                      </div>
                    ) : (
                      <>
                        {/* 零件信息 */}
                        <div className="grid grid-cols-4 gap-4 p-3 bg-blue-500/5 rounded-lg">
                          <div>
                            <p className="text-xs text-blue-300">零件ID</p>
                            <p className="text-sm font-semibold text-cyan-300">{selectedPart.partID}</p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-300">开始时间</p>
                            <p className="text-sm text-white">
                              {selectedPart.startTime
                                ? new Date(selectedPart.startTime).toLocaleString('zh-CN', { hour12: false })
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-300">结束时间</p>
                            <p className="text-sm text-white">
                              {selectedPart.endTime
                                ? new Date(selectedPart.endTime).toLocaleString('zh-CN', { hour12: false })
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-300">操作人</p>
                            <p className="text-sm text-white">{selectedPart[FIELD_KEYS.OPERATOR] || '-'}</p>
                          </div>
                        </div>

                        {/* 检验员和日期 */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-blue-200 text-sm flex items-center gap-2">
                              <User className="w-4 h-4" />
                              检验员
                            </Label>
                            <input
                              type="text"
                              value={selectedPart.inspector || user?.name || user?.username || ''}
                              readOnly
                              className="w-full px-3 py-2 text-sm bg-blue-500/10 border border-blue-400/30 rounded-lg text-white opacity-70 cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-blue-200 text-sm flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              检验日期
                            </Label>
                            <input
                              type="date"
                              value={inspectionDate}
                              onChange={(e) => setInspectionDate(e.target.value)}
                              disabled={selectedPart.partStatus === PartStatus.FINAL_CHECK_PASS ||
                                selectedPart.partStatus === PartStatus.FINAL_CHECK_FAIL}
                              className={`w-full px-3 py-2 text-sm bg-blue-500/10 border border-blue-400/30 rounded-lg text-white
                            ${(selectedPart.partStatus === PartStatus.FINAL_CHECK_PASS ||
                                  selectedPart.partStatus === PartStatus.FINAL_CHECK_FAIL)
                                  ? 'opacity-70 cursor-not-allowed' : ''}`}
                            />
                          </div>
                        </div>

                        {/* 合格/不合格选择 */}
                        <div className="space-y-2">
                          <Label className="text-blue-200 text-sm">检验结果</Label>
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant={isQualified === true ? 'default' : 'outline'}
                              onClick={() => setIsQualified(true)}
                              disabled={selectedPart.partStatus === PartStatus.FINAL_CHECK_PASS ||
                                selectedPart.partStatus === PartStatus.FINAL_CHECK_FAIL}
                              className={`flex-1 ${isQualified === true ? 'bg-green-500 hover:bg-green-600' : ''}
                            ${(selectedPart.partStatus === PartStatus.FINAL_CHECK_PASS ||
                                  selectedPart.partStatus === PartStatus.FINAL_CHECK_FAIL)
                                  ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              合格
                            </Button>
                            <Button
                              type="button"
                              variant={isQualified === false ? 'destructive' : 'outline'}
                              onClick={() => setIsQualified(false)}
                              disabled={selectedPart.partStatus === PartStatus.FINAL_CHECK_PASS ||
                                selectedPart.partStatus === PartStatus.FINAL_CHECK_FAIL}
                              className={`flex-1
                            ${(selectedPart.partStatus === PartStatus.FINAL_CHECK_PASS ||
                                  selectedPart.partStatus === PartStatus.FINAL_CHECK_FAIL)
                                  ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              不合格
                            </Button>
                          </div>
                        </div>

                        {/* 不合格原因 */}
                        {isQualified === false && (
                          <div className="space-y-2">
                            <Label className="text-blue-200 text-sm">不合格原因</Label>
                            <textarea
                              value={failReason}
                              onChange={(e) => setFailReason(e.target.value)}
                              placeholder="请输入不合格原因"
                              rows={3}
                              disabled={selectedPart.partStatus === PartStatus.FINAL_CHECK_FAIL}
                              className={`w-full px-3 py-2 text-sm bg-blue-500/10 border border-blue-400/30 rounded-lg text-white placeholder:text-blue-300/50
                            ${selectedPart.partStatus === PartStatus.FINAL_CHECK_FAIL
                                  ? 'opacity-70 cursor-not-allowed' : ''}`}
                            />
                          </div>
                        )}

                        {/* 提交按钮 */}
                        <div className="flex items-center justify-between pt-4 border-t border-blue-400/30">
                          <Button
                            onClick={() => {
                              setSelectedPartId('')
                              setIsQualified(null)
                              setFailReason('')
                            }}
                            variant="outline"
                          >
                            取消
                          </Button>
                          {(selectedPart.partStatus === PartStatus.FINAL_CHECK_PASS ||
                            selectedPart.partStatus === PartStatus.FINAL_CHECK_FAIL) ? (
                            <Button
                              disabled
                              className="opacity-70 cursor-not-allowed"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              已检验
                            </Button>
                          ) : (
                            <Button
                              onClick={handleSubmitPart}
                              disabled={isQualified === null}
                              className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              提交检验结果
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* 拆单确认对话框 */}
      <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>拆单确认</DialogTitle>
            <DialogDescription className="text-blue-200">
              检测到有不合格零件，是否拆分为新跟单？
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-3 bg-blue-500/10 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{qualifiedPartsCount}</p>
              <p className="text-sm text-blue-200">合格零件</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{failedPartsCount}</p>
              <p className="text-sm text-blue-200">不合格零件</p>
            </div>
          </div>
          <p className="text-xs text-blue-300">
            拆单后，合格零件将继续入库流程，不合格零件将创建新跟单重新生产
          </p>
          <DialogFooter>
            <Button variant="outline" className="flex-1">取消</Button>
            <Button
              onClick={handleSplitOrder}
              className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
            >
              确认拆单
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 工序统计编辑对话框 */}
      <Dialog open={showProcessStatsDialog} onOpenChange={setShowProcessStatsDialog}>
        <DialogContent className="!w-[700px] !max-w-none max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">更新工序统计</DialogTitle>
            <DialogDescription className="text-blue-200">
              终检后更新各工序的合格、超差、报废数量
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-3">
              {editingProcessStats.map((record, index) => (
                <Card key={record.processNo || index} className="bg-blue-500/5 border border-blue-400/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="text-cyan-300 border-cyan-500/30">
                        {record.processNo}
                      </Badge>
                      <span className="font-medium text-white">{record.processName}</span>
                      <span className="text-sm text-blue-300">{record.equipmentType}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-blue-300">合格数量</Label>
                        <Input
                          type="number"
                          min={0}
                          value={record.qualifiedQuantity || 0}
                          onChange={(e) => {
                            const updated = [...editingProcessStats]
                            updated[index] = {
                              ...updated[index],
                              qualifiedQuantity: parseInt(e.target.value) || 0,
                            }
                            setEditingProcessStats(updated)
                          }}
                          className="bg-blue-500/10 border-blue-400/30 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-blue-300">超差数量</Label>
                        <Input
                          type="number"
                          min={0}
                          value={record.outOfToleranceQuantity || 0}
                          onChange={(e) => {
                            const updated = [...editingProcessStats]
                            updated[index] = {
                              ...updated[index],
                              outOfToleranceQuantity: parseInt(e.target.value) || 0,
                            }
                            setEditingProcessStats(updated)
                          }}
                          className="bg-blue-500/10 border-blue-400/30 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-blue-300">报废数量</Label>
                        <Input
                          type="number"
                          min={0}
                          value={record.scrapQuantity || 0}
                          onChange={(e) => {
                            const updated = [...editingProcessStats]
                            updated[index] = {
                              ...updated[index],
                              scrapQuantity: parseInt(e.target.value) || 0,
                            }
                            setEditingProcessStats(updated)
                          }}
                          className="bg-blue-500/10 border-blue-400/30 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProcessStatsDialog(false)}
              className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20"
            >
              取消
            </Button>
            <Button
              onClick={handleSaveProcessStats}
              disabled={savingProcessStats}
              className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
            >
              {savingProcessStats ? (
                <LoadingDots text="保存中..." />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存统计
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function FinalCheckPage() {
  return (
    <ViewModel tableId={tableId} initQuery={false}>
      <FinalCheckContent />
    </ViewModel>
  )
}

export default FinalCheckPage
