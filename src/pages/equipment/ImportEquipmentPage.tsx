/**
 * 设备数据导入临时页面
 * 导入完成后请删除此文件
 */
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toastApi } from '@/components/ui/toast'
import ViewModel from '@/components/kesi/view-model/view-model'
import { createTableRecordAPI } from '@/lib/airiot-client'

// 设备数据（从图片提取）
const EQUIPMENT_DATA = [
  // ========== 数控铣床类 ==========
  { id: 'X1', name: '四轴数铣-X1', deviceModel: 'X1', brandModel: 'VMX421 立铣（切削液）', manufacturer: '赫克' },
  { id: 'X2', name: '五轴数铣-X2', deviceModel: 'X2', brandModel: 'VF-2', manufacturer: 'HAAS' },
  { id: 'X3', name: '五轴数铣-X3', deviceModel: 'X3', brandModel: 'VF-3', manufacturer: 'HAAS' },
  { id: 'X4', name: '三轴数铣-X4', deviceModel: 'X4', brandModel: 'VF-4', manufacturer: 'HAAS' },
  { id: 'X8', name: '四轴数铣-X8', deviceModel: 'X8', brandModel: 'GXR1000 立铣', manufacturer: '哈挺' },
  { id: 'D1', name: '六米龙门-D1', deviceModel: 'D1', brandModel: 'SNK R8-6VM 龙门（6m五面体）', manufacturer: '新日本工机（SNK）' },
  { id: 'D2', name: '六米龙门-D2', deviceModel: 'D2', brandModel: 'SNK R8-6VM 龙门（6m五面体）', manufacturer: '新日本工机（SNK）' },
  { id: 'X5', name: '大数控车-X5', deviceModel: 'X5', brandModel: 'EC-1600', manufacturer: '赫克' },

  // ========== 数控车床类 ==========
  { id: 'C1', name: '数控车-C1', deviceModel: 'C1', brandModel: 'CTX310', manufacturer: '德国沙尔曼' },
  { id: 'C2', name: '数控车-C2', deviceModel: 'C2', brandModel: 'CTX310', manufacturer: '德国沙尔曼' },
  { id: 'C3', name: '精密数控车床-C3', deviceModel: 'C3', brandModel: 'STC-20', manufacturer: '赫克' },
  { id: 'C4', name: '精密数控车床-C4', deviceModel: 'C4', brandModel: 'STC-20', manufacturer: '赫克' },
  { id: 'C5', name: '数控车-C5', deviceModel: 'C5', brandModel: 'LC-20', manufacturer: '赫克' },
  { id: 'C6', name: '数控车-C6', deviceModel: 'C6', brandModel: 'LC-20', manufacturer: '赫克' },

  // ========== 磨床类 ==========
  { id: 'C13', name: '数控外圆磨床-C13', deviceModel: 'C13', brandModel: 'UR175/1000', manufacturer: 'KELLEMBERGER琼士' },
  { id: 'C14', name: '数控万能内外圆磨床-C14', deviceModel: 'C14', brandModel: 'J10 1000U', manufacturer: '哈挺精密机械' },
  { id: 'C16', name: '高精度数控无心磨床-C16', deviceModel: 'C16', brandModel: 'MGK1505-3A', manufacturer: '无锡一机磨床' },
  { id: 'C22', name: '高精平面磨床-C22', deviceModel: 'C22', brandModel: 'MG7125', manufacturer: '天津机床厂' },
  { id: 'C23', name: '高精度平面磨床-C23', deviceModel: 'C23', brandModel: 'MM7132B', manufacturer: '杭州机床厂' },
  { id: 'C24', name: '高精外圆磨床-C24', deviceModel: 'C24', brandModel: 'MG1420C', manufacturer: '北京二机床厂' },

  // ========== 线切割类 ==========
  { id: 'C17', name: '快走丝线切割机床-C17', deviceModel: 'C17', brandModel: 'DK7732Z', manufacturer: '江苏冬庆数控机床' },
  { id: 'C18', name: '快走丝线切割机床-C18', deviceModel: 'C18', brandModel: 'DK7732Z', manufacturer: '江苏冬庆数控机床' },
  { id: 'C19', name: '线切割机床-C19', deviceModel: 'C19', brandModel: 'DK7750Z12', manufacturer: '江苏冬庆数控机床' },
  { id: 'C20', name: '慢走丝切割机床-C20', deviceModel: 'C20', brandModel: 'CUT200P', manufacturer: '阿奇夏米尔' },

  // ========== 其他设备 ==========
  { id: 'C25', name: '带锯床-C25', deviceModel: 'C25', brandModel: 'GB4230', manufacturer: '浙江仁工' },
]

