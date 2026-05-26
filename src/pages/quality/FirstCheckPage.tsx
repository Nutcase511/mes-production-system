/**
 * 首件检验页面
 * 对试生产通过的产品进行首件检验
 */

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList, useModel, useModelSave, useModelGetItems , createAPI } from '@airiot/client'
import { useModelListWithOptions } from '@/hooks/useModelListSafe'
import { toast } from 'sonner'
import { LoadingDots } from '@/components/ui/loading-dots'
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  Play,
  Save,
  ClipboardCheck
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PartStatus, FIELD_KEYS } from '@/types/part-production'

const tableId = '生产跟单'

interface InspectionItem {
  name: string
  standard: string
  result: string
  remark: string
  qualified: boolean
}

interface FirstCheckRecord {
  workOrderId: string
  workOrderNo: string
  productCode: string
  productName: string
  processName: string
  inspector: string
  inspectionDate: string
  items: InspectionItem[]
  overallStatus: 'pending' | 'qualified' | 'unqualified'
  approvalBy?: string
  approvalTime?: string
}

const FirstCheckContent: React.FC = () => {
  const { items, loading: modelLoading } = useModelListWithOptions({ initQuery: false })
  const { model } = useModel()
  const { saveItem } = useModelSave()
  const { getItems } = useModelGetItems()
  const { user } = useAuth()

  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>('')
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)
  const hasInitialized = useRef(false)
  const isLoading = useRef(false)
  const hasSelectedFirstOrder = useRef(false)

  // 表单状态
  const [inspector, setInspector] = useState('')
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0])
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    { name: '外径尺寸', standard: 'φ50±0.02', result: '', remark: '', qualified: false },
    { name: '内径尺寸', standard: 'φ30±0.02', result: '', remark: '', qualified: false },
    { name: '长度尺寸', standard: '100±0.05', result: '', remark: '', qualified: false },
    { name: '表面粗糙度', standard: 'Ra1.6', result: '', remark: '', qualified: false },
    { name: '同轴度', standard: '0.02', result: '', remark: '', qualified: false },
  ])

  const workOrders = items as any[]
  const loading = modelLoading

  // 初始化查询
  const initializedRef = useRef(false)
  useEffect(() => {
    if (model?.properties && !initializedRef.current) {
      initializedRef.current = true
      isLoading.current = false // ViewModel 会自动加载数据
    }
  }, [])

  // 初始化选择第一个工单
  useEffect(() => {
    if (!hasSelectedFirstOrder.current && workOrders.length > 0 && !selectedWorkOrderId) {
      const firstOrder = workOrders[0]
      const woId = firstOrder.id || firstOrder.batchComponentSerialNumber
      setSelectedWorkOrderId(woId)
      setSelectedWorkOrder(firstOrder)
      hasSelectedFirstOrder.current = true
    }
  }, [workOrders, selectedWorkOrderId])

  // 计算整体状态
  const overallStatus = useMemo(() => {
    if (inspectionItems.some(item => !item.qualified && item.result !== '')) {
      return 'unqualified'
    }
    if (inspectionItems.every(item => item.qualified)) {
      return 'qualified'
    }
    return 'pending'
  }, [inspectionItems])

  // 处理检验项更新
  const handleItemChange = (index: number, field: keyof InspectionItem, value: string) => {
    const newItems = [...inspectionItems]
    const targetItem = newItems[index] as any
    targetItem[field] = value

    // 判断是否合格
    if (field === 'result') {
      const item = newItems[index]
      // 简单判断：如果结果在标准范围内则合格
      // 实际应该根据标准解析和比较
      item.qualified = value !== ''
    }

    setInspectionItems(newItems)
  }

  // 切换合格状态
  const toggleQualified = (index: number) => {
    const newItems = [...inspectionItems]
    newItems[index].qualified = !newItems[index].qualified
    setInspectionItems(newItems)
  }

  // 提交首检记录
  const handleSubmit = async () => {
    if (!inspectionDate) {
      toast.error('请选择检验日期')
      return
    }

    if (overallStatus === 'pending') {
      toast.error('请完成所有检验项目后再提交')
      return
    }

    try {
      const isQualified = overallStatus === 'qualified'
      const inspectorName = user?.name || user?.username || ''

      // 获取现有零件记录
      const existingParts = Array.isArray(selectedWorkOrder[FIELD_KEYS.PART_RECORDS])
        ? [...selectedWorkOrder[FIELD_KEYS.PART_RECORDS]]
        : []

      if (existingParts.length === 0) {
        toast.error('未找到首件零件记录')
        return
      }

      // 更新首件零件记录（子表字段不需要前缀）
      const firstPart = existingParts[0]
      firstPart.partStatus = isQualified ? PartStatus.FIRST_CHECK_PASS : PartStatus.FIRST_CHECK_FAIL
      firstPart.inspector = inspectorName
      firstPart.inspectorTime = new Date().toISOString()

      // 如果不合格，记录不合格原因
      if (!isQualified) {
        const unqualifiedItems = inspectionItems.filter(item => !item.qualified)
        firstPart.failReason = unqualifiedItems.map(item => `${item.name}: ${item.remark || '无备注'}`).join('; ')
      }

      // 往 processRecord 追加首检记录
      const existingProcessRecord = Array.isArray(selectedWorkOrder.processRecord)
        ? [...selectedWorkOrder.processRecord]
        : []

      existingProcessRecord.push({
        processNo: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/[/:]/g, '').replace(/\s/g, '').replace(/,/g, ''),
        processName: '首件检验',
        operator: inspectorName,
      })

      // 保存首检记录和状态到生产跟单表
      await saveItem({
        ...selectedWorkOrder,
        [FIELD_KEYS.PART_RECORDS]: existingParts,
        'productionStatus': isQualified ? '3' : '2', // 3=试产通过, 2=待首检（可重新试产）
        processRecord: existingProcessRecord,
      })

      // 刷新列表
      await getItems()

      const record: FirstCheckRecord = {
        workOrderId: selectedWorkOrderId,
        workOrderNo: selectedWorkOrder?.batchComponentSerialNumber || '',
        productCode: selectedWorkOrder?.productCode || '',
        productName: selectedWorkOrder?.productName || '',
        processName: selectedWorkOrder?.processName || '',
        inspector: inspectorName,
        inspectionDate,
        items: inspectionItems,
        overallStatus: overallStatus as 'qualified' | 'unqualified'
      }

      toast.success(isQualified ? '首检通过，可以开始正式生产' : '首检不通过，请整改后重新试产')

      // 选择下一个工单
      const nextIndex = workOrders.findIndex(wo => wo.id === selectedWorkOrderId) + 1
      if (nextIndex < workOrders.length) {
        const nextOrder = workOrders[nextIndex]
        setSelectedWorkOrderId(nextOrder.id)
        setSelectedWorkOrder(nextOrder)

        // 重置表单
        setInspectionDate(new Date().toISOString().split('T')[0])
        setInspectionItems([
          { name: '外径尺寸', standard: 'φ50±0.02', result: '', remark: '', qualified: false },
          { name: '内径尺寸', standard: 'φ30±0.02', result: '', remark: '', qualified: false },
          { name: '长度尺寸', standard: '100±0.05', result: '', remark: '', qualified: false },
          { name: '表面粗糙度', standard: 'Ra1.6', result: '', remark: '', qualified: false },
          { name: '同轴度', standard: '0.02', result: '', remark: '', qualified: false },
        ])
      }
    } catch (error) {
      toast.error('提交失败，请稍后重试')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">首件检验</h2>
          <p className="text-sm text-blue-200 mt-1">对试生产通过的产品进行首件检验</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 左侧：待首检工单列表 */}
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-100 text-base">待首检工单 ({workOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {loading ? (
              <LoadingDots />
            ) : workOrders.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>所有工单已完成首检</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {workOrders.slice(0, 10).map((wo, index) => {
                  const woId = wo.id || wo.batchComponentSerialNumber
                  const displayWoNo = wo.batchComponentSerialNumber || wo.batchOrderNo || '无编号'
                  const displayProduct = wo.productName || wo.product_code || '未知产品'

                  return (
                    <div
                      key={woId || index}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${selectedWorkOrderId === woId
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-blue-400/30 bg-blue-500/5 hover:bg-blue-500/10'
                        }`}
                      onClick={() => {
                        setSelectedWorkOrderId(woId)
                        setSelectedWorkOrder(wo)
                      }}
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

        {/* 右侧：检验表单 */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedWorkOrder ? (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardContent className="p-12 text-center">
                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-blue-300/50" />
                <p className="text-blue-200">请从左侧选择待首检的工单</p>
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
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-blue-300">生产令号</p>
                      <p className="text-sm font-semibold text-white">
                        {selectedWorkOrder.batchComponentSerialNumber || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300">批次令号</p>
                      <p className="text-sm font-semibold text-white">
                        {selectedWorkOrder.batchOrderNo || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300">产品名称</p>
                      <p className="text-sm font-semibold text-white truncate">
                        {selectedWorkOrder.productName || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300">投入日期</p>
                      <p className="text-sm font-semibold text-white">
                        {selectedWorkOrder.inputDate || '-'}
                      </p>
                    </div>
                  </div>

                  {/* 首件零件信息 */}
                  {(() => {
                    const parts = Array.isArray(selectedWorkOrder[FIELD_KEYS.PART_RECORDS])
                      ? selectedWorkOrder[FIELD_KEYS.PART_RECORDS]
                      : []
                    const firstPart = parts[0]

                    if (!firstPart) return null

                    return (
                      <div className="pt-3 border-t border-blue-400/20">
                        <p className="text-xs text-blue-300 mb-2">首件零件信息</p>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-blue-300">零件ID</p>
                            <p className="text-sm font-semibold text-cyan-300">{firstPart.partID || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-300">开始时间</p>
                            <p className="text-sm text-white">{firstPart.startTime ? new Date(firstPart.startTime).toLocaleString('zh-CN', { hour12: false }) : '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-300">结束时间</p>
                            <p className="text-sm text-white">{firstPart.endTime ? new Date(firstPart.endTime).toLocaleString('zh-CN', { hour12: false }) : '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-300">操作人</p>
                            <p className="text-sm text-white">{firstPart.operator || '-'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* 检验表单 */}
              <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-100 text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      检验项目
                    </CardTitle>
                    <Badge variant={
                      overallStatus === 'qualified' ? 'default' :
                        overallStatus === 'unqualified' ? 'destructive' : 'secondary'
                    } className="text-xs">
                      {overallStatus === 'qualified' ? '合格' :
                        overallStatus === 'unqualified' ? '不合格' : '待检验'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* 检验员和日期 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-blue-200 text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        检验员
                      </Label>
                      <input
                        type="text"
                        value={user?.name || user?.username || ''}
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
                        className="w-full px-3 py-2 text-sm bg-blue-500/10 border border-blue-400/30 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  {/* 检验项目列表 */}
                  <div className="space-y-3">
                    {inspectionItems.map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg ${item.qualified
                          ? 'border-green-500/50 bg-green-500/10'
                          : item.result !== ''
                            ? 'border-red-500/50 bg-red-500/10'
                            : 'border-blue-400/30 bg-blue-500/5'
                          }`}
                      >
                        <div className="grid grid-cols-12 gap-3 items-center">
                          {/* 检验项目名称 */}
                          <div className="col-span-2">
                            <Label className="text-blue-200 text-xs">检验项目</Label>
                            <p className="text-sm font-medium text-white">{item.name}</p>
                          </div>

                          {/* 检验标准 */}
                          <div className="col-span-2">
                            <Label className="text-blue-200 text-xs">检验标准</Label>
                            <p className="text-sm text-blue-100">{item.standard}</p>
                          </div>

                          {/* 检验结果 */}
                          <div className="col-span-3">
                            <Label className="text-blue-200 text-xs">检验结果</Label>
                            <input
                              type="text"
                              value={item.result}
                              onChange={(e) => handleItemChange(index, 'result', e.target.value)}
                              placeholder="请输入检验结果"
                              className="w-full px-2 py-1 text-sm bg-blue-500/10 border border-blue-400/30 rounded text-white placeholder:text-blue-300/50"
                            />
                          </div>

                          {/* 备注 */}
                          <div className="col-span-3">
                            <Label className="text-blue-200 text-xs">备注</Label>
                            <input
                              type="text"
                              value={item.remark}
                              onChange={(e) => handleItemChange(index, 'remark', e.target.value)}
                              placeholder="备注信息"
                              className="w-full px-2 py-1 text-sm bg-blue-500/10 border border-blue-400/30 rounded text-white placeholder:text-blue-300/50"
                            />
                          </div>

                          {/* 合格按钮 */}
                          <div className="col-span-2">
                            <Button
                              size="sm"
                              variant={item.qualified ? 'default' : 'outline'}
                              onClick={() => toggleQualified(index)}
                              className={`w-full ${item.qualified ? 'bg-green-500 hover:bg-green-600' : ''}`}
                            >
                              {item.qualified ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  合格
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  不合格
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 提交按钮 */}
                  <div className="flex items-center justify-between pt-4 border-t border-blue-400/30">
                    <div className="text-sm text-blue-200">
                      已完成 {inspectionItems.filter(i => i.qualified).length} / {inspectionItems.length} 项
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={overallStatus === 'pending'}
                      className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      提交首检记录
                    </Button>
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

export function FirstCheckPage() {
  // 设置查询过滤条件：productionStatus=2 (试产通过)
  const tableFilters = {
    'productionStatus': '2'
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
    <ViewModel
      tableId={tableId}
      initQuery={true}
      queryFields={queryFields}
      tableFilters={tableFilters}
    >
      <FirstCheckContent />
    </ViewModel>
  )
}

export default FirstCheckPage
