import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { toastApi } from '@/components/ui/toast'
import type { DevelopmentOrder, DevelopmentStatus, DevelopmentPhase } from '@/types/development'
import { 
  FlaskConical, 
  Plus, 
  ArrowRight,
  FileCheck,
  Settings,
  Play
} from 'lucide-react'

// Airiot 组件导入
import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import ViewFilter from '@/components/kesi/view-filter/view-filter'
import Actions from '@/components/kesi/view-actions/view-actions'
import { useModelList } from '@airiot/client'

const tableId = '研制订单'

// 模拟研制订单数据
const mockDevelopmentOrders: DevelopmentOrder[] = [
  { 
    id: '1', orderId: 'DEV-2025-001', productId: 'P-NEW01', productName: '新型产品A', productType: '新产品',
    quantity: 50, urgency: 3, status: '试制中', currentPhase: '试制生产',
    startDate: '2025-03-01', expectedDate: '2025-04-15', customerName: '客户A',
    specialRequirements: '需要特殊表面处理', createdAt: '2025-02-28', creatorId: 'U001', creatorName: '张三',
    techEvaluation: { id: 'te-1', orderId: '1', evaluatorId: 'E001', evaluatorName: '技术员A', evaluationDate: '2025-03-02', feasibilityScore: 8, riskLevel: '中', technicalRequirements: '需要专用夹具', requiredEquipment: ['加工中心'], requiredMaterials: ['特殊合金'], estimatedCost: 50000, recommendation: '可行', status: '已完成' },
    processValidation: { id: 'pv-1', orderId: '1', validatorId: 'V001', validatorName: '调度员A', validationDate: '2025-03-10', processRoute: 'RT-NEW-001', testSamples: 10, qualifiedSamples: 9, passRate: 90, processParams: [], issues: ['表面光洁度不达标'], improvements: ['调整切削参数'], result: '合格', status: '已完成' },
    trialProduction: { id: 'tp-1', orderId: '1', batchNo: 'DEV-B001', quantity: 30, startDate: '2025-03-15', qualifiedQuantity: 28, defectQuantity: 2, status: '进行中' }
  },
  { 
    id: '2', orderId: 'DEV-2025-002', productId: 'P-NEW02', productName: '定制零件B', productType: '定制产品',
    quantity: 100, urgency: 4, status: '调度验证中', currentPhase: '调度验证',
    startDate: '2025-03-10', expectedDate: '2025-05-01', customerName: '客户B',
    specialRequirements: '材料为钛合金', createdAt: '2025-03-08', creatorId: 'U002', creatorName: '李四',
    techEvaluation: { id: 'te-2', orderId: '2', evaluatorId: 'E001', evaluatorName: '技术员A', evaluationDate: '2025-03-12', feasibilityScore: 7, riskLevel: '高', riskDescription: '钛合金加工难度大', technicalRequirements: '需要专用刀具', requiredEquipment: ['五轴加工中心'], requiredMaterials: ['钛合金棒材'], estimatedCost: 120000, recommendation: '需改进', status: '已完成' },
    processValidation: { id: 'pv-2', orderId: '2', validatorId: 'V001', validatorName: '调度员A', validationDate: '2025-03-18', processRoute: 'RT-NEW-002', testSamples: 5, qualifiedSamples: 3, passRate: 60, processParams: [], issues: ['刀具磨损快'], improvements: ['优化切削参数', '更换涂层刀具'], result: '需调整', status: '进行中' }
  },
  { 
    id: '3', orderId: 'DEV-2025-003', productId: 'P-NEW03', productName: '新型材料零件C', productType: '特殊材料',
    quantity: 20, urgency: 2, status: '待评估', currentPhase: '技术评估',
    startDate: '2025-03-20', expectedDate: '2025-06-01', customerName: '客户C',
    createdAt: '2025-03-18', creatorId: 'U001', creatorName: '张三'
  },
  { 
    id: '4', orderId: 'DEV-2025-004', productId: 'P-NEW04', productName: '新调度产品D', productType: '新调度',
    quantity: 80, urgency: 5, status: '待转量产', currentPhase: '转量产',
    startDate: '2025-02-01', expectedDate: '2025-03-20', completedDate: '2025-03-18', customerName: '客户D',
    createdAt: '2025-01-28', creatorId: 'U003', creatorName: '王五',
    techEvaluation: { id: 'te-4', orderId: '4', evaluatorId: 'E001', evaluatorName: '技术员A', evaluationDate: '2025-02-03', feasibilityScore: 9, riskLevel: '低', technicalRequirements: '标准调度路线', requiredEquipment: ['车床', '铣床'], requiredMaterials: ['铝合金'], estimatedCost: 30000, recommendation: '可行', status: '已完成' },
    processValidation: { id: 'pv-4', orderId: '4', validatorId: 'V001', validatorName: '调度员A', validationDate: '2025-02-10', processRoute: 'RT-NEW-004', testSamples: 15, qualifiedSamples: 15, passRate: 100, processParams: [], issues: [], improvements: [], result: '合格', status: '已完成' },
    trialProduction: { id: 'tp-4', orderId: '4', batchNo: 'DEV-B004', quantity: 80, startDate: '2025-02-15', endDate: '2025-03-10', qualifiedQuantity: 78, defectQuantity: 2, status: '已完成' },
    massConversion: { id: 'mc-4', orderId: '4', conversionDate: '2025-03-20', approvedQuantity: 500, processRouteId: 'RT-001', processRouteName: '产品D量产路线', approverId: 'A001', approverName: '审批人A', status: '待审批' }
  },
  { 
    id: '5', orderId: 'DEV-2025-005', productId: 'P-NEW05', productName: '已完成产品E', productType: '新产品',
    quantity: 30, urgency: 3, status: '已完成', currentPhase: '转量产',
    startDate: '2025-01-15', expectedDate: '2025-03-01', completedDate: '2025-02-28', customerName: '客户E',
    createdAt: '2025-01-12', creatorId: 'U002', creatorName: '李四',
    techEvaluation: { id: 'te-5', orderId: '5', evaluatorId: 'E001', evaluatorName: '技术员A', evaluationDate: '2025-01-18', feasibilityScore: 9, riskLevel: '低', technicalRequirements: '标准调度', requiredEquipment: ['加工中心'], requiredMaterials: ['钢材'], estimatedCost: 20000, recommendation: '可行', status: '已完成' },
    processValidation: { id: 'pv-5', orderId: '5', validatorId: 'V001', validatorName: '调度员A', validationDate: '2025-01-25', processRoute: 'RT-NEW-005', testSamples: 10, qualifiedSamples: 10, passRate: 100, processParams: [], issues: [], improvements: [], result: '合格', status: '已完成' },
    trialProduction: { id: 'tp-5', orderId: '5', batchNo: 'DEV-B005', quantity: 30, startDate: '2025-02-01', endDate: '2025-02-20', qualifiedQuantity: 30, defectQuantity: 0, status: '已完成' },
    massConversion: { id: 'mc-5', orderId: '5', conversionDate: '2025-02-28', approvedQuantity: 1000, processRouteId: 'RT-002', processRouteName: '产品E量产路线', approverId: 'A001', approverName: '审批人A', status: '已批准' }
  },
]

