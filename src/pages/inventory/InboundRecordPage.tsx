/**
 * 入库记录页面（核心表）
 * 方案A：检验前置 - 进厂检验是入库流程的必填属性
 * 合并原：进厂检验 + 采购收货登记 + 产成品台账
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList, useModelSave, useModelGetItems } from '@airiot/client'
import { toast } from 'sonner'
import { LoadingDots } from '@/components/ui/loading-dots'
import {
  Package,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Warehouse,
  Truck,
  ClipboardCheck
} from 'lucide-react'

const tableId = '入库记录'

// 状态枚举
const STATUS_OPTIONS = [
  { value: 'pending', label: '待检验', color: 'bg-yellow-500' },
  { value: 'inspecting', label: '检验中', color: 'bg-blue-500' },
  { value: 'qualified', label: '合格已入库', color: 'bg-green-500' },
  { value: 'conditional', label: '让步接收已入库', color: 'bg-orange-500' },
  { value: 'nc_processing', label: '不合格审理中', color: 'bg-red-500' },
  { value: 'rejected', label: '已退货', color: 'bg-gray-500' }
]

// 检验类型
const INSPECTION_TYPE_OPTIONS = [
  { value: 'raw_material', label: '原材料回厂检验' },
  { value: 'purchased_product', label: '采购产品回厂检验' }
]

// 检验结论
const RESULT_OPTIONS = [
  { value: 'qualified', label: '合格入库' },
  { value: 'conditional', label: '让步接收' },
  { value: 'rejected', label: '退货' },
  { value: 'pending_nc', label: '待不合格审理' }
]

const InboundRecordContent: React.FC = () => {
  const { items, loading } = useModelList()
  const { saveItem } = useModelSave()
  const { getItems } = useModelGetItems()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<any>({
    arrival_date: new Date().toISOString().split('T')[0],
    inspection_type: 'raw_material',
    expected_qty: 0,
    received_qty: 0,
    sample_qty: 0,
    qualified_qty: 0,
    unqualified_qty: 0,
    result: 'qualified',
    status: 'pending'
  })

  const records = items as any[]

  // 状态统计
  const statusCount = {
    pending: records.filter(r => r.status === 'pending').length,
    inspecting: records.filter(r => r.status === 'inspecting').length,
    qualified: records.filter(r => r.status === 'qualified').length,
    nc_processing: records.filter(r => r.status === 'nc_processing').length,
    rejected: records.filter(r => r.status === 'rejected').length
  }

  // 生成入库单号
  const generateId = () => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const seq = String(records.length + 1).padStart(3, '0')
    return `RK-${dateStr}-${seq}`
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.supplier_name || !formData.material_name || !formData.inspector) {
      toast.error('请填写必填项：供应商名称、物资名称、检验员')
      return
    }

    try {
      const newRecord = {
        ...formData,
        id: generateId(),
        inbound_qty: formData.qualified_qty,
        created_at: new Date().toISOString()
      }
      await saveItem(newRecord)
      await getItems()
      setShowForm(false)
      setFormData({
        arrival_date: new Date().toISOString().split('T')[0],
        inspection_type: 'raw_material',
        expected_qty: 0,
        received_qty: 0,
        sample_qty: 0,
        qualified_qty: 0,
        unqualified_qty: 0,
        result: 'qualified',
        status: 'pending'
      })
      toast.success('入库记录创建成功')
    } catch (error) {
      toast.error('创建失败，请稍后重试')
    }
  }

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(o => o.value === status)
    return (
      <Badge className={`${option?.color || 'bg-gray-500'} text-white`}>
        {option?.label || status}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            入库记录
          </h2>
          <p className="text-sm text-blue-200 mt-1">
            方案A：检验前置 - 进厂检验是入库流程的必填属性
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? '返回列表' : '新建入库记录'}
        </Button>
      </div>

      {/* 状态统计卡片 */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="backdrop-blur-xl bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-200">待检验</p>
                <p className="text-2xl font-bold text-yellow-400">{statusCount.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-200">检验中</p>
                <p className="text-2xl font-bold text-blue-400">{statusCount.inspecting}</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-200">合格已入库</p>
                <p className="text-2xl font-bold text-green-400">{statusCount.qualified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-200">不合格审理中</p>
                <p className="text-2xl font-bold text-red-400">{statusCount.nc_processing}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-gray-500/10 border-gray-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-200">已退货</p>
                <p className="text-2xl font-bold text-gray-400">{statusCount.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm ? (
        /* 新建表单 */
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader>
            <CardTitle className="text-blue-100">新建入库记录</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-200 border-b border-blue-400/30 pb-2">
                基本信息
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-blue-200">到货日期 *</Label>
                  <Input
                    type="date"
                    value={formData.arrival_date}
                    onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-blue-200">检验类型 *</Label>
                  <Select
                    value={formData.inspection_type}
                    onValueChange={(value) => setFormData({ ...formData, inspection_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INSPECTION_TYPE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 供应商信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-200 border-b border-blue-400/30 pb-2">
                供应商信息
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-blue-200">供应商名称 *</Label>
                  <Input
                    value={formData.supplier_name || ''}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    placeholder="请输入供应商名称"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">生产厂家</Label>
                  <Input
                    value={formData.manufacturer || ''}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="请输入生产厂家"
                  />
                </div>
              </div>
            </div>

            {/* 物资信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-200 border-b border-blue-400/30 pb-2">
                物资信息
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-blue-200">物资名称 *</Label>
                  <Input
                    value={formData.material_name || ''}
                    onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
                    placeholder="请输入物资名称"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">物资编码</Label>
                  <Input
                    value={formData.material_code || ''}
                    onChange={(e) => setFormData({ ...formData, material_code: e.target.value })}
                    placeholder="请输入物资编码"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">规格型号</Label>
                  <Input
                    value={formData.spec || ''}
                    onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                    placeholder="请输入规格型号"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">材料牌号</Label>
                  <Input
                    value={formData.grade || ''}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="请输入材料牌号"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">批次号</Label>
                  <Input
                    value={formData.batch_no || ''}
                    onChange={(e) => setFormData({ ...formData, batch_no: e.target.value })}
                    placeholder="请输入批次号"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">单位</Label>
                  <Input
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="请输入单位"
                  />
                </div>
              </div>
            </div>

            {/* 数量信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-200 border-b border-blue-400/30 pb-2">
                数量信息
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-blue-200">应到数量 *</Label>
                  <Input
                    type="number"
                    value={formData.expected_qty}
                    onChange={(e) => setFormData({ ...formData, expected_qty: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-blue-200">实到数量 *</Label>
                  <Input
                    type="number"
                    value={formData.received_qty}
                    onChange={(e) => setFormData({ ...formData, received_qty: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* 检验信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-200 border-b border-blue-400/30 pb-2 flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                检验信息（必填属性）
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-blue-200">抽样数量</Label>
                  <Input
                    type="number"
                    value={formData.sample_qty}
                    onChange={(e) => setFormData({ ...formData, sample_qty: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-blue-200">合格数量</Label>
                  <Input
                    type="number"
                    value={formData.qualified_qty}
                    onChange={(e) => setFormData({ ...formData, qualified_qty: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-blue-200">不合格数量</Label>
                  <Input
                    type="number"
                    value={formData.unqualified_qty}
                    onChange={(e) => setFormData({ ...formData, unqualified_qty: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-blue-200">检验结论 *</Label>
                  <Select
                    value={formData.result}
                    onValueChange={(value) => setFormData({ ...formData, result: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESULT_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-blue-200">检验员 *</Label>
                  <Input
                    value={formData.inspector || ''}
                    onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                    placeholder="请输入检验员姓名"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">检验日期</Label>
                  <Input
                    type="date"
                    value={formData.inspection_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-blue-200">检验记录</Label>
                <Textarea
                  value={formData.inspection_record || ''}
                  onChange={(e) => setFormData({ ...formData, inspection_record: e.target.value })}
                  placeholder="请输入检验记录"
                  rows={3}
                />
              </div>
            </div>

            {/* 入库信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-200 border-b border-blue-400/30 pb-2 flex items-center gap-2">
                <Warehouse className="w-4 h-4" />
                入库信息（检验通过后填写）
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-blue-200">入库仓库</Label>
                  <Input
                    value={formData.warehouse || ''}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    placeholder="请输入入库仓库"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">库位</Label>
                  <Input
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="请输入库位"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">仓库保管员</Label>
                  <Input
                    value={formData.warehouse_keeper || ''}
                    onChange={(e) => setFormData({ ...formData, warehouse_keeper: e.target.value })}
                    placeholder="请输入仓库保管员"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">入库日期</Label>
                  <Input
                    type="date"
                    value={formData.inbound_date || ''}
                    onChange={(e) => setFormData({ ...formData, inbound_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 备注 */}
            <div>
              <Label className="text-blue-200">备注</Label>
              <Textarea
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="请输入备注"
                rows={2}
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit}>
                <CheckCircle className="w-4 h-4 mr-2" />
                提交入库记录
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* 列表视图 */
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader>
            <CardTitle className="text-blue-100">入库记录列表 ({records.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <LoadingDots />
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <Package className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
                <p>暂无入库记录</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-400/30">
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">入库单号</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">到货日期</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">供应商</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">物资名称</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">应到/实到</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">合格/不合格</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">检验员</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">状态</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 20).map((record, index) => (
                      <tr key={record.id || index} className="border-b border-blue-400/20 hover:bg-blue-500/10">
                        <td className="py-2 px-3 text-cyan-300 font-medium">{record.id || '-'}</td>
                        <td className="py-2 px-3 text-blue-100">{record.arrival_date || '-'}</td>
                        <td className="py-2 px-3 text-white">{record.supplier_name || '-'}</td>
                        <td className="py-2 px-3 text-white">{record.material_name || '-'}</td>
                        <td className="py-2 px-3 text-blue-100">
                          {record.expected_qty || 0} / {record.received_qty || 0}
                        </td>
                        <td className="py-2 px-3 text-blue-100">
                          <span className="text-green-400">{record.qualified_qty || 0}</span>
                          {' / '}
                          <span className="text-red-400">{record.unqualified_qty || 0}</span>
                        </td>
                        <td className="py-2 px-3 text-white">{record.inspector || '-'}</td>
                        <td className="py-2 px-3">{getStatusBadge(record.status || 'pending')}</td>
                        <td className="py-2 px-3">
                          <Button size="sm" variant="ghost">详情</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function InboundRecordPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <InboundRecordContent />
    </ViewModel>
  )
}

export default InboundRecordPage
