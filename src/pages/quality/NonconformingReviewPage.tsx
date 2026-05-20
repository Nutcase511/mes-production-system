/**
 * 不合格品审理页面
 * 关联入库记录，追溯来源
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
import { LoadingDots } from '@/components/ui/loading-dots'
import { toast } from 'sonner'
import {
  AlertTriangle,
  FileCheck,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowDownCircle
} from 'lucide-react'

const tableId = '不合格品审理'

// 审理结论
const CONCLUSION_OPTIONS = [
  { value: 'A', label: 'A类-报废' },
  { value: 'B', label: 'B类-返修/返工' },
  { value: 'C', label: 'C类-让步接收' },
  { value: 'pending', label: '待审理' }
]

// 处理意见
const DISPOSAL_OPTIONS = [
  { value: 'scrap', label: '报废' },
  { value: 'rework', label: '返修' },
  { value: 'downgrade', label: '降级使用' },
  { value: 'return', label: '退货' },
  { value: 'concession', label: '让步接收' }
]

const NonconformingReviewContent: React.FC = () => {
  const { items, loading } = useModelList()
  const { saveItem } = useModelSave()
  const { getItems } = useModelGetItems()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<any>({
    nc_date: new Date().toISOString().split('T')[0],
    conclusion: 'pending',
    status: 'pending'
  })

  const reviews = items as any[]

  // 状态统计
  const statusCount = {
    pending: reviews.filter(r => r.status === 'pending').length,
    processing: reviews.filter(r => r.status === 'processing').length,
    completed: reviews.filter(r => r.status === 'completed').length
  }

  // 生成不合格品审理单号
  const generateId = () => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const seq = String(reviews.length + 1).padStart(3, '0')
    return `NC-${dateStr}-${seq}`
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.material_name || !formData.quantity) {
      toast.error('请填写必填项')
      return
    }

    try {
      const newReview = {
        ...formData,
        id: generateId(),
        created_at: new Date().toISOString()
      }
      await saveItem(newReview)
      await getItems()
      setShowForm(false)
      setFormData({
        nc_date: new Date().toISOString().split('T')[0],
        conclusion: 'pending',
        status: 'pending'
      })
      toast.success('不合格品审理单创建成功')
    } catch (error) {
      toast.error('创建失败，请稍后重试')
    }
  }

  const getConclusionBadge = (conclusion: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-red-500',
      'B': 'bg-orange-500',
      'C': 'bg-yellow-500',
      'pending': 'bg-gray-500'
    }
    const option = CONCLUSION_OPTIONS.find(o => o.value === conclusion)
    return (
      <Badge className={`${colors[conclusion] || 'bg-gray-500'} text-white`}>
        {option?.label || conclusion}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            不合格品审理
          </h2>
          <p className="text-sm text-blue-200 mt-1">
            关联入库记录，追溯来源
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? '返回列表' : '新建审理单'}
        </Button>
      </div>

      {/* 状态统计 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="backdrop-blur-xl bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-200">待审理</p>
                <p className="text-2xl font-bold text-yellow-400">{statusCount.pending}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-200">审理中</p>
                <p className="text-2xl font-bold text-blue-400">{statusCount.processing}</p>
              </div>
              <FileCheck className="w-8 h-8 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-200">已完成</p>
                <p className="text-2xl font-bold text-green-400">{statusCount.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm ? (
        /* 新建表单 */
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader>
            <CardTitle className="text-blue-100">新建不合格品审理单</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-200 border-b border-blue-400/30 pb-2">
                基本信息
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-blue-200">关联入库单号</Label>
                  <Input
                    value={formData.inbound_record_id || ''}
                    onChange={(e) => setFormData({ ...formData, inbound_record_id: e.target.value })}
                    placeholder="输入入库记录单号"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">发现日期 *</Label>
                  <Input
                    type="date"
                    value={formData.nc_date}
                    onChange={(e) => setFormData({ ...formData, nc_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-blue-200">发现阶段</Label>
                  <Input
                    value={formData.discovery_stage || ''}
                    onChange={(e) => setFormData({ ...formData, discovery_stage: e.target.value })}
                    placeholder="如：进厂检验"
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
                  <Label className="text-blue-200">规格型号</Label>
                  <Input
                    value={formData.spec || ''}
                    onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                    placeholder="请输入规格型号"
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
                  <Label className="text-blue-200">不合格数量 *</Label>
                  <Input
                    type="number"
                    value={formData.quantity || 0}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* 不合格描述 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-200 border-b border-blue-400/30 pb-2">
                不合格描述
              </h3>
              <div>
                <Label className="text-blue-200">不合格现象描述 *</Label>
                <Textarea
                  value={formData.nc_description || ''}
                  onChange={(e) => setFormData({ ...formData, nc_description: e.target.value })}
                  placeholder="请描述不合格现象"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-blue-200">原因分析</Label>
                <Textarea
                  value={formData.root_cause || ''}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                  placeholder="请分析原因"
                  rows={2}
                />
              </div>
            </div>

            {/* 审理意见 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-200 border-b border-blue-400/30 pb-2">
                审理意见
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-blue-200">审理结论</Label>
                  <Select
                    value={formData.conclusion}
                    onValueChange={(value) => setFormData({ ...formData, conclusion: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONCLUSION_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-blue-200">处理意见</Label>
                  <Select
                    value={formData.disposal}
                    onValueChange={(value) => setFormData({ ...formData, disposal: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISPOSAL_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-blue-200">审理人</Label>
                  <Input
                    value={formData.reviewer || ''}
                    onChange={(e) => setFormData({ ...formData, reviewer: e.target.value })}
                    placeholder="请输入审理人"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">审理日期</Label>
                  <Input
                    type="date"
                    value={formData.review_date || ''}
                    onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit}>
                <CheckCircle className="w-4 h-4 mr-2" />
                提交审理单
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* 列表视图 */
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardHeader>
            <CardTitle className="text-blue-100">不合格品审理列表 ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <LoadingDots />
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400/50" />
                <p>暂无不合格品审理记录</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-400/30">
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">审理单号</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">关联入库单号</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">物资名称</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">批次号</th>
                      <th className="text-right py-2 px-3 text-blue-200 font-medium">不合格数量</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">审理结论</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">发现日期</th>
                      <th className="text-left py-2 px-3 text-blue-200 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.slice(0, 20).map((review, index) => (
                      <tr key={review.id || index} className="border-b border-blue-400/20 hover:bg-blue-500/10">
                        <td className="py-2 px-3 text-cyan-300 font-medium">{review.id || '-'}</td>
                        <td className="py-2 px-3 text-blue-100">{review.inbound_record_id || '-'}</td>
                        <td className="py-2 px-3 text-white">{review.material_name || '-'}</td>
                        <td className="py-2 px-3 text-blue-100">{review.batch_no || '-'}</td>
                        <td className="py-2 px-3 text-right text-red-400">{review.quantity || 0}</td>
                        <td className="py-2 px-3">{getConclusionBadge(review.conclusion || 'pending')}</td>
                        <td className="py-2 px-3 text-blue-100">{review.nc_date || '-'}</td>
                        <td className="py-2 px-3">
                          <Badge className={`${review.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                            {review.status === 'completed' ? '已完成' : '待审理'}
                          </Badge>
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

export function NonconformingReviewPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <NonconformingReviewContent />
    </ViewModel>
  )
}

export default NonconformingReviewPage
