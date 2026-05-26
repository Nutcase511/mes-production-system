/**
 * 调度规程页面
 * 左侧：调度路线列表
 * 右侧：选中路线的工序规程详情（检验规则）+ 下发操作 + 设置跟单工序
 */

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList, useModelSave, useModelGetItems, useModelGet } from '@airiot/client'
import { useModelListWithOptions, useModelSaveWithTable, useModelGetItemsWithTable } from '@/hooks/useModelListSafe'
import { toast } from 'sonner'
import { LoadingDots } from '@/components/ui/loading-dots'
import {
  CheckCircle,
  Settings,
  Clock,
  Package,
  ClipboardCheck,
  Send,
  AlertCircle,
  List,
  Save,
} from 'lucide-react'

const tableId = '工艺路线表'
const workOrderTableId = '生产跟单'

interface ProcessItem {
  _key?: string
  processNo: string
  processName: string
  equipmentType: string
  cycleTime: string
  description?: string
  inspectionRule?: {
    requireFirstCheck?: boolean
    requirePatrolCheck?: boolean
    patrolInterval?: number
    requireFinalCheck?: boolean
    checkItems?: string[]
  }
}

interface ProcessRecord {
  processNo: string
  processName: string
  equipmentType: string
  cycleTime: string
  description?: string
  inspectionRule?: ProcessItem['inspectionRule']
  qualifiedQuantity?: number
  outOfToleranceQuantity?: number
  scrapQuantity?: number
}

