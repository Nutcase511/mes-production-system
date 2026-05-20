import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SPCChartBlock } from '@/blocks/spc-chart'
import { generateSPCSamples, getProcessCapabilityRating, calculateSPC, detectSPCWarnings } from '@/lib/spc'
import { cn } from '@/lib/utils'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList } from '@airiot/client'

const tableId = 'SPC数据'

const Content = () => {
  const { items, loading } = useModelList()
  const [productName, setProductName] = useState('产品A')
  const [processName, setProcessName] = useState('OP10精加工')
  const [checkItemName, setCheckItemName] = useState('尺寸1')
  const [targetValue, setTargetValue] = useState('50.00')
  const [tolerance, setTolerance] = useState('±0.02')
  const [sampleCount, setSampleCount] = useState(25)
  const [data, setData] = useState<number[]>([])

  // 生成模拟数据
  const handleGenerateData = () => {
    const mean = parseFloat(targetValue)
    const stdDev = parseFloat(tolerance.replace('±', '')) / 3
    const samples = generateSPCSamples(mean, stdDev, sampleCount)
    setData(samples)
  }

  // 初始生成一些数据
  useEffect(() => {
    const mean = 50
    const stdDev = 0.02 / 3
    setData(generateSPCSamples(mean, stdDev, 25))
  }, [])

  const spcData = data.length > 0 ? calculateSPC(data) : null
  const warnings = data.length > 0 && spcData ? detectSPCWarnings(data, spcData) : []
  const capabilityRating = spcData ? getProcessCapabilityRating(spcData.cpk) : null

  return (
    <div className="space-y-6">
      {/* 分析参数选择 */}
      <Card className="p-4 backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-blue-200">分析参数</h3>
          <Button onClick={handleGenerateData} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]">
            重新生成数据
          </Button>
        </div>
        <div className="grid grid-cols-6 gap-4">
          <div>
            <Label className="text-blue-200">产品</Label>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="产品名称"
              className="bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
            />
          </div>
          <div>
            <Label className="text-blue-200">工序</Label>
            <Input
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="工序名称"
              className="bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
            />
          </div>
          <div>
            <Label className="text-blue-200">检验项</Label>
            <Input
              value={checkItemName}
              onChange={(e) => setCheckItemName(e.target.value)}
              placeholder="检验项名称"
              className="bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
            />
          </div>
          <div>
            <Label className="text-blue-200">目标值</Label>
            <Input
              type="number"
              step="0.01"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
            />
          </div>
          <div>
            <Label className="text-blue-200">公差</Label>
            <Input
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              placeholder="±0.02"
              className="bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
            />
          </div>
          <div>
            <Label className="text-blue-200">样本数</Label>
            <Input
              type="number"
              min="5"
              max="100"
              value={sampleCount}
              onChange={(e) => setSampleCount(parseInt(e.target.value) || 25)}
              className="bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
            />
          </div>
        </div>
      </Card>

      {/* SPC控制图 */}
      {data.length > 0 && (
        <SPCChartBlock
          data={data}
          title={`${productName} - ${processName} - ${checkItemName}`}
          showWarnings={true}
        />
      )}

      {/* 详细分析 */}
      {spcData && (
        <div className="grid grid-cols-2 gap-6">
          {/* 过程能力分析 */}
          <Card className="p-4 backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <h3 className="text-sm font-medium text-blue-200 mb-4">过程能力分析</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-200">CPK</span>
                <span className={`text-2xl font-bold ${capabilityRating?.color}`}>
                  {spcData.cpk.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-200">Cp</span>
                <span className="text-xl font-semibold text-green-300">
                  {spcData.cp.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-200">过程能力评级</span>
                <span className="text-sm font-medium text-blue-100">{capabilityRating?.description}</span>
              </div>
              <div className="pt-2 border-t border-blue-400/30">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-300">上控制限:</span>
                    <span className="ml-2 font-mono text-white">{spcData.ucl.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-blue-300">下控制限:</span>
                    <span className="ml-2 font-mono text-white">{spcData.lcl.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-blue-300">均值:</span>
                    <span className="ml-2 font-mono text-white">{spcData.mean.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-blue-300">标准差:</span>
                    <span className="ml-2 font-mono text-white">{spcData.stdDev.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 异常预警 */}
          <Card className="p-4 backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <h3 className="text-sm font-medium text-blue-200 mb-4">异常检测</h3>
            <div className="space-y-2">
              {warnings.length === 0 ? (
                <div className="text-center py-8 text-green-300">
                  <div className="text-4xl mb-2">✓</div>
                  <div className="text-sm font-medium text-white">未检测到异常</div>
                  <div className="text-xs text-blue-200">过程处于受控状态</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {warnings.map((warning, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded border backdrop-blur-sm",
                        warning.severity === 'error' && "bg-red-500/20 border-red-400/50",
                        warning.severity === 'warning' && "bg-yellow-500/20 border-yellow-400/50",
                        warning.severity === 'info' && "bg-blue-500/20 border-blue-400/50"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {warning.severity === 'error' && '⛔'}
                          {warning.severity === 'warning' && '⚠️'}
                          {warning.severity === 'info' && 'ℹ️'}
                        </span>
                        <div className="flex-1">
                          <div className={cn(
                            "text-sm font-medium",
                            warning.severity === 'error' && "text-red-200",
                            warning.severity === 'warning' && "text-yellow-200",
                            warning.severity === 'info' && "text-blue-200"
                          )}>
                            {warning.type === 'out_of_control' && '超出控制限'}
                            {warning.type === 'trend' && '趋势异常'}
                            {warning.type === 'clustering' && '簇集异常'}
                            {warning.type === 'cycle' && '周期性异常'}
                          </div>
                          <div className={cn(
                            "text-xs mt-1",
                            warning.severity === 'error' && "text-red-300",
                            warning.severity === 'warning' && "text-yellow-300",
                            warning.severity === 'info' && "text-blue-300"
                          )}>
                            {warning.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 统计规则说明 */}
      <Card className="p-4 backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <h3 className="text-sm font-medium text-blue-200 mb-3">Western Electric 异常检测规则</h3>
        <div className="grid grid-cols-2 gap-4 text-xs text-blue-200">
          <div className="flex items-start gap-2">
            <span className="font-mono bg-blue-500/10 px-1 rounded text-blue-100">规则1</span>
            <span>任何点超出控制限 (UCL/LCL)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-blue-500/10 px-1 rounded text-blue-100">规则2</span>
            <span>连续6点单调上升或下降</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-blue-500/10 px-1 rounded text-blue-100">规则3</span>
            <span>连续9点在中心线同一侧</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-blue-500/10 px-1 rounded text-blue-100">说明</span>
            <span>违反任一规则即触发预警</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function SPCPage() {
  return (
    <ViewModel tableId={tableId} initQuery={true}>
      <Content />
    </ViewModel>
  )
}
