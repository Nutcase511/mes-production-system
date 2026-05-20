/**
 * 生产准备状态检查页面
 * 整合设备点检、刀具准备、物料准备、程序确认功能
 */

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList, useModel, useModelSave, useModelGetItems, createAPI } from '@airiot/client'
import { getToken } from '@/lib/auth-token'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { LoadingDots } from '@/components/ui/loading-dots'
import {
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Package,
  FileText,
  User,
  AlertCircle,
  ClipboardCheck,
  BookOpen,
  ShoppingCart,
  Barcode
} from 'lucide-react'
import OperationGuidePreview from '@/components/OperationGuidePreview'
import { useAuth } from '@/contexts/AuthContext'

interface EquipmentCheck {
  status: 'pending' | 'ok' | 'ng'
  checker: string
  checkTime: Date
  remark: string
}

interface ToolPreparation {
  toolCode: string
  toolName: string
  batchNo: string
  prepared: boolean
  preparer: string
  prepareTime: Date
}

interface MaterialPreparation {
  materialCode: string
  materialName: string
  batchNo: string
  supplier: string
  prepared: boolean
  preparer: string
  prepareTime: Date
}

// 领料单相关接口
interface MaterialItem {
  materialCode: string
  materialName: string
  specification: string
  requiredQty: number
  requisitionedQty: number
  stockQty: number
  unit: string
  batches: MaterialBatch[]
}

interface MaterialBatch {
  batchNo: string
  quantity: number
  supplier: string
  heatNumber?: string
  requisitioned: boolean
  requisitionTime?: Date
  requisitioner?: string
}

interface RequisitionRecord {
  id: string
  workOrderId: string
  workOrderNo: string
  materials: MaterialItem[]
  status: 'pending' | 'partial' | 'completed'
  requisitioner: string
  requisitionTime: Date
  remark: string
}

interface ProgramConfirmation {
  status: 'pending' | 'confirmed' | 'mismatch'
  programVersion: string
  cappVersion: string
  confirmer: string
  confirmTime: Date
}

interface PreparationChecklistRecord {
  id?: string
  workOrderId: string
  workOrderNo: string
  equipmentCheck: EquipmentCheck
  toolPreparation: ToolPreparation[]
  materialPreparation: MaterialPreparation[]
  programConfirmation: ProgramConfirmation
  overallStatus: 'pending' | 'passed' | 'failed'
  confirmedBy?: string
  confirmationTime?: Date
}

const tableId = '生产跟单'

