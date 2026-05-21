/**
 * 工序试生产控制页面
 * 准备状态检查通过后，进行试生产并记录结果
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList, useModelSave, useModelGetItems, useModel , createAPI } from '@airiot/client'
import { toastApi } from '@/components/ui/toast'
import { LoadingDots } from '@/components/ui/loading-dots'
import {
  CheckCircle,
  Play,
  Square,
  BookOpen,
  ClipboardCheck
} from 'lucide-react'
import OperationGuidePreview from '@/components/OperationGuidePreview'
import { useAuth } from '@/contexts/AuthContext'
import { PartStatus, generatePartId, FIELD_KEYS } from '@/types/part-production'

const tableId = '生产跟单'

const TrialProductionControlContent: React.FC = () => {
  const { items, loading: modelLoading } = useModelList({ initQuery: false })
  const { saveItem } = useModelSave()
  const { getItems } = useModelGetItems()
  const { model } = useModel()
  const { user } = useAuth()


  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>('')
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)
  const hasInitialized = useRef(false)

  const workOrders = items as any[]
  const loading = modelLoading

  const [trialStarted, setTrialStarted] = useState(false)

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

  // 切换工单时重置试产状态
  useEffect(() => {
    setTrialStarted(false)
  }, [selectedWorkOrderId])

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

  // 开始试产
  const handleStart = async () => {
    try {
      // 判断是否是拆单出来的跟单
      const isSplitOrder = !!selectedWorkOrder?.[FIELD_KEYS.PARENT_ORDER_ID]

      // 获取现有零件记录，确保为数组
      const existingParts = Array.isArray(selectedWorkOrder[FIELD_KEYS.PART_RECORDS])
        ? [...selectedWorkOrder[FIELD_KEYS.PART_RECORDS]]
        : selectedWorkOrder[FIELD_KEYS.PART_RECORDS] === null ? [] : []

      // 生成工单号
      const workOrderNo = selectedWorkOrder.woId || selectedWorkOrder['serial-number'] || selectedWorkOrder.id || 'UNKNOWN'

      let updatedParts: any[]
      let processName: string

      if (isSplitOrder && existingParts.length > 0) {
        // 拆单模式：使用零件列表中第一个零件（状态为PENDING）
        const firstPart = existingParts[0]
        firstPart.partStatus = PartStatus.TRIAL_PRODUCING
        firstPart.startTime = new Date().toISOString()
        firstPart.equipment = selectedWorkOrder.equipment || ''
        firstPart.operator = user?.name || user?.username || ''

        updatedParts = existingParts
        processName = `开始返工试产零件 ${firstPart.partID}`
      } else {
        // 常规模式：创建新的首件零件记录
        const firstPart = {
          partID: generatePartId(workOrderNo, 1),
          partStatus: PartStatus.TRIAL_PRODUCING,
          startTime: new Date().toISOString(),
          equipment: selectedWorkOrder.equipment || '',
          operator: user?.name || user?.username || '',
        }

        updatedParts = [...existingParts, firstPart]
        processName = '开始试生产'
      }

      // 往 processRecord 追加试产记录
      const existingProcessRecord = Array.isArray(selectedWorkOrder.processRecord)
        ? [...selectedWorkOrder.processRecord]
        : []

      existingProcessRecord.push({
        processNo: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/[/:]/g, '').replace(/\s/g, '').replace(/,/g, ''),
        processName: processName,
        operator: user?.name || user?.username || '',
      })

      await saveItem({
        ...selectedWorkOrder,
        [FIELD_KEYS.PART_RECORDS]: updatedParts,
        processRecord: existingProcessRecord,
        'productionStatus': '4', // 生产中
      })
      setTrialStarted(true)
      toastApi.success(isSplitOrder ? '返工试产已开始' : '试产已开始')
    } catch (error) {
      toastApi.error('保存失败，请稍后重试')
    }
  }

  // 试产结束，进入首件检验
  const handleEnd = async () => {
    try {
      // 判断是否是拆单出来的跟单
      const isSplitOrder = !!selectedWorkOrder?.[FIELD_KEYS.PARENT_ORDER_ID]

      // 获取现有零件记录
      const existingParts = Array.isArray(selectedWorkOrder[FIELD_KEYS.PART_RECORDS])
        ? [...selectedWorkOrder[FIELD_KEYS.PART_RECORDS]]
        : []

      if (existingParts.length === 0) {
        toastApi.error('没有零件记录')
        return
      }

      // 找到当前试产中的零件
      const producingPartIndex = existingParts.findIndex(
        (part: any) => part.partStatus === PartStatus.TRIAL_PRODUCING
      )

      if (producingPartIndex === -1) {
        toastApi.error('未找到试产中的零件')
        return
      }

      // 更新零件状态为试产完成
      existingParts[producingPartIndex] = {
        ...existingParts[producingPartIndex],
        partStatus: PartStatus.TRIAL_COMPLETED,
        endTime: new Date().toISOString(),
      }

      // 往 processRecord 追加试产记录
      const existingProcessRecord = Array.isArray(selectedWorkOrder.processRecord)
        ? [...selectedWorkOrder.processRecord]
        : []

      const partId = existingParts[producingPartIndex].partID
      existingProcessRecord.push({
        processNo: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/[/:]/g, '').replace(/\s/g, '').replace(/,/g, ''),
        processName: isSplitOrder ? `结束返工试产零件 ${partId}` : '结束试生产',
        operator: user?.name || user?.username || '',
      })

      await saveItem({
        ...selectedWorkOrder,
        [FIELD_KEYS.PART_RECORDS]: existingParts,
        'productionStatus': '2', // 待首检
        processRecord: existingProcessRecord,
      })
      await getItems()
      setTrialStarted(false)
      toastApi.success(isSplitOrder ? '返工试产完成，请进行首检' : '试产结束，进入首件检验')

      const nextIndex = workOrders.findIndex(wo => {
        const woId = wo.woId || wo['serial-number'] || wo.id
        return woId === selectedWorkOrderId
      }) + 1

      if (nextIndex < workOrders.length) {
        const nextOrder = workOrders[nextIndex]
        const nextWoId = nextOrder.woId || nextOrder['serial-number'] || nextOrder.id
        setSelectedWorkOrderId(nextWoId)
      }
    } catch (error) {
      toastApi.error('保存失败，请稍后重试')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">工序试生产控制</h2>
          <p className="text-sm text-blue-200 mt-1">准备检查通过后进行试生产</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 左侧：待试生产工单列表 */}
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-100 text-base">待试生产工单 ({workOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {loading ? (
              <LoadingDots />
            ) : workOrders.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>所有工单已完成试生产</p>
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

        {/* 右侧：操作区域 */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedWorkOrder ? (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardContent className="p-12 text-center">
                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-blue-300/50" />
                <p className="text-blue-200">请从左侧选择待试生产的工单</p>
              </CardContent>
            </Card>
          ) : (
          <>
          {/* 工单信息 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
            style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-4 mb-3">
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

          {/* 试产操作 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
            style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">试产操作</h3>
                  <p className="text-xs text-blue-200 mt-1">
                    准备检查已通过，执行试生产
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleStart}
                    disabled={trialStarted}
                    className="bg-gradient-to-r from-blue-400 to-cyan-400"
                    size="sm"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    开始试生产
                  </Button>
                  <Button
                    onClick={handleEnd}
                    disabled={!trialStarted}
                    className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500"
                    size="sm"
                  >
                    <Square className="w-3 h-3 mr-1" />
                    试产结束
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </>
          )}
        </div>
      </div>
    </div>
  )
}

export function TrialProductionControlPage() {
  // 设置查询过滤条件：preparationStatus=2 且 productionStatus=1
  const tableFilters = {
    "$and": [
      { "preparationStatus": "2" },
      { "productionStatus": "1" }
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
    <ViewModel tableId={tableId} initQuery={true} queryFields={queryFields} tableFilters={tableFilters}>
      <TrialProductionControlContent />
    </ViewModel>
  )
}
