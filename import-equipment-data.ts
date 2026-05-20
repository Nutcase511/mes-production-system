/**
 * 设备数据导入脚本（临时）
 * 从图片提取的设备台账数据导入到 AIRIOT 平台
 */

import { useModelSave } from '@airiot/client'

// 设备数据源（从图片提取）
const equipmentData = [
  // ========== 设备1.jpg - 数控铣床类 ==========
  {
    name: '四轴数铣',
    deviceModel: 'X1',
    brandModel: 'VMX421 立铣（切削液）',
    manufacturer: '赫克',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '五轴数铣',
    deviceModel: 'X2',
    brandModel: 'VF-2',
    manufacturer: 'HAAS',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '五轴数铣',
    deviceModel: 'X3',
    brandModel: 'VF-3',
    manufacturer: 'HAAS',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '三轴数铣',
    deviceModel: 'X4',
    brandModel: 'VF-4',
    manufacturer: 'HAAS',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '四轴数铣',
    deviceModel: 'X8',
    brandModel: 'GXR1000 立铣',
    manufacturer: '哈挺',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '六米龙门',
    deviceModel: 'D1',
    brandModel: 'SNK R8-6VM 龙门（6m五面体）',
    manufacturer: '新日本工机（SNK）',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '六米龙门',
    deviceModel: 'D2',
    brandModel: 'SNK R8-6VM 龙门（6m五面体）',
    manufacturer: '新日本工机（SNK）',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '大数控车',
    deviceModel: 'X5',
    brandModel: 'EC-1600',
    manufacturer: '赫克',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },

  // ========== 设备1.jpg - 数控车床类 ==========
  {
    name: '数控车',
    deviceModel: 'C1',
    brandModel: 'CTX310',
    manufacturer: '德国沙尔曼',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '数控车',
    deviceModel: 'C2',
    brandModel: 'CTX310',
    manufacturer: '德国沙尔曼',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '精密数控车床',
    deviceModel: 'C3',
    brandModel: 'STC-20',
    manufacturer: '赫克',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '精密数控车床',
    deviceModel: 'C4',
    brandModel: 'STC-20',
    manufacturer: '赫克',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '数控车',
    deviceModel: 'C5',
    brandModel: 'LC-20',
    manufacturer: '赫克',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '数控车',
    deviceModel: 'C6',
    brandModel: 'LC-20',
    manufacturer: '赫克',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },

  // ========== 设备1.jpg - 磨床类 ==========
  {
    name: '数控外圆磨床',
    deviceModel: 'C13',
    brandModel: 'UR175/1000',
    manufacturer: 'KELLEMBERGER琼士',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '数控万能内外圆磨床',
    deviceModel: 'C14',
    brandModel: 'J10 1000U',
    manufacturer: '哈挺精密机械',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },

  // ========== 设备2.jpg - 磨床类 ==========
  {
    name: '高精度数控无心磨床',
    deviceModel: 'C16',
    brandModel: 'MGK1505-3A',
    manufacturer: '无锡一机磨床',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '高精平面磨床',
    deviceModel: 'C22',
    brandModel: 'MG7125',
    manufacturer: '天津机床厂',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '高精度平面磨床',
    deviceModel: 'C23',
    brandModel: 'MM7132B',
    manufacturer: '杭州机床厂',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '高精外圆磨床',
    deviceModel: 'C24',
    brandModel: 'MG1420C',
    manufacturer: '北京二机床厂',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },

  // ========== 设备2.jpg - 线切割类 ==========
  {
    name: '快走丝线切割机床',
    deviceModel: 'C17',
    brandModel: 'DK7732Z',
    manufacturer: '江苏冬庆数控机床',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '快走丝线切割机床',
    deviceModel: 'C18',
    brandModel: 'DK7732Z',
    manufacturer: '江苏冬庆数控机床',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '线切割机床',
    deviceModel: 'C19',
    brandModel: 'DK7750Z12',
    manufacturer: '江苏冬庆数控机床',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
  {
    name: '慢走丝切割机床',
    deviceModel: 'C20',
    brandModel: 'CUT200P',
    manufacturer: '阿奇夏米尔',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },

  // ========== 设备2.jpg - 其他设备 ==========
  {
    name: '带锯床',
    deviceModel: 'C25',
    brandModel: 'GB4230',
    manufacturer: '浙江仁工',
    maintenanceStatus: '正常',
    deviceStatus: '运行中',
  },
]

/**
 * 导入设备数据到 AIRIOT
 */
export async function importEquipmentData() {
  const { saveItem } = useModelSave()
  const tableId = '设备台账'

  console.log(`🚀 开始导入设备数据，共 ${equipmentData.length} 条记录...`)

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (let i = 0; i < equipmentData.length; i++) {
    const equipment = equipmentData[i]
    try {
      await saveItem(tableId, equipment)
      results.success++
      console.log(`✅ [${i + 1}/${equipmentData.length}] 导入成功: ${equipment.name} (${equipment.deviceModel})`)
    } catch (error: any) {
      results.failed++
      const errorMsg = `❌ [${i + 1}/${equipmentData.length}] 导入失败: ${equipment.name} - ${error.message || error}`
      results.errors.push(errorMsg)
      console.error(errorMsg)
    }
  }

  console.log('\n📊 导入完成统计:')
  console.log(`✅ 成功: ${results.success} 条`)
  console.log(`❌ 失败: ${results.failed} 条`)

  if (results.errors.length > 0) {
    console.log('\n错误详情:')
    results.errors.forEach(err => console.error(err))
  }

  return results
}

// 如果在浏览器控制台执行，可以调用：
// importEquipmentData()