const PreparationChecklistContent: React.FC = () => {
  const { user } = useAuth()
  const { items, loading: modelLoading } = useModelList()
  const { model } = useModel()
  const { saveItem } = useModelSave()
  const { getItems } = useModelGetItems()

  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>('')
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)
  const hasInitialized = useRef(false)

  // 各项检查状态
  const [equipmentCheck, setEquipmentCheck] = useState<EquipmentCheck>({
    status: 'pending',
    checker: '',
    checkTime: new Date(),
    remark: ''
  })

  const [toolPreparation, setToolPreparation] = useState<ToolPreparation[]>([])
  const [materialPreparation, setMaterialPreparation] = useState<MaterialPreparation[]>([])

  // 领料单状态
  const [requisitionRecord, setRequisitionRecord] = useState<RequisitionRecord | null>(null)
  const [showRequisitionDialog, setShowRequisitionDialog] = useState(false)
  const [scanningMaterial, setScanningMaterial] = useState<string>('')

  const [programConfirmation, setProgramConfirmation] = useState<ProgramConfirmation>({
    status: 'pending',
    programVersion: '',
    cappVersion: '',
    confirmer: '',
    confirmTime: new Date()
  })

  const workOrders = items as any[]
  const loading = modelLoading

  // 初始化选择第一个工单
  useEffect(() => {
    if (!hasInitialized.current && workOrders.length > 0 && !selectedWorkOrderId) {
      const firstOrder = workOrders[0]
      const woId = firstOrder.woId || firstOrder['serial-number'] || firstOrder.id
      setSelectedWorkOrderId(woId)
      setSelectedWorkOrder(firstOrder)
      initializePreparationData(firstOrder)
      hasInitialized.current = true
    }
  }, [workOrders, selectedWorkOrderId])

  // 初始化准备数据
  const initializeRequisitionData = (workOrder: any) => {
    // 根据工单的物料需求生成领料单
    const materials: MaterialItem[] = [
      {
        materialCode: 'M001',
        materialName: '铝棒 φ50',
        specification: 'φ50mm × 2000mm',
        requiredQty: workOrder.planQuantity || 100,
        requisitionedQty: 0,
        stockQty: 500,
        unit: '件',
        batches: [
          {
            batchNo: 'B20250115001',
            quantity: 200,
            supplier: 'XX铝材厂',
            heatNumber: 'H20250115001',
            requisitioned: false
          },
          {
            batchNo: 'B20250115002',
            quantity: 300,
            supplier: 'XX铝材厂',
            heatNumber: 'H20250115002',
            requisitioned: false
          }
        ]
      },
      {
        materialCode: 'M002',
        materialName: '不锈钢螺母 M8',
        specification: 'M8 × 1.25',
        requiredQty: (workOrder.planQuantity || 100) * 4,
        requisitionedQty: 0,
        stockQty: 1000,
        unit: '个',
        batches: [
          {
            batchNo: 'B20250114001',
            quantity: 500,
            supplier: 'YY标准件厂',
            requisitioned: false
          },
          {
            batchNo: 'B20250114002',
            quantity: 500,
            supplier: 'YY标准件厂',
            requisitioned: false
          }
        ]
      }
    ]

    setRequisitionRecord({
      id: `REQ-${new Date().getTime()}`,
      workOrderId: workOrder.woId || workOrder['serial-number'] || workOrder.id || '',
      // 尝试从 relatedProductionNoticeNo 或 pid 中获取通知单号
      workOrderNo: workOrder.relatedProductionNoticeNo?.notificationNumber ||
        workOrder.pid?.notificationNumber ||
        workOrder.pid?.productionOrderNo ||
        workOrder.woId ||
        '',
      materials,
      status: 'pending',
      requisitioner: '',
      requisitionTime: new Date(),
      remark: ''
    })
  }

  // 初始化准备数据
  const initializePreparationData = (workOrder: any) => {
    // 初始化刀具准备列表
    const requiredTools = [
      { toolCode: 'T001', toolName: '外圆刀', batchNo: '' },
      { toolCode: 'T002', toolName: '内圆刀', batchNo: '' },
      { toolCode: 'T003', toolName: '螺纹刀', batchNo: '' },
      { toolCode: 'T004', toolName: '切断刀', batchNo: '' },
      { toolCode: 'T005', toolName: '倒角刀', batchNo: '' }
    ]

    setToolPreparation(requiredTools.map(tool => ({
      ...tool,
      prepared: false,
      preparer: '',
      prepareTime: new Date()
    })))

    // 初始化物料准备列表
    const requiredMaterials = [
      {
        materialCode: 'M001',
        materialName: '铝棒 φ50',
        batchNo: '',
        supplier: ''
      }
    ]

    setMaterialPreparation(requiredMaterials.map(mat => ({
      ...mat,
      prepared: false,
      preparer: '',
      prepareTime: new Date()
    })))

    // 初始化领料单
    initializeRequisitionData(workOrder)

    // 重置其他状态
    setEquipmentCheck({
      status: 'pending',
      checker: '',
      checkTime: new Date(),
      remark: ''
    })

    setProgramConfirmation({
      status: 'pending',
      programVersion: '',
      cappVersion: '',
      confirmer: '',
      confirmTime: new Date()
    })
  }

  // 当选择的工单ID改变时
  useEffect(() => {
    if (selectedWorkOrderId && workOrders.length > 0) {
      const selected = workOrders.find((wo) => {
        const woId = wo.woId || wo['serial-number'] || wo.id
        return woId === selectedWorkOrderId
      })
      if (selected) {
        setSelectedWorkOrder(selected)
        initializePreparationData(selected)
      }
    }
  }, [selectedWorkOrderId, workOrders])

  // 计算整体状态
  const overallStatus = calculateOverallStatus()

  function calculateOverallStatus(): 'pending' | 'passed' | 'failed' {
    if (equipmentCheck.status === 'ng') return 'failed'
    if (equipmentCheck.status === 'pending') return 'pending'
    if (toolPreparation.some(t => !t.prepared)) return 'pending'
    if (materialPreparation.some(m => !m.prepared)) return 'pending'
    if (requisitionRecord?.status === 'pending') return 'pending'
    if (programConfirmation.status === 'pending') return 'pending'
    if (programConfirmation.status === 'mismatch') return 'failed'
    return 'passed'
  }

  // 处理设备点检
  const handleEquipmentCheck = (status: 'ok' | 'ng') => {
    setEquipmentCheck({
      status,
      checker: '当前用户',
      checkTime: new Date(),
      remark: equipmentCheck.remark
    })
  }

  // 处理刀具扫码（扫码枪扫入刀具编号，回车后匹配）
  const handleToolKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const input = e.currentTarget.value.trim()
      if (!input) return
      const tool = toolPreparation[idx]
      if (input !== tool.toolCode) {
        toast.error(`刀具编码不匹配，期望: ${tool.toolCode}`)
        e.currentTarget.value = ''
        return
      }
      setToolPreparation(prev => prev.map((t, i) =>
        i === idx ? { ...t, prepared: true, preparer: '当前用户', prepareTime: new Date() } : t
      ))
      e.currentTarget.value = ''
      toast.success(`${tool.toolName} 准备完成`)
    }
  }

  // 处理物料扫码（扫码枪扫入物料编码，回车后匹配）
  const handleMaterialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const input = e.currentTarget.value.trim()
      if (!input) return
      const mat = materialPreparation[idx]

      // 支持格式：物料编码 或 物料编码-批次号
      const parts = input.split('-')
      const materialCode = parts[0]
      const batchNo = parts[1] || ''

      if (materialCode !== mat.materialCode) {
        toast.error(`物料编码不匹配，期望: ${mat.materialCode}`)
        e.currentTarget.value = ''
        return
      }

      // 如果有批次号，直接执行领料
      if (batchNo && requisitionRecord) {
        handleMaterialRequisition(materialCode, batchNo, 1)
      }

      setMaterialPreparation(prev => prev.map((m, i) =>
        i === idx ? { ...m, prepared: true, preparer: '当前用户', prepareTime: new Date() } : m
      ))
      e.currentTarget.value = ''
      toast.success(`${mat.materialName} 准备完成`)
    }
  }

  // 处理程序版本确认
  const handleProgramConfirmation = async () => {
    const cappVersion = 'V2.3' // 模拟数据

    const isMatch = programConfirmation.programVersion === cappVersion

    setProgramConfirmation({
      status: isMatch ? 'confirmed' : 'mismatch',
      programVersion: programConfirmation.programVersion,
      cappVersion,
      confirmer: '当前用户',
      confirmTime: new Date()
    })

    if (isMatch) {
      toast.success('程序版本确认通过')
    } else {
      toast.error('程序版本不匹配')
    }
  }

  // 处理扫码领料
  const handleMaterialRequisition = (materialCode: string, batchNo: string, qty: number = 1) => {
    if (!requisitionRecord) return

    const material = requisitionRecord.materials.find(m => m.materialCode === materialCode)
    if (!material) {
      toast.error('物料编码不存在')
      return
    }

    // 检查是否超额领料
    if (material.requisitionedQty + qty > material.requiredQty) {
      toast.error(`领料数量超出需求，还需 ${material.requiredQty - material.requisitionedQty} ${material.unit}`)
      return
    }

    const batch = material.batches.find(b => b.batchNo === batchNo)
    if (!batch) {
      toast.error('批次号不存在')
      return
    }

    if (batch.quantity < qty) {
      toast.error(`批次库存不足，当前库存: ${batch.quantity} ${material.unit}`)
      return
    }

    // 更新领料记录
    setRequisitionRecord(prev => {
      if (!prev) return prev

      return {
        ...prev,
        materials: prev.materials.map(m => {
          if (m.materialCode === materialCode) {
            return {
              ...m,
              requisitionedQty: m.requisitionedQty + qty,
              batches: m.batches.map(b => {
                if (b.batchNo === batchNo) {
                  return {
                    ...b,
                    quantity: b.quantity - qty,
                    requisitioned: true,
                    requisitionTime: new Date(),
                    requisitioner: user?.name || user?.username || '当前用户'
                  }
                }
                return b
              })
            }
          }
          return m
        }),
        status: prev.materials.every(m => m.requisitionedQty >= m.requiredQty) ? 'completed' :
          prev.materials.some(m => m.requisitionedQty > 0) ? 'partial' : 'pending',
        requisitioner: user?.name || user?.username || '当前用户',
        requisitionTime: new Date()
      }
    })

    toast.success(`领料成功: ${material.materialName} +${qty} ${material.unit}`)
  }

  // 处理扫码输入
  const handleRequisitionScan = (input: string) => {
    const parts = input.split('-')
    if (parts.length < 2) {
      toast.error('扫码格式错误，应为: 物料编码-批次号')
      return
    }

    const materialCode = parts[0]
    const batchNo = parts[1]

    handleMaterialRequisition(materialCode, batchNo, 1)
  }

  // 提交领料单
  const handleSubmitRequisition = async () => {
    if (!requisitionRecord) return

    if (requisitionRecord.status === 'pending') {
      toast.error('请至少完成一项物料领料')
      return
    }

    try {
      // 保存领料记录到工单
      await saveItem({
        ...selectedWorkOrder,
        materialStatus: requisitionRecord.status === 'completed' ? '2' : '1', // 1=部分领料，2=已完成领料
        requisitionRecord: requisitionRecord
      })

      toast.success('领料单已保存')

      // 更新物料准备状态
      setMaterialPreparation(prev => prev.map(mat => ({
        ...mat,
        prepared: true,
        preparer: user?.name || user?.username || '当前用户',
        prepareTime: new Date()
      })))

    } catch (error) {
      toast.error('保存领料单失败，请稍后重试')
    }
  }

  // 提交准备检查记录
  const handleSubmit = async () => {
    if (overallStatus !== 'passed') {
      toast.error('请完成所有检查项后再提交')
      return
    }

    try {
      // 构建工序记录：读取已有的 processRecord 数组，追加当前工序信息
      const existingProcessRecord = Array.isArray(selectedWorkOrder.processRecord)
        ? [...selectedWorkOrder.processRecord]
        : []

      const newProcessEntry = {
        processNo: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/[/:]/g, '').replace(/\s/g, '').replace(/,/g, ''),
        processName: '准备状态检查',
        operator: user?.name || user?.username || '',
      }

      existingProcessRecord.push(newProcessEntry)

      await saveItem({
        ...selectedWorkOrder,
        'preparationStatus': '2',
        processRecord: existingProcessRecord,
      })

      await getItems()

      const record: PreparationChecklistRecord = {
        workOrderId: selectedWorkOrderId,
        workOrderNo: selectedWorkOrder?.woId || selectedWorkOrder?.['serial-number'],
        equipmentCheck,
        toolPreparation,
        materialPreparation,
        programConfirmation,
        overallStatus: 'passed'
      }

      toast.success('准备检查已通过，可以进行试生产')

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
      toast.error('保存失败，请稍后重试')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">生产准备状态检查</h2>
          <p className="text-sm text-blue-200 mt-1">设备点检 → 领料操作 → 物料准备 → 刀具准备 → 程序确认</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 左侧：待检查工单列表 */}
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-100 text-base">待检查工单 ({workOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {loading ? (
              <LoadingDots />
            ) : workOrders.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>所有工单已完成准备检查</p>
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

        {/* 右侧：检查区域 */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedWorkOrder ? (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardContent className="p-12 text-center">
                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-blue-300/50" />
                <p className="text-blue-200">请从左侧选择待检查的工单</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 工单信息 */}
              {selectedWorkOrder && (
                <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                  style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                  <CardContent className="p-4 pt-4">
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-blue-300">跟单编号</p>
                        <p className="text-sm font-semibold text-white">
                          {selectedWorkOrder.pid?.productionOrderNo || ''}
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
              )}

              {/* 整体状态 */}
              <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <CardContent className="p-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">整体状态</h3>
                      <p className="text-xs text-blue-200 mt-1">
                        完成所有检查后才能进行试生产
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        overallStatus === 'passed' ? 'default' :
                          overallStatus === 'failed' ? 'destructive' : 'secondary'
                      } className="text-xs">
                        {overallStatus === 'passed' ? '已通过' :
                          overallStatus === 'failed' ? '未通过' : '待检查'}
                      </Badge>
                      <Button
                        onClick={handleSubmit}
                        disabled={overallStatus !== 'passed'}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        size="sm"
                      >
                        <ClipboardCheck className="w-3 h-3 mr-1" />
                        确认准备完成
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 1. 设备点检 */}
              <VerificationCard
                icon={<Settings className="w-4 h-4" />}
                title="1. 设备点检"
                status={equipmentCheck.status}
              >
                <div className="space-y-2">
                  <p className="text-xs text-blue-200">确认设备已完成点检且合格</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={equipmentCheck.status === 'ok' ? 'default' : 'outline'}
                      onClick={() => handleEquipmentCheck('ok')}
                      className={equipmentCheck.status === 'ok' ? 'bg-green-500' : ''}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      点检合格
                    </Button>
                    <Button
                      size="sm"
                      variant={equipmentCheck.status === 'ng' ? 'destructive' : 'outline'}
                      onClick={() => handleEquipmentCheck('ng')}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      点检不合格
                    </Button>
                  </div>
                  {equipmentCheck.status !== 'pending' && (
                    <p className="text-xs text-blue-200">
                      检查人: {equipmentCheck.checker} | 时间: {new Date(equipmentCheck.checkTime).toLocaleString()}
                    </p>
                  )}
                </div>
              </VerificationCard>

              {/* 2. 领料操作 */}
              <VerificationCard
                icon={<ShoppingCart className="w-4 h-4" />}
                title="2. 领料操作"
                status={requisitionRecord?.status === 'completed' ? 'ok' : requisitionRecord?.status === 'partial' ? 'pending' : 'pending'}
              >
                <div className="space-y-3">
                  <p className="text-xs text-blue-200">扫描物料条码或手动领料，格式：物料编码-批次号</p>

                  {/* 扫码输入区 */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={scanningMaterial}
                      onChange={(e) => setScanningMaterial(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = scanningMaterial.trim()
                          if (input) {
                            handleRequisitionScan(input)
                            setScanningMaterial('')
                          }
                        }
                      }}
                      placeholder="扫码或输入: 物料编码-批次号 (例: M001-B20250115001)"
                      className="flex-1 px-3 py-2 text-sm bg-blue-500/10 border border-blue-400/30 rounded-lg text-white placeholder:text-blue-300/50 focus:outline-none focus:border-cyan-400"
                    />
                    <Button
                      onClick={() => {
                        if (scanningMaterial.trim()) {
                          handleRequisitionScan(scanningMaterial.trim())
                          setScanningMaterial('')
                        }
                      }}
                      size="sm"
                      className="bg-gradient-to-r from-blue-400 to-cyan-400"
                    >
                      <Barcode className="w-3 h-3 mr-1" />
                      确认
                    </Button>
                  </div>

                  {/* 领料明细列表 */}
                  {requisitionRecord && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-200">领料明细</span>
                        <Badge variant={
                          requisitionRecord.status === 'completed' ? 'default' :
                            requisitionRecord.status === 'partial' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {requisitionRecord.status === 'completed' ? '已完成' :
                            requisitionRecord.status === 'partial' ? '部分领料' : '待领料'}
                        </Badge>
                      </div>

                      {requisitionRecord.materials.map((material, idx) => (
                        <div key={idx} className="border border-blue-400/20 rounded-lg p-2 bg-blue-500/5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm">{material.materialName}</p>
                              <p className="text-xs text-blue-200">{material.materialCode} | {material.specification}</p>
                            </div>
                            <div className="text-right ml-2">
                              <p className="text-xs text-blue-200">
                                需求: <span className="text-white font-medium">{material.requiredQty}</span> {material.unit}
                              </p>
                              <p className="text-xs text-blue-200">
                                已领: <span className={`font-medium ${material.requisitionedQty >= material.requiredQty ? 'text-green-400' :
                                    material.requisitionedQty > 0 ? 'text-yellow-400' : 'text-red-400'
                                  }`}>{material.requisitionedQty}</span> {material.unit}
                              </p>
                            </div>
                          </div>

                          {/* 批次列表 */}
                          <div className="space-y-1">
                            {material.batches.map((batch, batchIdx) => (
                              <div
                                key={batchIdx}
                                className={`flex items-center justify-between p-1.5 rounded text-xs ${batch.requisitioned
                                    ? 'bg-green-500/10 border border-green-500/20'
                                    : 'bg-blue-500/5 border border-blue-400/10'
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  {batch.requisitioned ? (
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <div className="w-3 h-3 rounded-full border border-blue-400/30" />
                                  )}
                                  <span className="text-blue-200">
                                    批次: <span className="text-white">{batch.batchNo}</span>
                                  </span>
                                  {batch.heatNumber && (
                                    <span className="text-blue-200">
                                      炉号: <span className="text-white">{batch.heatNumber}</span>
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className={`font-medium ${batch.requisitioned ? 'text-green-400' : 'text-blue-200'
                                    }`}>
                                    {batch.requisitioned ? '已领' : batch.quantity}
                                  </span>
                                  <span className="text-blue-300 ml-1">{material.unit}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 提交按钮 */}
                  <Button
                    onClick={handleSubmitRequisition}
                    disabled={!requisitionRecord || requisitionRecord.status === 'pending'}
                    className="w-full"
                    size="sm"
                  >
                    <Package className="w-3 h-3 mr-1" />
                    保存领料记录
                  </Button>
                </div>
              </VerificationCard>

              {/* 3. 物料准备 */}
              <VerificationCard
                icon={<Package className="w-4 h-4" />}
                title="3. 物料准备"
                status={materialPreparation.every(m => m.prepared) ? 'ok' : 'pending'}
              >
                <div className="space-y-2">
                  <p className="text-xs text-blue-200">使用扫码枪扫描物料条码进行确认（可自动触发领料）</p>
                  <div className="grid grid-cols-1 gap-2">
                    {materialPreparation.map((mat, idx) => (
                      <div
                        key={idx}
                        className={`p-2 border rounded-lg flex items-center justify-between ${mat.prepared
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-blue-400/30 bg-blue-500/5'
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white text-sm">{mat.materialName}</p>
                          <p className="text-xs text-blue-200">{mat.materialCode}</p>
                        </div>
                        {mat.prepared ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <input
                            type="text"
                            autoFocus
                            onKeyDown={(e) => handleMaterialKeyDown(e, idx)}
                            placeholder="扫码输入"
                            className="w-28 px-2 py-1 text-sm bg-blue-500/10 border border-blue-400/30 rounded-lg text-white placeholder:text-blue-300/50 focus:outline-none focus:border-cyan-400"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </VerificationCard>

              {/* 4. 刀具准备 */}
              <VerificationCard
                icon={<Settings className="w-4 h-4" />}
                title="4. 刀具准备"
                status={toolPreparation.every(t => t.prepared) ? 'ok' : 'pending'}
              >
                <div className="space-y-2">
                  <p className="text-xs text-blue-200">使用扫码枪扫描刀具条码进行确认</p>
                  <div className="grid grid-cols-2 gap-2">
                    {toolPreparation.map((tool, idx) => (
                      <div
                        key={idx}
                        className={`p-2 border rounded-lg flex items-center justify-between ${tool.prepared
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-blue-400/30 bg-blue-500/5'
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white text-sm">{tool.toolName}</p>
                          <p className="text-xs text-blue-200">{tool.toolCode}</p>
                        </div>
                        {tool.prepared ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <input
                            type="text"
                            autoFocus={idx === 0}
                            onKeyDown={(e) => handleToolKeyDown(e, idx)}
                            placeholder="扫码输入"
                            className="w-28 px-2 py-1 text-sm bg-blue-500/10 border border-blue-400/30 rounded-lg text-white placeholder:text-blue-300/50 focus:outline-none focus:border-cyan-400"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </VerificationCard>

              {/* 5. 程序确认 */}
              <VerificationCard
                icon={<FileText className="w-4 h-4" />}
                title="4. 程序确认"
                status={programConfirmation.status === 'confirmed' ? 'ok' : programConfirmation.status === 'mismatch' ? 'ng' : 'pending'}
              >
                <div className="space-y-2">
                  <p className="text-xs text-blue-200">确认加工程序版本与CAPP系统匹配</p>
                  <div>
                    <Label className="text-xs">程序版本</Label>
                    <input
                      type="text"
                      value={programConfirmation.programVersion}
                      onChange={(e) => setProgramConfirmation({
                        ...programConfirmation,
                        programVersion: e.target.value
                      })}
                      placeholder="输入程序版本号（如：V2.3）"
                      className="w-full px-3 py-1.5 mt-1 text-sm bg-blue-500/10 border border-blue-400/30 rounded-lg text-white placeholder:text-blue-300/50"
                    />
                  </div>
                  <Button
                    onClick={handleProgramConfirmation}
                    disabled={!programConfirmation.programVersion}
                    className="w-full"
                    size="sm"
                  >
                    确认版本
                  </Button>
                  {programConfirmation.status !== 'pending' && (
                    <div className={`p-2 rounded-lg ${programConfirmation.status === 'confirmed'
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                      }`}>
                      <p className="font-medium text-white text-sm">
                        {programConfirmation.status === 'confirmed' ? '✓ 版本匹配' : '✗ 版本不匹配'}
                      </p>
                      <p className="text-xs text-blue-200 mt-1">
                        程序版本: {programConfirmation.programVersion}<br />
                        CAPP版本: {programConfirmation.cappVersion}
                      </p>
                    </div>
                  )}
                </div>
              </VerificationCard>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// 验证卡片组件
function VerificationCard({
  icon,
  title,
  status,
  children
}: {
  icon: React.ReactNode
  title: string
  status: 'pending' | 'ok' | 'ng'
  children: React.ReactNode
}) {
  return (
    <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
      style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
      <CardHeader className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-blue-100 flex items-center gap-2 text-base">
            {icon}
            {title}
          </CardTitle>
          {status === 'ok' && (
            <Badge className="bg-green-500 text-xs">✓ 已完成</Badge>
          )}
          {status === 'ng' && (
            <Badge variant="destructive" className="text-xs">✗ 未通过</Badge>
          )}
          {status === 'pending' && (
            <Badge variant="secondary" className="text-xs">待检查</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  )
}

export function PreparationChecklistPage() {
  // 设置查询过滤条件：待试产 且 准备状态为待检查
  const tableFilters = {
    "$and": [
      { "productionStatus": "1" },
      { "preparationStatus": "1" }
    ]
  }

  const [schema, setSchema] = useState<any>(null)
  useEffect(() => {
    createAPI({ resource: `core/t/schema/${encodeURIComponent(tableId)}` }).fetch('')
      .then((res: any) => {
        if (res?.schema) setSchema(res.schema)
        else if (res?.properties) setSchema(res)
        else setSchema(res)
      })
      .catch(console.error)
  }, [])
  const queryFields = schema?.properties ? Object.keys(schema.properties) : undefined

  return (
    <div className="space-y-0">
      <ViewModel tableId={tableId} queryFields={queryFields} tableFilters={tableFilters}>
        <PreparationChecklistContent />
      </ViewModel>
    </div>
  )
}

export default PreparationChecklistPage
