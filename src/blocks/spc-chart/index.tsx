import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateSPC, detectSPCWarnings, getProcessCapabilityRating } from '@/lib/spc'

interface SPCChartBlockProps {
  data: number[]
  ucl?: number
  lcl?: number
  title?: string
  showWarnings?: boolean
  height?: number
}

export function SPCChartBlock({
  data,
  ucl,
  lcl,
  title = 'Xbar控制图',
  showWarnings = true,
  height = 256
}: SPCChartBlockProps) {
  const spcData = useMemo(() => calculateSPC(data, ucl, lcl), [data, ucl, lcl])
  const warnings = useMemo(() => detectSPCWarnings(data, spcData), [data, spcData])
  const capabilityRating = useMemo(() => getProcessCapabilityRating(spcData.cpk), [spcData.cpk])

  const { mean, ucl: finalUcl, lcl: finalLcl, cpk, cp, withinLimits, outOfControlIndices } = spcData

  // 计算Y轴范围
  const max = Math.max(...data, finalUcl)
  const min = Math.min(...data, finalLcl)
  const range = max - min || 1
  const padding = range * 0.1

  const chartMax = max + padding
  const chartMin = min - padding
  const chartRange = chartMax - chartMin

  // 生成数据点的坐标
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100
    const y = ((d - chartMin) / chartRange) * 100
    return { x, y, value: d, index: i, isOut: outOfControlIndices?.includes(i) }
  })

  return (
    <Card className="p-6">
      {/* 标题和统计信息 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>样本数: {data.length}</span>
            <span>均值: {mean.toFixed(4)}</span>
            <span>标准差: {spcData.stdDev.toFixed(4)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${capabilityRating.color}`}>
            {cpk.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">CPK</div>
          <div className="text-xs text-gray-400">{capabilityRating.description}</div>
        </div>
      </div>

      {/* 控制限图 */}
      <div className="relative" style={{ height: `${height}px` }}>
        {/* 网格线 */}
        <svg className="absolute inset-0 w-full h-full">
          {/* 水平网格线 */}
          {[0, 0.25, 0.5, 0.75, 1].map(p => (
            <line
              key={p}
              x1="0"
              y1={`${p * 100}%`}
              x2="100%"
              y2={`${p * 100}%`}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* UCL线 */}
          <line
            x1="0"
            y1={`${((finalUcl - chartMin) / chartRange) * 100}%`}
            x2="100%"
            y2={`${((finalUcl - chartMin) / chartRange) * 100}%`}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* 中心线 */}
          <line
            x1="0"
            y1={`${((mean - chartMin) / chartRange) * 100}%`}
            x2="100%"
            y2={`${((mean - chartMin) / chartRange) * 100}%`}
            stroke="#22c55e"
            strokeWidth="2"
          />

          {/* LCL线 */}
          <line
            x1="0"
            y1={`${((finalLcl - chartMin) / chartRange) * 100}%`}
            x2="100%"
            y2={`${((finalLcl - chartMin) / chartRange) * 100}%`}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* 数据连线 */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={points.map(p => `${p.x}%,${100 - p.y}%`).join(' ')}
          />

          {/* 数据点 */}
          {points.map((p) => (
            <circle
              key={p.index}
              cx={`${p.x}%`}
              cy={`${100 - p.y}%`}
              r="4"
              fill={p.isOut ? '#ef4444' : '#3b82f6'}
              className={p.isOut ? 'animate-pulse' : ''}
            />
          ))}
        </svg>

        {/* 控制限标签 */}
        <div className="absolute left-0 top-0 h-full w-full pointer-events-none">
          <div
            className="absolute text-xs text-red-600 -mt-5"
            style={{ top: `${((finalUcl - chartMin) / chartRange) * 100}%` }}
          >
            UCL={finalUcl.toFixed(4)}
          </div>
          <div
            className="absolute text-xs text-green-600 -mt-3"
            style={{ top: `${((mean - chartMin) / chartRange) * 100}%` }}
          >
            Xbar={mean.toFixed(4)}
          </div>
          <div
            className="absolute text-xs text-red-600 -mt-1"
            style={{ top: `${((finalLcl - chartMin) / chartRange) * 100}%` }}
          >
            LCL={finalLcl.toFixed(4)}
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="mt-4 grid grid-cols-5 gap-4 text-center">
        <div>
          <div className="text-xl font-bold text-blue-600">{cpk.toFixed(2)}</div>
          <div className="text-xs text-gray-500">CPK</div>
        </div>
        <div>
          <div className="text-xl font-bold text-green-600">{cp.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Cp</div>
        </div>
        <div>
          <div className="text-xl font-bold">{data.length}</div>
          <div className="text-xs text-gray-500">样本数</div>
        </div>
        <div>
          <div className="text-xl font-bold text-red-600">
            {outOfControlIndices?.length || 0}
          </div>
          <div className="text-xs text-gray-500">超差点</div>
        </div>
        <div>
          <Badge variant={withinLimits ? 'success' : 'error'}>
            {withinLimits ? '受控' : '失控'}
          </Badge>
          <div className="text-xs text-gray-500 mt-1">状态</div>
        </div>
      </div>

      {/* 预警信息 */}
      {showWarnings && warnings.length > 0 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-sm font-medium text-orange-800 mb-2">
            ⚠️ 检测到 {warnings.length} 个异常
          </div>
          <div className="space-y-1">
            {warnings.slice(0, 3).map((warning, i) => (
              <div key={i} className="text-xs text-orange-700">
                • {warning.message}
              </div>
            ))}
            {warnings.length > 3 && (
              <div className="text-xs text-orange-600">
                ...还有 {warnings.length - 3} 个异常
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