const ImportContent: React.FC = () => {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: EQUIPMENT_DATA.length, success: 0, failed: 0 })

  const handleImport = async () => {
    if (!confirm(`确认导入 ${EQUIPMENT_DATA.length} 条设备数据到"设备台账"表？\n\n导入后会自动覆盖相同 deviceModel 的记录。`)) {
      return
    }

    setImporting(true)
    setProgress({ current: 0, total: EQUIPMENT_DATA.length, success: 0, failed: 0 })

    // 创建表记录 API
    const recordAPI = createTableRecordAPI('设备台账')
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < EQUIPMENT_DATA.length; i++) {
      const equipment = EQUIPMENT_DATA[i]
      try {
        // 使用 save 方法创建记录
        await recordAPI.save({
          ...equipment,
          maintenanceStatus: '正常',
          deviceStatus: '运行中',
        })
        successCount++
      } catch (error: any) {
        failedCount++
      }

      setProgress({
        current: i + 1,
        total: EQUIPMENT_DATA.length,
        success: successCount,
        failed: failedCount,
      })
    }

    setImporting(false)
    toastApi.success(`导入完成！成功 ${successCount} 条，失败 ${failedCount} 条`)
  }

  return (
    <div className="space-y-0">
      <Card className="max-w-4xl mx-auto p-8 backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <h1 className="text-2xl font-bold text-cyan-300 mb-4">📦 设备数据导入工具</h1>
        <p className="text-blue-200 mb-6">
          从图片中提取了 <span className="text-cyan-300 font-bold">{EQUIPMENT_DATA.length}</span> 条设备记录
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">导入数据预览（前 5 条）</h3>
            <div className="space-y-2 text-sm">
              {EQUIPMENT_DATA.slice(0, 5).map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 p-2 bg-slate-900/50 rounded">
                  <div className="text-cyan-300">{item.name}</div>
                  <div className="text-blue-200">{item.deviceModel}</div>
                  <div className="text-slate-400 truncate" title={item.brandModel}>{item.brandModel}</div>
                  <div className="text-slate-400 truncate" title={item.manufacturer}>{item.manufacturer}</div>
                </div>
              ))}
            </div>
          </div>

          {importing && (
            <div className="p-4 rounded-lg bg-blue-900/30 border border-blue-500/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-200">导入进度</span>
                <span className="text-cyan-300 font-bold">{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">✅ 成功: {progress.success}</span>
                <span className="text-red-400">❌ 失败: {progress.failed}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleImport}
            disabled={importing}
            className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            {importing ? `导入中... (${progress.current}/${progress.total})` : '🚀 开始导入'}
          </Button>

          {!importing && progress.current > 0 && (
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20"
            >
              🔄 重置
            </Button>
          )}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
          <p className="text-yellow-200 text-sm">
            ⚠️ <strong>注意：</strong>导入完成后，请删除以下文件：
          </p>
          <ul className="text-yellow-300 text-sm mt-2 space-y-1 list-disc list-inside">
            <li>src/pages/equipment/ImportEquipmentPage.tsx（本页面）</li>
            <li>import-equipment-data.ts（导入脚本）</li>
            <li>router.tsx 中的导入页面路由</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default function ImportEquipmentPage() {
  const tableId = '设备台账'
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <ViewModel tableId={tableId} initQuery={true}>
        <ImportContent />
      </ViewModel>
    </div>
  )
}
