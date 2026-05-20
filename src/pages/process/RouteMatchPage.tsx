/**
 * 调度匹配页面
 * 左侧：调度路线列表（参考）
 * 右侧：匹配条件输入 + 匹配结果列表
 */

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'
import { toast } from 'sonner'
import {
  CheckCircle,
  Search,
  Target,
  Clock,
  Settings,
  ArrowRight,
} from 'lucide-react'
import { LoadingDots } from '@/components/ui/loading-dots'

const tableId = '工艺路线表'

interface MatchResult {
  route: any
  matchScore: number
  matchReasons: string[]
}

const RouteMatchContent: React.FC = () => {
  const { items, loading: modelLoading } = useModelList()

  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const hasInitialized = useRef(false)

  // 匹配条件
  const [matchProductCode, setMatchProductCode] = useState('')
  const [matchQuantity, setMatchQuantity] = useState('')
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [matching, setMatching] = useState(false)

  const routes = items as any[]
  const loading = modelLoading

  useEffect(() => {
    if (!hasInitialized.current && routes.length > 0 && !selectedId) {
      const first = routes[0]
      const id = first.id || first._id || first['serial-number']
      setSelectedId(id)
      setSelectedItem(first)
      hasInitialized.current = true
    }
  }, [routes, selectedId])

  useEffect(() => {
    if (selectedId && routes.length > 0) {
      const found = routes.find(r => (r.id || r._id || r['serial-number']) === selectedId)
      if (found) setSelectedItem(found)
    }
  }, [selectedId, routes])

  // 执行匹配
  const handleMatch = async () => {
    if (!matchProductCode.trim()) {
      toast.error('请输入产品编码')
      return
    }

    setMatching(true)
    // 模拟匹配过程
    await new Promise(r => setTimeout(r, 600))

    const qty = parseInt(matchQuantity) || 0

    // 从当前列表中筛选匹配项
    const results = routes
      .map(route => {
        let score = 0.3
        const reasons: string[] = []

        // 产品编码匹配
        const rCode = route.productCode || route['产品编码'] || ''
        const rName = route.productName || route['产品名称'] || ''
        if (rCode === matchProductCode) {
          score += 0.4
          reasons.push('产品编码匹配')
        } else if (rName.includes(matchProductCode)) {
          score += 0.2
          reasons.push('产品名称部分匹配')
        }

        // 状态可用
        const status = route.status || 'draft'
        if (status === 'active') {
          score += 0.15
          reasons.push('路线可用')
        }

        // 产能满足（如果有工序数量作为参考）
        const processes = route.processes || route['工序'] || route['工序列表'] || []
        const procArray = Array.isArray(processes) ? processes : []
        if (procArray.length > 0) {
          score += 0.15
          reasons.push('调度适用')
        }

        return {
          route,
          matchScore: Math.min(score, 1),
          matchReasons: reasons,
        }
      })
      .filter(r => r.matchScore >= 0.4)
      .sort((a, b) => b.matchScore - a.matchScore)

    setMatchResults(results)
    setMatching(false)

    if (results.length === 0) {
      toast.info('未找到匹配的调度路线')
    } else {
      toast.success(`找到 ${results.length} 条匹配路线`)
    }
  }

  // 快速填充：用左侧选中路线的信息填充匹配条件
  const handleFillFromSelected = () => {
    if (!selectedItem) return
    setMatchProductCode(selectedItem.productCode || selectedItem['产品编码'] || '')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 左侧：路线列表 */}
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
          style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <CardContent className="p-3">
            {loading ? (
              <LoadingDots />
            ) : routes.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>暂无调度路线</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {routes.slice(0, 10).map((r, index) => {
                  const id = r.id || r._id || r['serial-number'] || index
                  const name = r.routeCode || r['路线编码'] || r.name || '未命名路线'
                  const product = r.productName || r['产品名称'] || ''
                  const productCode = r.productCode || r['产品编码'] || ''
                  return (
                    <div
                      key={id}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${selectedId === id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-blue-400/30 bg-blue-500/5 hover:bg-blue-500/10'
                        }`}
                      onClick={() => setSelectedId(id)}
                    >
                      <div className="font-medium text-white text-sm">{name}</div>
                      <div className="text-xs text-blue-200 truncate">
                        {product}{productCode ? ` (${productCode})` : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右侧：匹配区域 */}
        <div className="lg:col-span-3 space-y-4">
          {/* 匹配条件输入 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
            style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-100 text-base flex items-center gap-2">
                <Search className="w-4 h-4" />
                匹配条件
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-4 items-end">
                <div>
                  <Label className="text-xs text-blue-200">产品编码 *</Label>
                  <input
                    className="w-full px-3 py-1.5 mt-1 text-sm bg-blue-500/10 border border-blue-400/30 rounded-lg text-white placeholder:text-blue-300/50"
                    placeholder="输入产品编码"
                    value={matchProductCode}
                    onChange={e => setMatchProductCode(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-blue-200">数量</Label>
                  <input
                    className="w-full px-3 py-1.5 mt-1 text-sm bg-blue-500/10 border border-blue-400/30 rounded-lg text-white placeholder:text-blue-300/50"
                    placeholder="计划数量"
                    type="number"
                    value={matchQuantity}
                    onChange={e => setMatchQuantity(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleFillFromSelected}
                    className="text-blue-200 border-blue-400/30 hover:bg-blue-500/20 whitespace-nowrap"
                  >
                    快速填充
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={handleMatch}
                  disabled={matching}
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 whitespace-nowrap"
                >
                  {matching ? (
                    <div className="inline-block animate-spin rounded-full h-3 w-3 border border-transparent border-t-white mr-1" />
                  ) : (
                    <Target className="w-3 h-3 mr-1" />
                  )}
                  开始匹配
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 匹配结果 */}
          {matchResults.length > 0 ? (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-100 text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  匹配结果 ({matchResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {matchResults.map((result, idx) => {
                  const r = result.route
                  const scorePercent = Math.round(result.matchScore * 100)
                  return (
                    <div
                      key={idx}
                      className="p-4 border border-blue-400/30 rounded-lg bg-blue-500/5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-cyan-300">{scorePercent}%</span>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {r.routeCode || r['路线编码'] || r.name || '-'}
                            </p>
                            <p className="text-xs text-blue-200">
                              {r.productName || r['产品名称'] || '-'}
                              {r.version ? ` | 版本 ${r.version}` : ''}
                            </p>
                          </div>
                        </div>
                        {/* 匹配度进度条 */}
                        <div className="w-32">
                          <div className="h-2 rounded-full bg-blue-500/20 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${scorePercent >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                                scorePercent >= 50 ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                                  'bg-gradient-to-r from-yellow-400 to-orange-400'
                                }`}
                              style={{ width: `${scorePercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 匹配原因 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <ArrowRight className="w-3 h-3 text-blue-300" />
                        {result.matchReasons.map((reason, ri) => (
                          <Badge key={ri} variant="outline" className="text-xs text-blue-200 border-blue-400/20">
                            {reason}
                          </Badge>
                        ))}
                      </div>

                      {/* 路线工序列表摘要 */}
                      {(() => {
                        const procs = r.processes || r['工序'] || r['工序列表'] || []
                        const procArray = Array.isArray(procs) ? procs : []
                        if (procArray.length === 0) return null
                        return (
                          <div className="mt-3 pt-3 border-t border-blue-400/20 flex gap-3 flex-wrap">
                            {procArray.slice(0, 5).map((p: any, pi: number) => (
                              <span key={pi} className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/20">
                                {p.processNo || `OP${(pi + 1) * 10}`} {p.processName || ''}
                              </span>
                            ))}
                            {procArray.length > 5 && (
                              <span className="text-xs text-blue-300">+{procArray.length - 5} 工序</span>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ) : matchResults.length === 0 && matchProductCode && !matching ? (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardContent className="p-8 text-center text-blue-200">
                <Search className="w-12 h-12 mx-auto mb-2 text-blue-300" />
                <p>未找到匹配的调度路线，请调整匹配条件</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <CardContent className="p-8 text-center text-blue-200">
                <Target className="w-12 h-12 mx-auto mb-2 text-blue-300" />
                <p>输入产品编码后点击"开始匹配"</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export function RouteMatchPage() {
  return (
    <div className="space-y-0">
      <ViewModel tableId={tableId} initQuery={true}>
        <RouteMatchContent />
      </ViewModel>
    </div>
  )
}

export default RouteMatchPage