const ProcessListContent: React.FC = () => {
  const { items, loading: modelLoading } = useModelList()
  const { saveItem } = useModelSave()
  const { getItems } = useModelGetItems()

  // 获取生产跟单列表
  const { items: workOrders, loading: workOrdersLoading } = useModelListWithOptions({ tableId: workOrderTableId })
  const { saveItem: saveWorkOrder } = useModelSaveWithTable({ tableId: workOrderTableId })
  const { getItems: getWorkOrders } = useModelGetItemsWithTable({ tableId: workOrderTableId })

  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const hasInitialized = useRef(false)

  // 工序记录设置相关状态
  const [showProcessRecordDialog, setShowProcessRecordDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>('')
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)

  const routes = items as any[]
  const loading = modelLoading
  const workOrdersList = workOrders as any[]

  useEffect(() => {
    if (!hasInitialized.current && workOrdersList.length > 0 && !selectedId) {
      const first = workOrdersList[0]
      const id = first.id || first.woId || first['serial-number']
      setSelectedId(id)
      setSelectedItem(first)
      hasInitialized.current = true
    }
  }, [workOrdersList, selectedId])

  useEffect(() => {
    if (selectedId && workOrdersList.length > 0) {
      const found = workOrdersList.find(w => {
        const wid = w.id || w.woId || w['serial-number']
        return wid === selectedId
      })
      if (found) setSelectedItem(found)
    }
  }, [selectedId, workOrdersList])

  // 解析工序列表
  const getProcesses = (item: any): ProcessItem[] => {
    if (!item) return []
    const raw = item.processes || item['工序'] || item['工序列表'] || []
    if (Array.isArray(raw)) return raw
    if (typeof raw === 'string') {
      try { return JSON.parse(raw) } catch { return [] }
    }
    return []
  }

  const processes = getProcesses(routes[0])  // 从第一个调度路线获取工序作为参考

  // 下发调度规程
  const handleDistribute = async () => {
    if (!selectedItem) return
    try {
      await saveItem({
        ...selectedItem,
        status: 'distributed',
      })
      await getItems()
      toast.success('调度规程下发成功')
    } catch (e) {
      toast.error('下发失败')
    }
  }

  // 打开工序记录设置对话框
  const openProcessRecordDialog = () => {
    if (!selectedItem) {
      toast.error('请先选择生产跟单')
      return
    }
    if (routes.length === 0) {
      toast.error('暂无调度路线可供参考')
      return
    }
    if (processes.length === 0) {
      toast.error('该调度路线暂无工序')
      return
    }
    setShowProcessRecordDialog(true)
  }

  // 保存工序记录到生产跟单
  const handleSaveProcessRecord = async () => {
    if (!selectedItem) {
      toast.error('请选择生产跟单')
      return
    }

    setSaving(true)
    try {
      // 将调度路线的工序转换为 processRecord 格式
      const processRecords: ProcessRecord[] = processes.map(proc => ({
        processNo: proc.processNo,
        processName: proc.processName,
        equipmentType: proc.equipmentType,
        cycleTime: proc.cycleTime,
        description: proc.description,
        inspectionRule: proc.inspectionRule,
        qualifiedQuantity: 0,
        outOfToleranceQuantity: 0,
        scrapQuantity: 0,
      }))

      await saveWorkOrder({
        ...selectedItem,
        processRecord: processRecords,
      })

      await getWorkOrders()
      toast.success('工序记录设置成功')
      setShowProcessRecordDialog(false)
    } catch (e) {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 渲染检验规则
  const renderInspectionRule = (rule?: ProcessItem['inspectionRule']) => {
    if (!rule) return <span className="text-xs text-blue-300/60">未配置</span>

    const tags: { label: string; active: boolean }[] = [
      { label: '首检', active: !!rule.requireFirstCheck },
      { label: '巡检', active: !!rule.requirePatrolCheck },
      { label: '终检', active: !!rule.requireFinalCheck },
    ]

    return (
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {tags.map(t => (
            <Badge key={t.label} variant={t.active ? 'default' : 'secondary'} className="text-xs">
              {t.label}
            </Badge>
          ))}
          {rule.patrolInterval && (
            <span className="text-xs text-blue-200">巡检间隔: {rule.patrolInterval}件</span>
          )}
        </div>
        {rule.checkItems && rule.checkItems.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {rule.checkItems.map((item, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/20">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 左侧：生产跟单列表 */}
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardContent className="p-3">
            {workOrdersLoading ? (
              <LoadingDots />
            ) : workOrdersList.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-2 text-blue-300" />
                <p>暂无生产跟单</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {workOrdersList.slice(0, 10).map((wo, index) => {
                  const id = wo.id || wo.woId || wo['serial-number'] || index
                  const name = wo.batchComponentSerialNumber || wo.batchOrderNo || wo.name || '未命名'
                  const productType = wo.productType || ''
                  const status = wo.productionStatus || '0'
                  return (
                    <div
                      key={id}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${selectedId === id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-blue-400/30 bg-blue-500/5 hover:bg-blue-500/10'
                        }`}
                      onClick={() => setSelectedId(id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-white text-sm truncate">{name}</div>
                        {status === '6' && (
                          <Badge className="bg-green-500/20 text-green-300 text-xs flex-shrink-0 ml-1">已完成</Badge>
                        )}
                      </div>
                      {productType && <div className="text-xs text-blue-200 truncate mt-0.5">{productType}</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右侧：调度路线参考 + 跟单信息 */}
        <div className="lg:col-span-3 space-y-4">
          {selectedItem ? (
            <>
              {/* 生产跟单信息 */}
              <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <CardContent className="px-4 pb-4 pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">当前生产跟单</h3>
                      <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                        {selectedItem.batchComponentSerialNumber || selectedItem.batchOrderNo || selectedItem.woId || '-'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-300">产品类型：</span>
                        <span className="text-white ml-2">{selectedItem.productType || '-'}</span>
                      </div>
                      <div>
                        <span className="text-blue-300">生产状态：</span>
                        <span className="text-white ml-2">{selectedItem.productionStatus || '-'}</span>
                      </div>
                      <div>
                        <span className="text-blue-300">准备状态：</span>
                        <span className="text-white ml-2">{selectedItem.preparationStatus || '-'}</span>
                      </div>
                    </div>
                    {selectedItem.processRecord && Array.isArray(selectedItem.processRecord) && selectedItem.processRecord.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-blue-400/20">
                        <span className="text-blue-300 text-sm">已设置工序：{selectedItem.processRecord.length} 道</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 当前调度路线（作为参考） */}
              {routes.length > 0 ? (
                <>
                  <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                    style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-white">参考调度路线</h3>
                          <p className="text-xs text-blue-200 mt-1">
                            {routes[0].routeCode || routes[0]['路线编码'] || routes[0].name || '-'}
                            {routes[0].productName && ` | ${routes[0].productName}`}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={openProcessRecordDialog}
                          className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
                        >
                          <List className="w-3 h-3 mr-1" />
                          设置工序记录
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 工序列表（参考用） */}
                  {processes.length === 0 ? (
                    <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                      style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                      <CardContent className="p-8 text-center text-blue-200">
                        <ClipboardCheck className="w-12 h-12 mx-auto mb-2 text-blue-300" />
                        <p>该调度路线暂无工序规程</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {processes.map((proc, idx) => (
                        <Card key={proc._key || idx} className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
                          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-blue-100 text-base flex items-center gap-2">
                                <Badge variant="outline" className="text-cyan-300 border-cyan-500/30">
                                  {proc.processNo}
                                </Badge>
                                {proc.processName}
                              </CardTitle>
                              <span className="text-xs text-blue-300">工序 {idx + 1} / {processes.length}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="p-3 space-y-3">
                            {/* 基本信息网格 */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-blue-300" />
                                <div>
                                  <p className="text-xs text-blue-300">设备类型</p>
                                  <p className="text-sm text-white">{proc.equipmentType || '-'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-300" />
                                <div>
                                  <p className="text-xs text-blue-300">标准工时</p>
                                  <p className="text-sm text-white">{proc.cycleTime ? `${proc.cycleTime} 分钟` : '-'}</p>
                                </div>
                              </div>
                            </div>

                            {proc.description && (
                              <p className="text-xs text-blue-200">{proc.description}</p>
                            )}

                            {/* 检验规则 */}
                            <div className="border-t border-blue-400/20 pt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <ClipboardCheck className="w-4 h-4 text-blue-300" />
                                <span className="text-xs font-medium text-blue-200">检验规则</span>
                              </div>
                              {renderInspectionRule(proc.inspectionRule)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </>
              ) : null}
            </>
          ) : (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardContent className="p-8 text-center text-blue-200">
                <p>请从左侧选择一条生产跟单</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 工序记录设置对话框 */}
      <Dialog open={showProcessRecordDialog} onOpenChange={setShowProcessRecordDialog}>
        <DialogContent className="!w-[600px] !max-w-none">
          <DialogHeader>
            <DialogTitle className="text-white">设置跟单工序记录</DialogTitle>
            <DialogDescription className="text-blue-200">
              将当前调度路线的工序导入到生产跟单中，导入后其他页面只能查看不能修改
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 当前生产跟单 */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
              <div className="text-sm text-blue-200 mb-1">当前生产跟单</div>
              <div className="text-white font-medium">
                {selectedItem?.batchComponentSerialNumber || selectedItem?.batchOrderNo || selectedItem?.woId || '-'}
              </div>
              <div className="text-xs text-blue-300 mt-1">
                {selectedItem?.productType || '-'}
              </div>
            </div>

            {/* 参考调度路线 */}
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
              <div className="text-sm text-blue-200 mb-1">参考调度路线</div>
              <div className="text-white font-medium">
                {routes[0]?.routeCode || routes[0]?.['路线编码'] || routes[0]?.name || '-'}
              </div>
              <div className="text-xs text-blue-300 mt-1">
                共 {processes.length} 道工序可供导入
              </div>
            </div>

            {/* 已存在的工序记录警告 */}
            {selectedItem?.processRecord && Array.isArray(selectedItem.processRecord) && selectedItem.processRecord.length > 0 && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/20">
                <div className="flex items-center gap-2 text-yellow-300 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">注意</span>
                </div>
                <div className="text-xs text-yellow-200">
                  该跟单已有 {selectedItem.processRecord.length} 道工序记录，导入后将覆盖现有记录
                </div>
              </div>
            )}

            {/* 工序列表预览 */}
            {processes.length > 0 && (
              <div className="space-y-2">
                <Label className="text-blue-200">将导入的工序</Label>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {processes.map((proc, idx) => (
                    <div key={proc._key || idx} className="flex items-center gap-3 p-2 rounded bg-blue-500/5 border border-blue-400/10">
                      <Badge variant="outline" className="text-cyan-300 border-cyan-500/30 text-xs">
                        {proc.processNo}
                      </Badge>
                      <span className="text-sm text-white flex-1">{proc.processName}</span>
                      <span className="text-xs text-blue-300">{proc.equipmentType}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowProcessRecordDialog(false)
                setSelectedWorkOrderId('')
                setSelectedWorkOrder(null)
              }}
              className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20"
            >
              取消
            </Button>
            <Button
              onClick={handleSaveProcessRecord}
              disabled={!selectedItem || saving}
              className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
            >
              {saving ? (
                <LoadingDots text="保存中..." />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存工序记录
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function ProcessListPage() {
  return (
    <div className="space-y-0">
      <ViewModel tableId={tableId} initQuery={true}>
        <ProcessListContent />
      </ViewModel>
    </div>
  )
}

export default ProcessListPage
