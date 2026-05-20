import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DataTable } from '@/components/DataTable'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Search, RotateCcw, Eye, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { toastApi } from '@/components/ui/toast'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'
import {
  getFinalInspectionList,
  createFinalInspection,
  updateFinalInspection,
  deleteFinalInspection,
  approveFinalInspection,
  rejectFinalInspection,
  QUALITY_STATUS,
  INSPECTION_STATUS,
  DISPOSITION_OPTIONS,
} from '@/services/final-inspection.service'
import type { FinalInspection } from '@/types/final-inspection'

const tableId = '终检记录'

const Content = () => {
  const { items, loading: dataLoading } = useModelList()
  const [data, setData] = useState<FinalInspection[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0, totalPages: 0 })
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [qualityFilter, setQualityFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FinalInspection | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<FinalInspection>>({})

  // 加载数据
  const loadData = async (page = 1) => {
    setLoading(true)
    try {
      const result = await getFinalInspectionList({
        page,
        size: pagination.pageSize,
        status: statusFilter,
        qualityStatus: qualityFilter,
        search: searchText,
      })
      setData(result.list)
      setPagination({ current: result.page, pageSize: result.size, total: result.total, totalPages: result.totalPages })
    } catch (error) {
      toastApi.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadData()
  }, [])

  // 重置筛选
  const handleReset = () => {
    setSearchText('')
    setStatusFilter('all')
    setQualityFilter('all')
    loadData(1)
  }

  // 打开新建弹窗
  const handleOpenCreate = () => {
    setFormData({
      inspectionDate: new Date().toISOString().split('T')[0],
      quantity: 0,
      qualifiedQuantity: 0,
      unqualifiedQuantity: 0,
      scrapQuantity: 0,
      repairQuantity: 0,
      inspectionStatus: '待终检',
      qualityStatus: '合格',
    })
    setIsCreateOpen(true)
  }

  // 打开编辑弹窗
  const handleOpenEdit = (item: FinalInspection) => {
    setSelectedItem(item)
    setFormData({ ...item })
    setIsEditOpen(true)
  }

  // 打开查看弹窗
  const handleOpenView = (item: FinalInspection) => {
    setSelectedItem(item)
    setIsViewOpen(true)
  }

  // 提交新建
  const handleSubmitCreate = async () => {
    if (!formData.productName || !formData.quantity) {
      toastApi.error('请填写必填项')
      return
    }

    setSubmitting(true)
    try {
      await createFinalInspection(formData)
      toastApi.success('创建成功')
      setIsCreateOpen(false)
      loadData()
    } catch (error) {
      toastApi.error('创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 提交编辑
  const handleSubmitEdit = async () => {
    if (!selectedItem) return

    setSubmitting(true)
    try {
      await updateFinalInspection(selectedItem.id, formData)
      toastApi.success('更新成功')
      setIsEditOpen(false)
      loadData()
    } catch (error) {
      toastApi.error('更新失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 删除
  const handleDelete = async (item: FinalInspection) => {
    if (!confirm(`确定要删除终检单 ${item.inspectionNo} 吗？`)) return

    try {
      await deleteFinalInspection(item.id)
      toastApi.success('删除成功')
      loadData()
    } catch (error) {
      toastApi.error('删除失败')
    }
  }

  // 批准（合格入库）
  const handleApprove = async (item: FinalInspection) => {
    const inspector = prompt('请输入检验员姓名：')
    if (!inspector) return

    try {
      await approveFinalInspection(item.id, inspector)
      toastApi.success('已批准入库')
      loadData()
    } catch (error) {
      toastApi.error('批准失败')
    }
  }

  // 拒收（不合格）
  const handleReject = async (item: FinalInspection) => {
    const defectDescription = prompt('请输入缺陷描述：')
    if (!defectDescription) return

    const disposition = prompt(`请输入处置意见（${DISPOSITION_OPTIONS.join('/')}）：`)
    if (!disposition) return

    try {
      await rejectFinalInspection(item.id, defectDescription, disposition)
      toastApi.success('已拒收，将按处置意见处理')
      loadData()
    } catch (error) {
      toastApi.error('拒收失败')
    }
  }

  // 表格列定义
  const columns: ColumnDef<FinalInspection>[] = [
    {
      accessorKey: 'inspectionNo',
      header: '终检单号',
      cell: ({ getValue }) => <span className="font-mono text-blue-300">{getValue() as string}</span>,
    },
    {
      accessorKey: 'productName',
      header: '产品名称',
    },
    {
      accessorKey: 'batchNo',
      header: '批次号',
      cell: ({ getValue }) => <span className="font-mono text-blue-200">{getValue() as string}</span>,
    },
    {
      accessorKey: 'quantity',
      header: '数量',
      cell: ({ getValue }) => <span className="text-cyan-300">{getValue() as number}</span>,
    },
    {
      accessorKey: 'qualifiedQuantity',
      header: '合格数',
      cell: ({ getValue }) => <span className="text-green-400">{getValue() as number}</span>,
    },
    {
      accessorKey: 'unqualifiedQuantity',
      header: '不合格数',
      cell: ({ getValue }) => (getValue() as number) > 0 ? <span className="text-red-400">{getValue() as number}</span> : '-',
    },
    {
      accessorKey: 'qualityStatus',
      header: '质量状态',
      cell: ({ getValue }) => {
        const status = getValue() as string
        const colorMap: Record<string, string> = {
          '合格': 'bg-green-500/20 text-green-300 border-green-500/30',
          '不合格': 'bg-red-500/20 text-red-300 border-red-500/30',
          '让步接收': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        }
        return (
          <span className={`px-2 py-1 rounded text-xs border ${colorMap[status] || 'bg-gray-500/20 text-gray-300'}`}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: 'inspectionStatus',
      header: '终检状态',
      cell: ({ getValue }) => {
        const status = getValue() as string
        const colorMap: Record<string, string> = {
          '待终检': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          '合格': 'bg-green-500/20 text-green-300 border-green-500/30',
          '不合格': 'bg-red-500/20 text-red-300 border-red-500/30',
          '已返修': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          '已报废': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        }
        return (
          <span className={`px-2 py-1 rounded text-xs border ${colorMap[status] || 'bg-gray-500/20 text-gray-300'}`}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: 'inspector',
      header: '检验员',
    },
    {
      accessorKey: 'inspectionDate',
      header: '检验日期',
    },
    {
      id: 'actions',
      size: 130,
      minSize: 130,
      maxSize: 130,
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/20"
            onClick={() => handleOpenView(row.original)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-blue-300 hover:text-blue-200 hover:bg-blue-500/20"
            onClick={() => handleOpenEdit(row.original)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          {row.original.inspectionStatus === '待终检' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-green-300 hover:text-green-200 hover:bg-green-500/20"
                onClick={() => handleApprove(row.original)}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-red-300 hover:text-red-200 hover:bg-red-500/20"
                onClick={() => handleReject(row.original)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-red-300 hover:text-red-200 hover:bg-red-500/20"
            onClick={() => handleDelete(row.original)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">终检单管理</h1>
          <p className="text-blue-300 text-sm mt-1">产品最终检验管理</p>
        </div>
      </div>

      {/* 筛选栏 */}
      <Card className="backdrop-blur-xl bg-slate-800/30 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
              <Input
                placeholder="搜索终检单号、产品名称、批次号..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 bg-slate-800/50 border-blue-400/30 text-white placeholder:text-blue-300/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-blue-400/30 text-white">
                <SelectValue placeholder="终检状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {INSPECTION_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-blue-400/30 text-white">
                <SelectValue placeholder="质量状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部质量</SelectItem>
                {QUALITY_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => loadData()}
              disabled={loading}
              className="border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/20"
            >
              <Search className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-blue-400/30 text-blue-300 hover:bg-blue-500/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重置
            </Button>
            <Button
              onClick={handleOpenCreate}
              className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建终检单
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card className="backdrop-blur-xl bg-slate-800/30 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onPageChange: (page) => loadData(page),
          }}
        />
      </Card>

      {/* 新建弹窗 */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">新建终检单</DialogTitle>
            <DialogDescription className="text-blue-200">填写终检单信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName" className="text-blue-200">产品名称 *</Label>
                <Input
                  id="productName"
                  value={formData.productName || ''}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                  placeholder="请输入产品名称"
                />
              </div>
              <div>
                <Label htmlFor="batchNo" className="text-blue-200">批次号</Label>
                <Input
                  id="batchNo"
                  value={formData.batchNo || ''}
                  onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                  placeholder="请输入批次号"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity" className="text-blue-200">数量 *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || 0}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="qualifiedQuantity" className="text-blue-200">合格数</Label>
                <Input
                  id="qualifiedQuantity"
                  type="number"
                  value={formData.qualifiedQuantity || 0}
                  onChange={(e) => setFormData({ ...formData, qualifiedQuantity: Number(e.target.value) })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="unqualifiedQuantity" className="text-blue-200">不合格数</Label>
                <Input
                  id="unqualifiedQuantity"
                  type="number"
                  value={formData.unqualifiedQuantity || 0}
                  onChange={(e) => setFormData({ ...formData, unqualifiedQuantity: Number(e.target.value) })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inspectionDate" className="text-blue-200">检验日期</Label>
                <Input
                  id="inspectionDate"
                  type="date"
                  value={formData.inspectionDate || ''}
                  onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="inspector" className="text-blue-200">检验员</Label>
                <Input
                  id="inspector"
                  value={formData.inspector || ''}
                  onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                  placeholder="请输入检验员"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="defectDescription" className="text-blue-200">缺陷描述</Label>
              <Textarea
                id="defectDescription"
                value={formData.defectDescription || ''}
                onChange={(e) => setFormData({ ...formData, defectDescription: e.target.value })}
                className="bg-slate-800/50 border-blue-400/30 text-white"
                placeholder="请描述缺陷情况"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="remark" className="text-blue-200">备注</Label>
              <Textarea
                id="remark"
                value={formData.remark || ''}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                className="bg-slate-800/50 border-blue-400/30 text-white"
                placeholder="请输入备注"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsCreateOpen(false)}
              className="text-blue-200 border-blue-400/30 hover:bg-blue-500/10"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={submitting}
              className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
            >
              {submitting ? '提交中...' : '提交'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑弹窗 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">编辑终检单</DialogTitle>
            <DialogDescription className="text-blue-200">编辑终检单信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_productName" className="text-blue-200">产品名称 *</Label>
                <Input
                  id="edit_productName"
                  value={formData.productName || ''}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit_batchNo" className="text-blue-200">批次号</Label>
                <Input
                  id="edit_batchNo"
                  value={formData.batchNo || ''}
                  onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_quantity" className="text-blue-200">数量 *</Label>
                <Input
                  id="edit_quantity"
                  type="number"
                  value={formData.quantity || 0}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit_qualifiedQuantity" className="text-blue-200">合格数</Label>
                <Input
                  id="edit_qualifiedQuantity"
                  type="number"
                  value={formData.qualifiedQuantity || 0}
                  onChange={(e) => setFormData({ ...formData, qualifiedQuantity: Number(e.target.value) })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit_unqualifiedQuantity" className="text-blue-200">不合格数</Label>
                <Input
                  id="edit_unqualifiedQuantity"
                  type="number"
                  value={formData.unqualifiedQuantity || 0}
                  onChange={(e) => setFormData({ ...formData, unqualifiedQuantity: Number(e.target.value) })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_inspectionDate" className="text-blue-200">检验日期</Label>
                <Input
                  id="edit_inspectionDate"
                  type="date"
                  value={formData.inspectionDate || ''}
                  onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit_inspector" className="text-blue-200">检验员</Label>
                <Input
                  id="edit_inspector"
                  value={formData.inspector || ''}
                  onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                  className="bg-slate-800/50 border-blue-400/30 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_defectDescription" className="text-blue-200">缺陷描述</Label>
              <Textarea
                id="edit_defectDescription"
                value={formData.defectDescription || ''}
                onChange={(e) => setFormData({ ...formData, defectDescription: e.target.value })}
                className="bg-slate-800/50 border-blue-400/30 text-white"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit_remark" className="text-blue-200">备注</Label>
              <Textarea
                id="edit_remark"
                value={formData.remark || ''}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                className="bg-slate-800/50 border-blue-400/30 text-white"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsEditOpen(false)}
              className="text-blue-200 border-blue-400/30 hover:bg-blue-500/10"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={submitting}
              className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
            >
              {submitting ? '提交中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看弹窗 */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">终检单详情</DialogTitle>
            <DialogDescription className="text-blue-200">{selectedItem?.inspectionNo}</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-300">产品名称：</span>
                  <span className="text-white ml-2">{selectedItem.productName}</span>
                </div>
                <div>
                  <span className="text-blue-300">批次号：</span>
                  <span className="text-white ml-2 font-mono">{selectedItem.batchNo}</span>
                </div>
                <div>
                  <span className="text-blue-300">数量：</span>
                  <span className="text-cyan-300 ml-2">{selectedItem.quantity}</span>
                </div>
                <div>
                  <span className="text-blue-300">合格数：</span>
                  <span className="text-green-400 ml-2">{selectedItem.qualifiedQuantity}</span>
                </div>
                <div>
                  <span className="text-blue-300">不合格数：</span>
                  <span className="text-red-400 ml-2">{selectedItem.unqualifiedQuantity}</span>
                </div>
                <div>
                  <span className="text-blue-300">质量状态：</span>
                  <span className="ml-2">{selectedItem.qualityStatus}</span>
                </div>
                <div>
                  <span className="text-blue-300">检验员：</span>
                  <span className="text-white ml-2">{selectedItem.inspector}</span>
                </div>
                <div>
                  <span className="text-blue-300">检验日期：</span>
                  <span className="text-white ml-2">{selectedItem.inspectionDate}</span>
                </div>
              </div>
              {selectedItem.defectDescription && (
                <div>
                  <span className="text-blue-300 text-sm">缺陷描述：</span>
                  <p className="text-white mt-1 text-sm bg-red-500/10 p-2 rounded">{selectedItem.defectDescription}</p>
                </div>
              )}
              {selectedItem.disposition && (
                <div>
                  <span className="text-blue-300 text-sm">处置意见：</span>
                  <p className="text-white mt-1 text-sm bg-yellow-500/10 p-2 rounded">{selectedItem.disposition}</p>
                </div>
              )}
              {selectedItem.remark && (
                <div>
                  <span className="text-blue-300 text-sm">备注：</span>
                  <p className="text-white mt-1 text-sm">{selectedItem.remark}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setIsViewOpen(false)}
              className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function FinalInspectionPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <Content />
    </ViewModel>
  )
}