// 内部组件
const DevelopmentContent = () => {
  const { items, loading } = useModelList()
  
  // 使用模拟数据（实际项目中会使用 items）
  const orders = mockDevelopmentOrders
  
  // 弹窗状态
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEvalOpen, setIsEvalOpen] = useState(false)
  const [isConvertOpen, setIsConvertOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<DevelopmentOrder | null>(null)

  // 统计数据
  const stats = {
    total: orders.length,
    evaluating: orders.filter(o => o.status === '待评估' || o.status === '技术评估中').length,
    validating: orders.filter(o => o.status === '调度验证中').length,
    trialing: orders.filter(o => o.status === '试制中').length,
    converting: orders.filter(o => o.status === '待转量产').length,
    completed: orders.filter(o => o.status === '已完成').length,
  }

  // 查看详情
  const handleViewDetail = (order: DevelopmentOrder) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  // 执行技术评估
  const handleStartEvaluation = (order: DevelopmentOrder) => {
    setSelectedOrder(order)
    setIsEvalOpen(true)
  }

  // 转量产
  const handleConvertToMass = (order: DevelopmentOrder) => {
    setSelectedOrder(order)
    setIsConvertOpen(true)
  }

  // 状态颜色
  const getStatusColor = (status: DevelopmentStatus) => {
    const colors: Record<DevelopmentStatus, string> = {
      '待评估': 'bg-orange-500/20 text-orange-300',
      '技术评估中': 'bg-blue-500/20 text-blue-300',
      '调度验证中': 'bg-cyan-500/20 text-cyan-300',
      '试制中': 'bg-purple-500/20 text-purple-300',
      '待转量产': 'bg-yellow-500/20 text-yellow-300',
      '已完成': 'bg-green-500/20 text-green-300',
      '已取消': 'bg-red-500/20 text-red-300',
    }
    return colors[status] || 'bg-gray-500/20 text-gray-300'
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardContent className="px-5 py-4 pt-4">
            <div className="text-sm text-blue-200">总订单</div>
            <div className="text-2xl font-bold text-white drop-shadow-md">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(234, 179, 8, 0.3)' }}>
          <CardContent className="px-5 py-4 pt-4">
            <div className="text-sm text-blue-200">评估中</div>
            <div className="text-2xl font-bold text-orange-400 drop-shadow-md">{stats.evaluating}</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(34, 211, 238, 0.3)' }}>
          <CardContent className="px-5 py-4 pt-4">
            <div className="text-sm text-blue-200">调度验证</div>
            <div className="text-2xl font-bold text-cyan-400 drop-shadow-md">{stats.validating}</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}>
          <CardContent className="px-5 py-4 pt-4">
            <div className="text-sm text-blue-200">试制中</div>
            <div className="text-2xl font-bold text-purple-400 drop-shadow-md">{stats.trialing}</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(234, 179, 8, 0.3)' }}>
          <CardContent className="px-5 py-4 pt-4">
            <div className="text-sm text-blue-200">待转量产</div>
            <div className="text-2xl font-bold text-yellow-400 drop-shadow-md">{stats.converting}</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <CardContent className="px-5 py-4 pt-4">
            <div className="text-sm text-blue-200">已完成</div>
            <div className="text-2xl font-bold text-green-400 drop-shadow-md">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* 流程说明 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardContent className="px-4 pb-4 pt-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-blue-200">研制流程：</span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-orange-500/20 text-orange-300">技术评估</span>
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <span className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300">调度验证</span>
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-300">试制生产</span>
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <span className="px-3 py-1 rounded bg-green-500/20 text-green-300">转量产</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 筛选工具栏 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardContent className="px-4 pb-4 pt-4">
          <div className="flex items-center gap-3">
            <ViewFilter />
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-blue-500/30"
            >
              <Plus className="w-4 h-4 mr-1" />
              新建研制订单
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 研制订单表格 - 使用 ViewDataTable */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-0" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <ViewDataTable tableLayout={{ border: true, headerSticky: true }}>
          <TableColumn name="orderId" title="订单号" />
          <TableColumn name="productName" title="产品名称" />
          <TableColumn name="productType" title="产品类型" />
          <TableColumn name="quantity" title="数量" />
          <TableColumn name="currentPhase" title="当前阶段" />
          <TableColumn name="status" title="状态" />
          <TableColumn name="expectedDate" title="预计完成" />
          <TableColumn name="__actions__" title="操作" fixed="right" width={130}>
            {(props: any) => {
              const item = props.item
              return (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetail(item)}
                    className="text-blue-300 hover:text-blue-100 hover:bg-blue-500/10 h-8"
                  >
                    详情
                  </Button>
                  {item.status === '待评估' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEvaluation(item)}
                      className="text-orange-300 hover:text-orange-100 hover:bg-orange-500/10 h-8"
                    >
                      评估
                    </Button>
                  )}
                  {item.status === '待转量产' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConvertToMass(item)}
                      className="text-green-300 hover:text-green-100 hover:bg-green-500/10 h-8"
                    >
                      转量产
                    </Button>
                  )}
                </div>
              )
            }}
          </TableColumn>
        </ViewDataTable>
        <ViewPagination />
      </Card>

      {/* 新建研制订单弹窗 */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] !flex !flex-col !p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700 shrink-0">
            <DialogTitle className="text-slate-100 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-cyan-400" />
              新建研制订单
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              新产品/特殊材料/新调度需要走研制流程
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div className="space-y-2">
                <Label className="text-blue-200">产品名称 *</Label>
                <Input placeholder="输入产品名称" className="h-10 bg-blue-500/10 border-blue-400/30 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">产品类型 *</Label>
                <Select>
                  <SelectTrigger className="h-10 bg-blue-500/10 border-blue-400/30 text-white">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-blue-500/30">
                    <SelectItem value="新产品">新产品</SelectItem>
                    <SelectItem value="特殊材料">特殊材料</SelectItem>
                    <SelectItem value="新调度">新调度</SelectItem>
                    <SelectItem value="定制产品">定制产品</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">研制数量</Label>
                <Input type="number" placeholder="50" className="h-10 bg-blue-500/10 border-blue-400/30 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">紧急程度</Label>
                <Select defaultValue="3">
                  <SelectTrigger className="h-10 bg-blue-500/10 border-blue-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-blue-500/30">
                    <SelectItem value="1">1 - 最低</SelectItem>
                    <SelectItem value="2">2 - 较低</SelectItem>
                    <SelectItem value="3">3 - 一般</SelectItem>
                    <SelectItem value="4">4 - 较高</SelectItem>
                    <SelectItem value="5">5 - 最高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">客户名称</Label>
                <Input placeholder="输入客户名称" className="h-10 bg-blue-500/10 border-blue-400/30 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">预计完成日期</Label>
                <Input type="date" className="h-10 bg-blue-500/10 border-blue-400/30 text-white" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-blue-200">特殊要求</Label>
                <Textarea placeholder="输入特殊要求和技术说明..." className="bg-blue-500/10 border-blue-400/30 text-white min-h-[80px]" />
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-blue-500/20 shrink-0 gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20">
              取消
            </Button>
            <Button onClick={() => { toastApi.success('研制订单创建成功！'); setIsCreateOpen(false) }} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500">
              提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情弹窗 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] !flex !flex-col !p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700 shrink-0">
            <DialogTitle className="text-slate-100">研制订单详情</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
            {selectedOrder && (
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <h4 className="text-blue-200 font-medium mb-3">基本信息</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-blue-300">订单号：</span><span className="text-white">{selectedOrder.orderId}</span></div>
                    <div><span className="text-blue-300">产品名称：</span><span className="text-white">{selectedOrder.productName}</span></div>
                    <div><span className="text-blue-300">产品类型：</span><span className="text-white">{selectedOrder.productType}</span></div>
                    <div><span className="text-blue-300">数量：</span><span className="text-white">{selectedOrder.quantity}</span></div>
                    <div><span className="text-blue-300">紧急程度：</span><span className="text-white">{selectedOrder.urgency}</span></div>
                    <div><span className="text-blue-300">状态：</span><span className={`px-2 py-0.5 rounded text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></div>
                    <div><span className="text-blue-300">开始日期：</span><span className="text-white">{selectedOrder.startDate}</span></div>
                    <div><span className="text-blue-300">预计完成：</span><span className="text-white">{selectedOrder.expectedDate}</span></div>
                    <div><span className="text-blue-300">创建人：</span><span className="text-white">{selectedOrder.creatorName}</span></div>
                  </div>
                </div>

                {/* 技术评估 */}
                {selectedOrder.techEvaluation && (
                  <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-4">
                    <h4 className="text-orange-300 font-medium mb-3 flex items-center gap-2">
                      <FileCheck className="w-4 h-4" />
                      技术评估
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><span className="text-blue-300">评估人：</span><span className="text-white">{selectedOrder.techEvaluation.evaluatorName}</span></div>
                      <div><span className="text-blue-300">可行性评分：</span><span className="text-white">{selectedOrder.techEvaluation.feasibilityScore}/10</span></div>
                      <div><span className="text-blue-300">风险等级：</span><span className={selectedOrder.techEvaluation.riskLevel === '高' ? 'text-red-400' : selectedOrder.techEvaluation.riskLevel === '中' ? 'text-yellow-400' : 'text-green-400'}>{selectedOrder.techEvaluation.riskLevel}</span></div>
                      <div><span className="text-blue-300">建议：</span><span className={selectedOrder.techEvaluation.recommendation === '可行' ? 'text-green-400' : 'text-yellow-400'}>{selectedOrder.techEvaluation.recommendation}</span></div>
                      <div><span className="text-blue-300">预估成本：</span><span className="text-white">¥{selectedOrder.techEvaluation.estimatedCost.toLocaleString()}</span></div>
                    </div>
                  </div>
                )}

                {/* 调度验证 */}
                {selectedOrder.processValidation && (
                  <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
                    <h4 className="text-cyan-300 font-medium mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      调度验证
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><span className="text-blue-300">验证人：</span><span className="text-white">{selectedOrder.processValidation.validatorName}</span></div>
                      <div><span className="text-blue-300">试样数量：</span><span className="text-white">{selectedOrder.processValidation.testSamples}</span></div>
                      <div><span className="text-blue-300">合格率：</span><span className={selectedOrder.processValidation.passRate >= 80 ? 'text-green-400' : 'text-yellow-400'}>{selectedOrder.processValidation.passRate}%</span></div>
                      <div><span className="text-blue-300">结果：</span><span className={selectedOrder.processValidation.result === '合格' ? 'text-green-400' : 'text-yellow-400'}>{selectedOrder.processValidation.result}</span></div>
                    </div>
                  </div>
                )}

                {/* 试制生产 */}
                {selectedOrder.trialProduction && (
                  <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
                    <h4 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      试制生产
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><span className="text-blue-300">批次号：</span><span className="text-white">{selectedOrder.trialProduction.batchNo}</span></div>
                      <div><span className="text-blue-300">试制数量：</span><span className="text-white">{selectedOrder.trialProduction.quantity}</span></div>
                      <div><span className="text-blue-300">合格数量：</span><span className="text-white">{selectedOrder.trialProduction.qualifiedQuantity}</span></div>
                      <div><span className="text-blue-300">状态：</span><span className="text-purple-300">{selectedOrder.trialProduction.status}</span></div>
                    </div>
                  </div>
                )}

                {/* 转量产 */}
                {selectedOrder.massConversion && (
                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                    <h4 className="text-green-300 font-medium mb-3 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      转量产
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><span className="text-blue-300">批准数量：</span><span className="text-white">{selectedOrder.massConversion.approvedQuantity}</span></div>
                      <div><span className="text-blue-300">调度路线：</span><span className="text-white">{selectedOrder.massConversion.processRouteName}</span></div>
                      <div><span className="text-blue-300">状态：</span><span className={selectedOrder.massConversion.status === '已批准' ? 'text-green-400' : 'text-yellow-400'}>{selectedOrder.massConversion.status}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-blue-500/20 shrink-0">
            <Button onClick={() => setIsDetailOpen(false)} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500">关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 技术评估弹窗 */}
      <Dialog open={isEvalOpen} onOpenChange={setIsEvalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-slate-100 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-orange-400" />
              技术评估
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              对研制订单 {selectedOrder?.orderId} 进行技术评估
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-blue-200">可行性评分 (1-10)</Label>
                <Input type="number" min="1" max="10" placeholder="8" className="h-10 bg-blue-500/10 border-blue-400/30 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">风险等级</Label>
                <Select>
                  <SelectTrigger className="h-10 bg-blue-500/10 border-blue-400/30 text-white">
                    <SelectValue placeholder="选择风险等级" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-blue-500/30">
                    <SelectItem value="低">低</SelectItem>
                    <SelectItem value="中">中</SelectItem>
                    <SelectItem value="高">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-blue-200">技术要求</Label>
              <Textarea placeholder="描述技术要求..." className="bg-blue-500/10 border-blue-400/30 text-white min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-blue-200">建议</Label>
              <Select>
                <SelectTrigger className="h-10 bg-blue-500/10 border-blue-400/30 text-white">
                  <SelectValue placeholder="选择建议" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-blue-500/30">
                  <SelectItem value="可行">可行</SelectItem>
                  <SelectItem value="需改进">需改进</SelectItem>
                  <SelectItem value="不可行">不可行</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEvalOpen(false)} className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20">取消</Button>
            <Button onClick={() => { toastApi.success('评估完成！'); setIsEvalOpen(false) }} className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500">提交评估</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 转量产弹窗 */}
      <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-slate-100 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-green-400" />
              转量产
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              将研制订单 {selectedOrder?.orderId} 转为量产
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
              <p className="text-sm text-blue-200">
                研制订单已完成试制，可以申请转为量产。审批通过后将自动创建量产订单和调度路线。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-blue-200">量产数量</Label>
                <Input type="number" placeholder="500" className="h-10 bg-blue-500/10 border-blue-400/30 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">调度路线</Label>
                <Select>
                  <SelectTrigger className="h-10 bg-blue-500/10 border-blue-400/30 text-white">
                    <SelectValue placeholder="选择调度路线" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-blue-500/30">
                    <SelectItem value="rt-001">RT-001 标准路线</SelectItem>
                    <SelectItem value="rt-002">RT-002 精加工路线</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-blue-200">备注</Label>
              <Textarea placeholder="输入备注信息..." className="bg-blue-500/10 border-blue-400/30 text-white min-h-[60px]" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsConvertOpen(false)} className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20">取消</Button>
            <Button onClick={() => { toastApi.success('已提交转量产申请！'); setIsConvertOpen(false) }} className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500">提交申请</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 导出页面组件
export function DevelopmentPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <DevelopmentContent />
    </ViewModel>
  )
}