import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from '@/components/DataTable'
import { toastApi } from '@/components/ui/toast'

import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
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
import type { InventoryDetail } from '@/types/inventory-detail'
import {
  getInventoryDetailList,
  createInventoryDetail,
  updateInventoryDetail,
  deleteInventoryDetail,
  WAREHOUSE_TYPES,
  INVENTORY_DETAIL_STATUS,
} from '@/services/inventory-detail.service'

export function InventoryDetailPage() {
  const [data, setData] = useState<InventoryDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
    totalPages: 0,
  })
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [warehouseTypeFilter, setWarehouseTypeFilter] = useState('all')

  // 弹窗状态
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryDetail | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 表单数据
  const [formData, setFormData] = useState<Partial<InventoryDetail>>({})

  // 加载数据
  const loadData = async (page = 1) => {
    setLoading(true)
    try {
      const result = await getInventoryDetailList({
        page,
        size: pagination.pageSize,
        status: statusFilter,
        warehouseType: warehouseTypeFilter,
        search: searchText,
      })
      setData(result.list)
      setPagination({
        current: result.page,
        pageSize: result.size,
        total: result.total,
        totalPages: result.totalPages,
      })
    } catch (error: any) {
      toastApi.error(error.message || '加载库存明细失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(1)
  }, [statusFilter, warehouseTypeFilter])

  const handleSearch = () => loadData(1)
  const handleReset = () => {
    setSearchText('')
    setStatusFilter('all')
    setWarehouseTypeFilter('all')
    loadData(1)
  }
  const handlePageChange = (page: number) => loadData(page)

  // 统计数据
  const stats = {
    total: data.length,
    inStock: data.filter(d => d.status === '在库').reduce((sum, d) => sum + d.quantity, 0),
    reserved: data.filter(d => d.status === '预留').reduce((sum, d) => sum + d.quantity, 0),
    pending: data.filter(d => d.status === '待检').reduce((sum, d) => sum + d.quantity, 0),
    overdue: data.filter(d => d.agingDays > 30).length, // 超期库存(>30天)
  }

  // 打开新建弹窗
  const handleOpenCreate = () => {
    setFormData({
      warehouseName: '',
      warehouseType: '一级库',
      location: '',
      materialCode: '',
      materialName: '',
      batchNo: '',
      quantity: 0,
      unit: '件',
      unitCost: 0,
      status: '在库',
    } as any)
    setIsCreateOpen(true)
  }

  // 打开编辑弹窗
  const handleOpenEdit = (item: InventoryDetail) => {
    setSelectedItem(item)
    setFormData({ ...item })
    setIsEditOpen(true)
  }

  // 打开查看弹窗
  const handleOpenView = (item: InventoryDetail) => {
    setSelectedItem(item)
    setIsViewOpen(true)
  }

  // 新建提交
  const handleCreate = async () => {
    if (!formData.materialName) {
      toastApi.error('请填写物料名称')
      return
    }
    if (!formData.materialCode) {
      toastApi.error('请填写物料编码')
      return
    }

    setSubmitting(true)
    try {
      await createInventoryDetail(formData)
      toastApi.success('创建库存明细成功')
      setIsCreateOpen(false)
      loadData(1)
    } catch (error: any) {
      toastApi.error(error.message || '创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 更新提交
  const handleUpdate = async () => {
    if (!selectedItem?.id) return

    setSubmitting(true)
    try {
      await updateInventoryDetail(selectedItem.id, formData)
      toastApi.success('更新库存明细成功')
      setIsEditOpen(false)
      loadData(pagination.current)
    } catch (error: any) {
      toastApi.error(error.message || '更新失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 删除
  const handleDelete = async (item: InventoryDetail) => {
    if (!confirm(`确定要删除物料 ${item.materialCode} ${item.materialName} 吗？`)) return
    try {
      await deleteInventoryDetail(item.id)
      toastApi.success('删除成功')
      loadData(pagination.current)
    } catch (error: any) {
      toastApi.error(error.message || '删除失败')
    }
  }

  // 获取状态样式
  const getStatusStyle = (status: string) => {
    const item = INVENTORY_DETAIL_STATUS.find(s => s.value === status)
    if (item) {
      return { className: 'px-2 py-1 rounded text-sm font-medium', style: { backgroundColor: `${item.color}20`, color: item.color } }
    }
    return { className: 'bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-sm font-medium', style: {} }
  }

  // 表格列定义
  const columns: ColumnDef<InventoryDetail>[] = [
    {
      accessorKey: 'warehouseName',
      header: '仓库名称',
      cell: ({ row }) => <span className="text-blue-100">{row.getValue('warehouseName')}</span>,
    },
    {
      accessorKey: 'warehouseType',
      header: '仓库类型',
      cell: ({ row }) => {
        const type = row.getValue('warehouseType') as string
        switch (type) {
          case '一级库': return <span className="px-2 py-1 rounded text-sm font-medium bg-blue-500/20 text-blue-300">{type}</span>
          case '二级库': return <span className="px-2 py-1 rounded text-sm font-medium bg-purple-500/20 text-purple-300">{type}</span>
          case '成品库': return <span className="px-2 py-1 rounded text-sm font-medium bg-green-500/20 text-green-300">{type}</span>
          case '半成品库': return <span className="px-2 py-1 rounded text-sm font-medium bg-orange-500/20 text-orange-300">{type}</span>
          default: return <span className="text-white">{type}</span>
        }
      },
    },
    {
      accessorKey: 'location',
      header: '库位',
      cell: ({ row }) => (
        <span className="text-cyan-300 font-medium">{row.getValue('location')}</span>
      ),
    },
    {
      accessorKey: 'materialCode',
      header: '物料编码',
      cell: ({ row }) => <span className="text-white">{row.getValue('materialCode')}</span>,
    },
    {
      accessorKey: 'materialName',
      header: '物料名称',
      cell: ({ row }) => <span className="text-blue-100">{row.getValue('materialName')}</span>,
    },
    {
      accessorKey: 'batchNo',
      header: '批次号',
      cell: ({ row }) => <span className="text-blue-200 text-sm">{row.getValue('batchNo')}</span>,
    },
    {
      accessorKey: 'quantity',
      header: '数量',
      cell: ({ row }) => <span className="text-white font-medium">{row.original.quantity} {row.original.unit}</span>,
    },
    {
      accessorKey: 'unit',
      header: '单位',
      cell: ({ row }) => <span className="text-blue-200 text-sm">{row.getValue('unit')}</span>,
    },
    {
      accessorKey: 'unitCost',
      header: '单位成本',
      cell: ({ row }) => <span className="text-yellow-300">¥{(row.getValue('unitCost') as number).toLocaleString()}</span>,
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const style = getStatusStyle(status)
        return (
          <span className={style.className} style={style.style}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: 'supplierName',
      header: '供应商',
      cell: ({ row }) => <span className="text-blue-200 text-sm">{row.getValue('supplierName')}</span>,
    },
    {
      accessorKey: 'inboundDate',
      header: '入库日期',
      cell: ({ row }) => <span className="text-blue-200 text-sm">{row.getValue('inboundDate')}</span>,
    },
    // 台账合并字段
    {
      accessorKey: 'openingBalance',
      header: '期初',
      cell: ({ row }) => <span className="text-blue-200">{row.getValue('openingBalance') || 0}</span>,
    },
    {
      accessorKey: 'monthlyInbound',
      header: '本月入库',
      cell: ({ row }) => <span className="text-green-300">+{row.getValue('monthlyInbound') || 0}</span>,
    },
    {
      accessorKey: 'monthlyOutbound',
      header: '本月出库',
      cell: ({ row }) => <span className="text-red-300">-{row.getValue('monthlyOutbound') || 0}</span>,
    },
    {
      accessorKey: 'agingDays',
      header: '库龄(天)',
      cell: ({ row }) => {
        const days = row.getValue('agingDays') as number
        const isOverdue = days > 30
        return (
          <span className={isOverdue ? 'text-red-400 font-bold' : 'text-blue-200'}>
            {days}
            {isOverdue && <span className="ml-1 text-xs">⚠️</span>}
          </span>
        )
      },
    },
    {
      id: 'actions',
      size: 130,
      minSize: 130,
      maxSize: 130,
      meta: { isSticky: true } as any,
      header: '操作',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenView(row.original)}
            className="text-blue-300 hover:text-white hover:bg-blue-500/20 h-8"
          >
            查看
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row.original)}
            className="text-blue-300 hover:text-white hover:bg-blue-500/20 h-8"
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original)}
            className="text-red-400 hover:text-white hover:bg-red-500/20 h-8"
          >
            删除
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardContent className="px-5 py-4 pt-4">
            <div className="text-sm text-blue-200">物料总数</div>
            <div className="text-2xl font-bold text-blue-400 drop-shadow-md">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <CardContent className="px-5 py-4 pt-4">
            <div className="text-sm text-blue-200">在库数量</div>
            <div className="text-2xl font-bold text-green-400 drop-shadow-md">{stats.inStock}</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <CardContent className="px-5 py-4 pt-4">
            <div className="text-sm text-blue-200">预留数量</div>
            <div className="text-2xl font-bold text-cyan-400 drop-shadow-md">{stats.reserved}</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(234, 179, 8, 0.3)' }}>
          <CardContent className="px-5 py-4 pt-4">
            <div className="text-sm text-blue-200">待检数量</div>
            <div className="text-2xl font-bold text-yellow-400 drop-shadow-md">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-red-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <CardContent className="px-5 py-4 pt-4">
            <div className="text-sm text-blue-200">超期库存(&gt;30天)</div>
            <div className="text-2xl font-bold text-red-400 drop-shadow-md">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索筛选 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-4 items-center flex-1 flex-wrap">
            <div className="flex items-center gap-2 flex-1">
              <Label className="whitespace-nowrap text-blue-200">搜索</Label>
              <Input
                className="flex-1 h-10 bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300"
                placeholder="输入物料编码、名称或库位"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-blue-200">仓库类型</Label>
              <Select value={warehouseTypeFilter} onValueChange={setWarehouseTypeFilter}>
                <SelectTrigger className="w-36 h-10 bg-blue-500/10 border-blue-400/30 text-white">
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {WAREHOUSE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-blue-200">状态</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-10 bg-blue-500/10 border-blue-400/30 text-white">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {INVENTORY_DETAIL_STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500">搜索</Button>
              <Button variant="outline" onClick={handleReset} className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20">重置</Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleOpenCreate} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Plus className="h-4 w-4 mr-1" /> 新建明细
            </Button>
          </div>
        </div>
      </Card>

      {/* 数据表格 */}
      <div className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={{
            ...pagination,
            onPageChange: handlePageChange,
          }}
        />
      </div>

      {/* 新建弹窗 */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] !flex !flex-col !p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700 shrink-0">
            <DialogTitle className="text-slate-100">新建库存明细</DialogTitle>
            <DialogDescription className="text-slate-400">填写以下信息创建新的库存明细</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div className="space-y-2">
                <Label className="text-blue-200">仓库名称 <span className="text-red-400">*</span></Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  placeholder="请输入仓库名称"
                  value={formData.warehouseName || ''}
                  onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">仓库类型 <span className="text-red-400">*</span></Label>
                <Select value={formData.warehouseType || '一级库'} onValueChange={(val) => setFormData({ ...formData, warehouseType: val as any })}>
                  <SelectTrigger className="h-10 w-full bg-blue-500/10 border-blue-400/30 text-white">
                    <SelectValue placeholder="请选择仓库类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {WAREHOUSE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">库位</Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  placeholder="请输入库位，如 A-01-01"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">物料编码 <span className="text-red-400">*</span></Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  placeholder="请输入物料编码"
                  value={formData.materialCode || ''}
                  onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">物料名称 <span className="text-red-400">*</span></Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  placeholder="请输入物料名称"
                  value={formData.materialName || ''}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">批次号</Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  placeholder="请输入批次号"
                  value={formData.batchNo || ''}
                  onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">数量 <span className="text-red-400">*</span></Label>
                <Input
                  type="number"
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  placeholder="请输入数量"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">单位</Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  placeholder="请输入单位"
                  value={formData.unit || ''}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">单位成本 (元)</Label>
                <Input
                  type="number"
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  placeholder="请输入单位成本"
                  value={formData.unitCost || ''}
                  onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">状态</Label>
                <Select value={formData.status || '在库'} onValueChange={(val) => setFormData({ ...formData, status: val as any })}>
                  <SelectTrigger className="h-10 w-full bg-blue-500/10 border-blue-400/30 text-white">
                    <SelectValue placeholder="请选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVENTORY_DETAIL_STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-blue-200">备注</Label>
                <Textarea
                  className="bg-blue-500/10 border-blue-400/30 text-white min-h-[60px]"
                  placeholder="请输入备注信息"
                  value={(formData as any).remark || ''}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value } as any)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-blue-500/20 shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={submitting}
              className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20"
            >
              取消
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            >
              {submitting ? '提交中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑弹窗 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] !flex !flex-col !p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700 shrink-0">
            <DialogTitle className="text-slate-100">编辑库存明细</DialogTitle>
            <DialogDescription className="text-slate-400">修改以下信息更新库存明细</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div className="space-y-2">
                <Label className="text-blue-200">仓库名称</Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  value={formData.warehouseName || ''}
                  onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">仓库类型</Label>
                <Select value={formData.warehouseType || '一级库'} onValueChange={(val) => setFormData({ ...formData, warehouseType: val as any })}>
                  <SelectTrigger className="h-10 w-full bg-blue-500/10 border-blue-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WAREHOUSE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">库位</Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">物料编码</Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  value={formData.materialCode || ''}
                  onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">物料名称</Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  value={formData.materialName || ''}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">批次号</Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  value={formData.batchNo || ''}
                  onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">数量</Label>
                <Input
                  type="number"
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">单位</Label>
                <Input
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  value={formData.unit || ''}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">单位成本 (元)</Label>
                <Input
                  type="number"
                  className="h-10 bg-blue-500/10 border-blue-400/30 text-white"
                  value={formData.unitCost || ''}
                  onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200">状态</Label>
                <Select value={formData.status || '在库'} onValueChange={(val) => setFormData({ ...formData, status: val as any })}>
                  <SelectTrigger className="h-10 w-full bg-blue-500/10 border-blue-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVENTORY_DETAIL_STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-blue-200">备注</Label>
                <Textarea
                  className="bg-blue-500/10 border-blue-400/30 text-white min-h-[60px]"
                  value={(formData as any).remark || ''}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value } as any)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-blue-500/20 shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={submitting}
              className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20"
            >
              取消
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={submitting}
              className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            >
              {submitting ? '提交中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看详情弹窗 */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] !flex !flex-col !p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700 shrink-0">
            <DialogTitle className="text-slate-100">库存明细详情</DialogTitle>
            <DialogDescription className="text-slate-400">查看库存明细的详细信息</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
            {selectedItem && (
              <div className="space-y-6">
                {/* 仓库信息 */}
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <h4 className="text-blue-200 font-medium mb-3">仓库信息</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-blue-300">仓库名称</Label>
                      <p className="font-medium text-white mt-1">{selectedItem.warehouseName}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">仓库类型</Label>
                      <p className="font-medium text-white mt-1">{selectedItem.warehouseType}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">库位</Label>
                      <p className="font-medium text-cyan-300 mt-1">{selectedItem.location}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">状态</Label>
                      <p className="font-medium mt-1">
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium`}
                          style={(() => {
                            const item = INVENTORY_DETAIL_STATUS.find(s => s.value === selectedItem.status)
                            return item ? { backgroundColor: `${item.color}20`, color: item.color } : {}
                          })()}
                        >
                          {selectedItem.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 物料信息 */}
                <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
                  <h4 className="text-cyan-300 font-medium mb-3">物料信息</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-blue-300">物料编码</Label>
                      <p className="font-medium text-white mt-1">{selectedItem.materialCode}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">物料名称</Label>
                      <p className="font-medium text-white mt-1">{selectedItem.materialName}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">批次号</Label>
                      <p className="font-medium text-white mt-1">{selectedItem.batchNo}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">数量</Label>
                      <p className="font-bold text-white mt-1">{selectedItem.quantity} {selectedItem.unit}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">单位成本</Label>
                      <p className="font-medium text-yellow-300 mt-1">¥{selectedItem.unitCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">总价值</Label>
                      <p className="font-bold text-yellow-300 mt-1">¥{(selectedItem.quantity * selectedItem.unitCost).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* 供应商与入库信息 */}
                <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                  <h4 className="text-green-300 font-medium mb-3">供应商与入库信息</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-blue-300">供应商</Label>
                      <p className="font-medium text-white mt-1">{selectedItem.supplierName || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">入库日期</Label>
                      <p className="font-medium text-white mt-1">{selectedItem.inboundDate}</p>
                    </div>
                    {selectedItem.expiryDate && (
                      <div>
                        <Label className="text-blue-300">有效期至</Label>
                        <p className="font-medium text-white mt-1">{selectedItem.expiryDate}</p>
                      </div>
                    )}
                    {selectedItem.furnaceNo && (
                      <div>
                        <Label className="text-blue-300">炉批号</Label>
                        <p className="font-medium text-white mt-1">{selectedItem.furnaceNo}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 期间流水与库龄 */}
                <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
                  <h4 className="text-purple-300 font-medium mb-3">期间流水与库龄</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-blue-300">期初</Label>
                      <p className="font-medium text-white mt-1">{selectedItem.openingBalance ?? 0} {selectedItem.unit}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">本月入库</Label>
                      <p className="font-medium text-green-300 mt-1">+{selectedItem.monthlyInbound ?? 0} {selectedItem.unit}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">本月出库</Label>
                      <p className="font-medium text-red-300 mt-1">-{selectedItem.monthlyOutbound ?? 0} {selectedItem.unit}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">结存</Label>
                      <p className="font-bold text-white mt-1">{selectedItem.quantity} {selectedItem.unit}</p>
                    </div>
                    <div>
                      <Label className="text-blue-300">库龄</Label>
                      <p className={`font-bold mt-1 ${selectedItem.agingDays > 30 ? 'text-red-400' : 'text-white'}`}>
                        {selectedItem.agingDays ?? 0} 天
                        {selectedItem.agingDays > 30 && <span className="ml-1 text-xs">⚠️ 超期</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 创建信息 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-blue-300">创建人</Label>
                    <p className="font-medium text-white mt-1">{selectedItem.createUser}</p>
                  </div>
                  <div>
                    <Label className="text-blue-300">创建时间</Label>
                    <p className="font-medium text-white mt-1">{selectedItem._createTime}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-blue-500/20 shrink-0">
            <Button onClick={() => setIsViewOpen(false)} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500">
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
