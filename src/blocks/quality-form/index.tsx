import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { QualityCheck, CheckItem } from '@/types/quality'

interface QualityFormBlockProps {
  workOrderId: string
  workOrderData?: any // 添加跟单完整数据
  onSubmit: (data: QualityCheck) => void
}

export function QualityFormBlock({ workOrderId, workOrderData, onSubmit }: QualityFormBlockProps) {
  // 状态声明
  const [productCode, setProductCode] = useState<string>('') // 产品代号
  const [processNames, setProcessNames] = useState<string>('') // 工序名称
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<CheckItem[]>([]) // 检验项目列表
  const [result, setResult] = useState<'合格' | '返修' | '报废'>('合格')
  const [remarks, setRemarks] = useState('')

  // 解析跟单数据并生成检验项目
  useEffect(() => {
    if (workOrderData) {
      // 获取产品代号
      const code = workOrderData.productCode || '未知产品'
      setProductCode(code)

      // 获取工序名称：从 processRecord 数组中提取
      let process = '未知工序'
      if (workOrderData.processRecord && Array.isArray(workOrderData.processRecord) && workOrderData.processRecord.length > 0) {
        const names = workOrderData.processRecord
          .map((pr: any) => pr.processName)
          .filter((name: string) => name)
        if (names.length > 0) {
          process = names.join('、')
        }

        // 根据 processRecord 生成检验项目
        const checkItems: CheckItem[] = workOrderData.processRecord.map((pr: any, index: number) => ({
          itemNo: `IT${String(index + 1).padStart(3, '0')}`,
          itemName: pr.processName || `工序${index + 1}`,
          method: '三坐标',
          standard: '按图纸要求',
          measuredValue: undefined as any,
          qualified: true,
          // 保存完整的 processRecord 数据，用于后续展示
          processRecordData: pr
        }))
        setItems(checkItems)
      } else if (workOrderData.processName || workOrderData.process_name) {
        process = workOrderData.processName || workOrderData.process_name
        // 如果没有 processRecord，创建一个默认检验项目
        setItems([{
          itemNo: 'IT001',
          itemName: process,
          method: '三坐标',
          standard: '按图纸要求',
          measuredValue: undefined as any,
          qualified: true
        }])
      } else {
        // 如果没有任何工序信息，创建一个空的检验项目
        setItems([{
          itemNo: 'IT001',
          itemName: '默认检验项',
          method: '三坐标',
          standard: '按图纸要求',
          measuredValue: undefined as any,
          qualified: true
        }])
      }

      setProcessNames(process)
      setLoading(false)
    }
  }, [workOrderData])

  const handleSubmit = () => {
    // 构建 processRecord 数据用于提交
    const processRecords = items.map(item => ({
      ...(item.processRecordData || {}),
      qualifiedQuantity: item.processRecordData?.qualifiedQuantity || 0,
      outOfToleranceQuantity: item.processRecordData?.outOfToleranceQuantity || 0,
      scrapQuantity: item.processRecordData?.scrapQuantity || 0,
      qualified: item.qualified
    }))

    // 计算合格率
    const qualifiedCount = items.filter(i => i.qualified).length
    const qualifiedRate = items.length > 0 ? (qualifiedCount / items.length) * 1.67 : 0

    const data: QualityCheck = {
      id: `check-${Date.now()}`,
      checkId: `QC${Date.now()}`,
      woId: workOrderId,
      batchNo: `B${Date.now()}`,
      checkType: 'first',
      inspector: '检验员',
      checkTime: new Date().toISOString(),
      items,
      processRecords, // 包含完整的 processRecord 数据
      cpk: parseFloat(qualifiedRate.toFixed(2)),
      result,
      defectLevel: result !== '合格' ? 'Class II' : undefined
    }

    onSubmit(data)
  }

  const handleItemChange = (index: number, field: keyof CheckItem | string, value: any) => {
    const newItems = [...items]
    const item = { ...newItems[index] }

    // 如果是 processRecordData 的字段，更新 processRecordData
    if (['qualifiedQuantity', 'outOfToleranceQuantity', 'scrapQuantity'].includes(field as string)) {
      item.processRecordData = {
        ...(item.processRecordData || {}),
        [field]: value
      }
    } else {
      // 其他字段（如 qualified）
      ;(item as any)[field] = value
    }

    newItems[index] = item
    setItems(newItems)
  }

  return (
    <Card className="backdrop-blur-2xl bg-white/95 hover:bg-white/95 rounded-3xl overflow-hidden" style={{
      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), 0 0 60px rgba(168, 85, 247, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.2)'
    }}>
      <CardHeader className="bg-gradient-to-r from-blue-400 to-cyan-400 border-b border-white/20">
        <CardTitle className="text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">首件检验</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 跟单信息 - 纯白磨砂玻璃质感 */}
        <div className="relative p-6 rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
          {/* 数据波纹纹理背景 */}
          <div className="absolute inset-0 opacity-5" style={{
            background: 'repeating-radial-gradient(circle at 20% 50%, transparent 0, transparent 2px, rgba(59, 130, 246, 0.3) 2px, rgba(59, 130, 246, 0.3) 4px), repeating-radial-gradient(circle at 80% 80%, transparent 0, transparent 2px, rgba(168, 85, 247, 0.3) 2px, rgba(168, 85, 247, 0.3) 4px)',
            backgroundSize: '40px 40px'
          }}></div>

          <div className="relative">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">跟单号</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]" style={{
                  fontFamily: 'ui-monospace, monospace'
                }}>
                  {workOrderId}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">产品代号</p>
                <p className="text-xl font-semibold text-slate-800">
                  {loading ? '加载中...' : productCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">工序</p>
                <p className="text-xl font-semibold text-slate-800">
                  {loading ? '加载中...' : processNames}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 检验项目 - 科技风表格 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 text-lg">检验项目</h3>
          <div className="border border-slate-300/50 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(59,130,246,0.08)]">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-400 to-cyan-400">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white border-b border-white-20 w-32">工序编号</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white border-b border-white-20 w-40">工序名称</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white border-b border-white-20 w-32">操作工</th>
                  <th className="px-3 py-3 text-center text-sm font-semibold text-white border-b border-white-20 w-24">合格数量</th>
                  <th className="px-3 py-3 text-center text-sm font-semibold text-white border-b border-white/20 w-24">超标数量</th>
                  <th className="px-3 py-3 text-center text-sm font-semibold text-white border-b border-white-20 w-24">报废数量</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.itemNo}
                    className={`border-t border-slate-200/50 ${
                      index % 2 === 0 ? 'bg-slate-50/50' : 'bg-transparent'
                    } hover:bg-blue-50/30 transition-colors`}
                  >
                    <td className="px-4 py-3 text-slate-800">{item.processRecordData?.processNo || '-'}</td>
                    <td className="px-4 py-3 text-slate-800">{item.processRecordData?.processName || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{item.processRecordData?.operator || '-'}</td>
                    <td className="px-3 py-3 text-center">
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        value={item.processRecordData?.qualifiedQuantity ?? 0}
                        onChange={(e) => {
                          const newVal = e.target.value ? parseInt(e.target.value) : undefined
                          handleItemChange(index, 'qualifiedQuantity', newVal)
                        }}
                        placeholder="0"
                        className="w-16 h-8 bg-white/80 border-2 border-blue-300/50 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.15)] focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all text-slate-800 text-center text-sm"
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        value={item.processRecordData?.outOfToleranceQuantity ?? 0}
                        onChange={(e) => {
                          const newVal = e.target.value ? parseInt(e.target.value) : undefined
                          handleItemChange(index, 'outOfToleranceQuantity', newVal)
                        }}
                        placeholder="0"
                        className="w-16 h-8 bg-white/80 border-2 border-blue-300/50 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.15)] focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all text-slate-800 text-center text-sm"
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        value={item.processRecordData?.scrapQuantity ?? 0}
                        onChange={(e) => {
                          const newVal = e.target.value ? parseInt(e.target.value) : undefined
                          handleItemChange(index, 'scrapQuantity', newVal)
                        }}
                        placeholder="0"
                        className="w-16 h-8 bg-white/80 border-2 border-blue-300/50 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.15)] focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all text-slate-800 text-center text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50">
          <div className="flex items-center gap-6">
            <div>
              <Label className="text-slate-700 font-medium">总工序数:</Label>
              <span className="text-2xl font-bold text-slate-800 ml-2">{items.length}</span>
            </div>
            <div>
              <Label className="text-slate-700 font-medium">合格工序:</Label>
              <span className="text-2xl font-bold text-green-600 ml-2">
                {items.filter(i => i.qualified).length}
              </span>
            </div>
            <div>
              <Label className="text-slate-700 font-medium">不合格工序:</Label>
              <span className="text-2xl font-bold text-red-600 ml-2">
                {items.filter(i => !i.qualified).length}
              </span>
            </div>
          </div>
        </div>

        {/* 检验结论 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 text-lg">检验结论</h3>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="result"
                checked={result === '合格'}
                onChange={() => setResult('合格')}
                className="w-5 h-5 text-green-600 border-slate-300 focus:ring-green-500"
              />
              <span className="text-slate-700">合格</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="result"
                checked={result === '返修'}
                onChange={() => setResult('返修')}
                className="w-5 h-5 text-yellow-600 border-slate-300 focus:ring-yellow-500"
              />
              <span className="text-slate-700">返修</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="result"
                checked={result === '报废'}
                onChange={() => setResult('报废')}
                className="w-5 h-5 text-red-600 border-slate-300 focus:ring-red-500"
              />
              <span className="text-slate-700">报废</span>
            </label>
          </div>
        </div>

        {/* 备注 */}
        <div>
          <Label className="text-slate-700 font-medium">备注</Label>
          <textarea
            className="w-full bg-white/80 border-2 border-slate-300/50 rounded-xl p-4 mt-2 focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all text-slate-800 placeholder:text-slate-400 resize-none"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="请输入备注信息..."
          />
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_25px_rgba(34,211,238,0.5)] transition-all px-8"
          >
            提交检验
          </Button>
          <Button
            variant="outline"
            className="border-cyan-500/60 text-cyan-600 hover:bg-cyan-50 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
          >
            保存草稿
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
