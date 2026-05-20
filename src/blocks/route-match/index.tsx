import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import type { ProcessRoute, RouteMatchResult } from '@/types/process'

interface RouteMatchBlockProps {
  productCode: string
  productName: string
  onRouteSelect?: (route: ProcessRoute) => void
  onMatchNew?: () => void
}

export function RouteMatchBlock({
  productCode,
  productName,
  onRouteSelect,
  onMatchNew
}: RouteMatchBlockProps) {
  const [matchResult, setMatchResult] = useState<RouteMatchResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleMatch = async () => {
    setLoading(true)
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟匹配结果
    const mockResult: RouteMatchResult = {
      type: 'full',
      routes: [
        {
          id: 'route-001',
          routeCode: 'RT0001',
          routeName: `${productName}标准调度路线`,
          productCode,
          productName,
          version: 'V2.0',
          lastUsed: '2025-03-10',
          matchScore: 0.98,
          status: 'active',
          processes: [
            { id: 'p1', processNo: 'OP10', processName: '车削', equipmentType: 'CNC车床', cycleTime: 15, inspectionRule: { requireFirstCheck: true, requirePatrolCheck: true, patrolInterval: 10, requireFinalCheck: false } },
            { id: 'p2', processNo: 'OP20', processName: '铣削', equipmentType: '加工中心', cycleTime: 20, inspectionRule: { requireFirstCheck: true, requirePatrolCheck: true, patrolInterval: 10, requireFinalCheck: false } },
            { id: 'p3', processNo: 'OP30', processName: '精加工', equipmentType: '加工中心', cycleTime: 25, inspectionRule: { requireFirstCheck: true, requirePatrolCheck: true, patrolInterval: 5, requireFinalCheck: false } },
            { id: 'p4', processNo: 'OP40', processName: '检验', equipmentType: '检验设备', cycleTime: 10, inspectionRule: { requireFirstCheck: false, requirePatrolCheck: false, patrolInterval: 0, requireFinalCheck: true } },
          ]
        },
        {
          id: 'route-002',
          routeCode: 'RT0002',
          routeName: `${productName}简化调度路线`,
          productCode,
          productName,
          version: 'V1.0',
          lastUsed: '2025-02-20',
          matchScore: 0.85,
          status: 'active',
          processes: [
            { id: 'p1', processNo: 'OP10', processName: '车削', equipmentType: 'CNC车床', cycleTime: 15, inspectionRule: { requireFirstCheck: true, requirePatrolCheck: false, patrolInterval: 0, requireFinalCheck: false } },
            { id: 'p2', processNo: 'OP20', processName: '精加工', equipmentType: '加工中心', cycleTime: 30, inspectionRule: { requireFirstCheck: true, requirePatrolCheck: true, patrolInterval: 10, requireFinalCheck: true } },
          ]
        }
      ],
      suggestions: [
        '建议使用匹配度最高的调度路线',
        '已验证该调度路线在过去3个月中使用效果良好'
      ]
    }

    setMatchResult(mockResult)
    setLoading(false)
  }

  return (
    <Card className="p-6 backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{
      borderColor: 'rgba(59, 130, 246, 0.3)'
    }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white drop-shadow-md">调度路线匹配</h3>
          <p className="text-sm text-blue-200">
            产品: {productName} ({productCode})
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onMatchNew}
            className="text-blue-100 border-blue-400/40 hover:bg-blue-500/10"
          >
            新建调度
          </Button>
          <Button onClick={handleMatch} disabled={loading} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            {loading ? '匹配中...' : '开始匹配'}
          </Button>
        </div>
      </div>

      {matchResult && (
        <div className="space-y-4">
          {/* 匹配结果概览 */}
          <div className="flex items-center gap-3 p-4 backdrop-blur-sm bg-white/10 rounded-lg border border-blue-400/30">
            {matchResult.type === 'full' && (
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            )}
            {matchResult.type === 'partial' && (
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            )}
            {matchResult.type === 'none' && (
              <XCircle className="w-6 h-6 text-red-400" />
            )}
            <div className="flex-1">
              <Badge
                variant={
                  matchResult.type === 'full' ? 'success' :
                  matchResult.type === 'partial' ? 'warning' : 'error'
                }
                className="mb-1"
              >
                {matchResult.type === 'full' ? '完全匹配' :
                 matchResult.type === 'partial' ? '部分匹配' : '无匹配'}
              </Badge>
              <p className="text-sm text-blue-100">
                找到 {matchResult.routes.length} 条可用调度路线
              </p>
            </div>
          </div>

          {/* 建议 */}
          {matchResult.suggestions && matchResult.suggestions.length > 0 && (
            <div className="p-3 backdrop-blur-sm bg-cyan-500/15 border border-cyan-400/40 rounded-lg">
              <div className="text-sm font-medium text-cyan-100 mb-1">
                💡 匹配建议
              </div>
              {matchResult.suggestions.map((suggestion, i) => (
                <div key={i} className="text-xs text-cyan-200">
                  • {suggestion}
                </div>
              ))}
            </div>
          )}

          {/* 调度路线列表 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">可用调度路线</h4>
            {matchResult.routes.map((route) => (
              <div
                key={route.id}
                className="border rounded-lg p-4 backdrop-blur-sm bg-white/5 hover:bg-white/10 cursor-pointer transition-all border-blue-400/30 hover:border-blue-400/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                onClick={() => onRouteSelect?.(route)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-medium text-white">{route.routeName}</h5>
                    <p className="text-sm text-blue-200">
                      编码: {route.routeCode} | 版本: {route.version}
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      最后使用: {route.lastUsed}
                    </p>
                  </div>
                  <Badge
                    variant={route.matchScore && route.matchScore > 0.9 ? 'success' : 'warning'}
                  >
                    匹配度: {route.matchScore ? `${(route.matchScore * 100).toFixed(0)}%` : '-'}
                  </Badge>
                </div>

                {/* 工序列表 */}
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  {route.processes.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-1">
                      <span className="px-2 py-1 bg-white/10 border border-blue-400/30 rounded text-xs text-blue-100">
                        {p.processNo} {p.processName}
                      </span>
                      {i < route.processes.length - 1 && (
                        <span className="text-blue-300">→</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* 检验规则标记 */}
                <div className="mt-2 flex gap-2 text-xs text-blue-200">
                  {route.processes.some(p => p.inspectionRule.requireFirstCheck) && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                      首检
                    </span>
                  )}
                  {route.processes.some(p => p.inspectionRule.requirePatrolCheck) && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                      巡检
                    </span>
                  )}
                  {route.processes.some(p => p.inspectionRule.requireFinalCheck) && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                      终检
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
