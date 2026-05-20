// 模拟数据生成
import type {
  ProductionOrder,
  WorkOrder,
  OrderStatus,
  WorkOrderStatus,
  OrderType,
  RouteMatchStatus
} from '@/types/production'
import type { QualityCheck, CheckType, CheckResult, DefectLevel } from '@/types/quality'
import type { Material, MaterialType } from '@/types/inventory'
import type { Equipment, EquipmentStatus } from '@/types/equipment'
import type { ProcessRoute, Process } from '@/types/process'
import { generateSPCSamples, calculateSPC } from './spc'

// 生成调度路线数据
export function generateProcessRoutes(count: number = 30): ProcessRoute[] {
  const routes: ProcessRoute[] = []
  const productCodes = ['P-0001', 'P-0002', 'P-0003', 'P-0004', 'P-0005']
  const productNames = ['产品A', '产品B', '产品C', '产品D', '产品E']

  for (let i = 0; i < count; i++) {
    const productCode = productCodes[i % productCodes.length]
    const productName = productNames[i % productNames.length]
    const processCount = 3 + Math.floor(Math.random() * 5) // 3-7个工序

    routes.push({
      id: `route-${i}`,
      routeCode: `RT${String(i + 1).padStart(4, '0')}`,
      routeName: `${productName}调度路线`,
      productCode,
      productName,
      version: `V${1 + Math.floor(Math.random() * 3)}.0`,
      processes: generateProcesses(processCount),
      lastUsed: getRandomDate(-90, 0),
      matchScore: Math.random(),
      status: 'active'
    })
  }

  return routes
}

function generateProcesses(count: number): Process[] {
  const processTemplates = [
    { no: 'OP10', name: '车削', equipmentType: 'CNC车床', cycleTime: 15 },
    { no: 'OP20', name: '铣削', equipmentType: '加工中心', cycleTime: 20 },
    { no: 'OP30', name: '精加工', equipmentType: '加工中心', cycleTime: 25 },
    { no: 'OP40', name: '热处理', equipmentType: '热处理炉', cycleTime: 120 },
    { no: 'OP50', name: '表面处理', equipmentType: '表面处理设备', cycleTime: 30 },
    { no: 'OP60', name: '检验', equipmentType: '检验设备', cycleTime: 10 },
    { no: 'OP70', name: '包装', equipmentType: '包装设备', cycleTime: 5 }
  ]

  return processTemplates.slice(0, count).map((p, index) => ({
    id: `process-${index}`,
    processNo: p.no,
    processName: p.name,
    equipmentType: p.equipmentType,
    cycleTime: p.cycleTime,
    inspectionRule: {
      requireFirstCheck: true,
      requirePatrolCheck: index < count - 2,
      patrolInterval: 10,
      requireFinalCheck: index === count - 1
    },
    description: `${p.name}工序`
  }))
}

// 生成生产订单
export function generateProductionOrders(count: number = 50): ProductionOrder[] {
  const orders: ProductionOrder[] = []
  const statuses: OrderStatus[] = ['已创建', '准备中', '已就绪', '生产中', '已完成']
  const types: OrderType[] = ['batch', 'develop', 'rework']
  const matchStatuses: RouteMatchStatus[] = ['matched', 'matched', 'matched', 'partial', 'none']

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const progress = status === '已完成' ? 100 : Math.floor(Math.random() * 100)
    const matchStatus = matchStatuses[Math.floor(Math.random() * matchStatuses.length)]

    orders.push({
      id: `order-${i}`,
      orderNo: `PO${String(250300 + i).slice(2)}${String(i + 1).padStart(3, '0')}`,
      productCode: `P-${String((i % 10) + 1).padStart(4, '0')}`,
      productName: `产品${String.fromCharCode(65 + (i % 26))}`,
      orderType: types[Math.floor(Math.random() * types.length)],
      quantity: Math.floor(Math.random() * 5000) + 100,
      urgency: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
      status,
      progress,
      deliveryDate: getRandomDate(0, 30),
      createdAt: getRandomDate(-60, 0),
      routeMatchStatus: matchStatus,
      routeId: matchStatus !== 'none' ? `route-${i}` : undefined
    })
  }

  return orders
}

// 生成订单下发
export function generateOrderDispatch(count: number = 30) {
  const dispatches = []
  const productionTypes = ['1', '2', '3'] // 1-外协, 2-批产, 3-研产

  for (let i = 0; i < count; i++) {
    const year = new Date().getFullYear()
    const productionType = productionTypes[Math.floor(Math.random() * productionTypes.length)]

    dispatches.push({
      id: `dispatch-${i}`,
      planNumber: `${year}${String(i + 1).padStart(4, '0')}`,
      productCode: `P-${String((i % 10) + 1).padStart(4, '0')}`,
      productionNumber: Math.floor(Math.random() * 10000000000).toString().padStart(10, '0'),
      executionUnit: Math.floor(Math.random() * 10000000000).toString().padStart(10, '0'),
      relatedOrderId: `order-${i}`,
      relatedOrderNo: `SC${year}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      hasHistory: Math.random() > 0.5 ? '是' : '否',
      quantity: Math.floor(Math.random() * 500) + 10,
      deliveryDate: getRandomDate(7, 60),
      taskContent: `生产任务内容描述 ${i + 1}`,
      productionType,
      attachment: Math.random() > 0.7 ? 'file.pdf' : null,
      createTime: getRandomDateTime(-60, 0),
      creator: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)]
    })
  }

  return dispatches
}

// 生成跟单
export function generateWorkOrders(count: number = 100): WorkOrder[] {
  const workOrders: WorkOrder[] = []
  const statuses: WorkOrderStatus[] = ['待开始', '进行中', '暂停中', '已完成']
  const equipments = ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08']
  const operators = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const processes = [
    { no: 'OP10', name: '车削' },
    { no: 'OP20', name: '铣削' },
    { no: 'OP30', name: '精加工' },
    { no: 'OP40', name: '热处理' },
    { no: 'OP50', name: '表面处理' }
  ]

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const process = processes[Math.floor(Math.random() * processes.length)]

    workOrders.push({
      id: `wo-${i}`,
      woId: `WO${String(250300 + Math.floor(i / 5)).slice(2)}${String(i + 1).padStart(4, '0')}`,
      orderId: `order-${Math.floor(i / 3)}`,
      productCode: `P-${String(Math.floor(i / 3) + 1).padStart(4, '0')}`,
      productName: `产品${String.fromCharCode(65 + (Math.floor(i / 3) % 26))}`,
      batchNo: `B${Date.now()}${String(i).padStart(3, '0')}`,
      processNo: process.no,
      processName: process.name,
      equipment: equipments[Math.floor(Math.random() * equipments.length)],
      operator: operators[Math.floor(Math.random() * operators.length)],
      status,
      startTime: status !== '待开始' ? getRandomDateTime(-48, 0) : undefined,
      endTime: status === '已完成' ? getRandomDateTime(-24, 0) : undefined,
      inputQty: Math.floor(Math.random() * 200) + 50,
      outputQty: Math.floor(Math.random() * 200) + 50,
      qualifiedQty: Math.floor(Math.random() * 200) + 45,
      defectQty: Math.floor(Math.random() * 5)
    })
  }

  return workOrders
}

// 生成检验记录
export function generateQualityChecks(count: number = 80): QualityCheck[] {
  const checks: QualityCheck[] = []
  const checkTypes: CheckType[] = ['first', 'patrol', 'final']
  const inspectors = ['检验员A', '检验员B', '检验员C']
  const results: CheckResult[] = ['合格', '合格', '合格', '返修', '报废']
  const defectLevels: DefectLevel[] = ['Class I', 'Class II', 'Class III']

  for (let i = 0; i < count; i++) {
    const result = results[Math.floor(Math.random() * results.length)]
    const checkType = checkTypes[Math.floor(Math.random() * checkTypes.length)]

    // 生成SPC数据
    const samples = generateSPCSamples(50, 0.01, 25, 0.03)
    const spc = calculateSPC(samples)

    checks.push({
      id: `check-${i}`,
      checkId: `QC${String(250300 + i).slice(2)}${String(i + 1).padStart(4, '0')}`,
      woId: `WO${String(250300 + Math.floor(i / 2)).slice(2)}${String(i + 1).padStart(4, '0')}`,
      batchNo: `B${Date.now()}${String(i).padStart(3, '0')}`,
      checkType,
      inspector: inspectors[Math.floor(Math.random() * inspectors.length)],
      checkTime: getRandomDateTime(-72, 0),
      items: generateCheckItems(3 + Math.floor(Math.random() * 5)),
      cpk: spc.cpk,
      result,
      defectLevel: result !== '合格' ? defectLevels[Math.floor(Math.random() * 3)] : undefined,
      spc: {
        mean: spc.mean,
        stdDev: spc.stdDev,
        ucl: spc.ucl,
        lcl: spc.lcl,
        cp: spc.cp,
        cpk: spc.cpk,
        samples: samples
      },
      remarks: result === '返修' ? '需要返工处理' : undefined
    })
  }

  return checks
}

// 生成物料数据
export function generateMaterials(count: number = 200): Material[] {
  const materials: Material[] = []
  const materialTypes: MaterialType[] = ['raw', 'tool', 'gauge', 'fixture', 'semi', 'finished']
  const warehouses = ['一级库', '二级库', '半成品库', '成品库', '刀具室']
  const materialNames = {
    raw: ['铝板6061', '45#钢', '不锈钢304', '铜板', '钛合金'],
    tool: ['铣刀', '钻头', '车刀', '铰刀', '丝锥'],
    gauge: ['游标卡尺', '千分尺', '百分表', '高度尺', '三坐标'],
    fixture: ['夹具A', '夹具B', '夹具C', '工装A', '工装B'],
    semi: ['半成品A', '半成品B', '半成品C', '部件A', '部件B'],
    finished: ['成品A', '成品B', '成品C', '产品A', '产品B']
  }

  for (let i = 0; i < count; i++) {
    const materialType = materialTypes[Math.floor(Math.random() * materialTypes.length)]
    const names = materialNames[materialType]
    const name = names[Math.floor(Math.random() * names.length)]

    materials.push({
      id: `material-${i}`,
      materialId: materialType === 'raw' ? `MT${String(i + 1).padStart(4, '0')}` :
                    materialType === 'tool' ? `TL${String(i + 1).padStart(4, '0')}` :
                    `GM${String(i + 1).padStart(4, '0')}`,
      materialName: `${name}-${i + 1}`,
      materialType,
      spec: `${Math.floor(Math.random() * 100) + 10}`,
      grade: 'A级',
      unit: materialType === 'raw' ? 'kg' : '把',
      warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
      location: `${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(Math.random() * 20) + 1}`,
      quantity: Math.floor(Math.random() * 5000) + 100,
      availableQty: Math.floor(Math.random() * 4000) + 100,
      batchNo: `B${Date.now()}${String(i).padStart(4, '0')}`,
      supplier: `供应商${String.fromCharCode(65 + Math.floor(Math.random() * 10))}`
    })
  }

  return materials
}

// 生成工时记录数据
export function generateWorkTimeRecords(count: number = 50) {
  const records = []
  const workers = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const equipments = ['车床01', '车床02', '铣床01', '铣床02', '磨床01', '加工中心01']
  const processes = ['车削', '铣削', '磨削', '钻孔', '热处理']
  const products = ['产品A', '产品B', '产品C', '产品D', '产品E']
  const workTimeTypes = ['正常工时', '正常工时', '正常工时', '加班工时', '休息日工时']
  const statuses = ['待核销', '待核销', '已核销', '已核销']

  for (let i = 0; i < count; i++) {
    const workDate = getRandomDate(-30, 0)
    const workHours = 4 + Math.floor(Math.random() * 8)
    const outputQuantity = Math.floor(Math.random() * 50) + 10
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    records.push({
      id: `wt-${i}`,
      recordId: `WT${new Date().getFullYear().toString().slice(2)}${String(327 + i).padStart(4, '0')}`,
      workOrderId: `wo-${i % 20}`,
      workOrderNo: `WO-2025-${String(300 + i % 20).padStart(3, '0')}`,
      productId: `P-${String(i % 5 + 1).padStart(3, '0')}`,
      productName: products[i % 5],
      processId: `PROC-${String(i % 5 + 1).padStart(3, '0')}`,
      processName: processes[i % 5],
      workerId: `W-${String(i % 8 + 1).padStart(3, '0')}`,
      workerName: workers[i % 8],
      equipmentId: `EQ-${String(i % 6 + 1).padStart(3, '0')}`,
      equipmentName: equipments[i % 6],
      workDate,
      startTime: '08:00',
      endTime: `${8 + Math.floor(workHours)}:00`,
      workHours,
      workTimeType: workTimeTypes[Math.floor(Math.random() * workTimeTypes.length)],
      outputQuantity,
      qualifiedQuantity: outputQuantity - Math.floor(Math.random() * 3),
      status,
      createdAt: `${workDate} ${8 + workHours}:00:00`,
      verifiedAt: status === '已核销' ? getRandomDateTime(-7, 0) : undefined,
      verifiedBy: status === '已核销' ? '管理员' : undefined,
    })
  }

  return records
}

// 生成设备数据
export function generateEquipments(count: number = 20): Equipment[] {
  const equipments: Equipment[] = []
  const statuses: EquipmentStatus[] = ['运行中', '运行中', '运行中', '空闲', '故障', '保养']

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    equipments.push({
      id: `equipment-${i}`,
      equipmentId: `C${String(i + 1).padStart(2, '0')}`,
      equipmentName: `加工中心${String(i + 1).padStart(2, '0')}`,
      equipmentType: 'CNC加工中心',
      model: `VMC-${100 + i}`,
      status,
      location: `车间${String.fromCharCode(65 + Math.floor(i / 8))}区`,
      oee: status === '运行中' ? 70 + Math.random() * 25 : undefined,
      currentOperator: status === '运行中' ? `操作工${String.fromCharCode(65 + (i % 10))}` : undefined,
      currentWorkOrder: status === '运行中' ? `WO250300${String(i + 1).padStart(4, '0')}` : undefined
    })
  }

  return equipments
}

// 生成检验项目
function generateCheckItems(count: number): Array<{
  itemNo: string
  itemName: string
  method: string
  standard: string
  measuredValue: number
  qualified: boolean
}> {
  const items = []
  const checkItems = [
    { name: '尺寸1', method: '三坐标', standard: '50±0.02' },
    { name: '尺寸2', method: '三坐标', standard: '25±0.01' },
    { name: '粗糙度Ra', method: '粗糙度仪', standard: '≤1.6' },
    { name: '平行度', method: '三坐标', standard: '≤0.01' },
    { name: '垂直度', method: '三坐标', standard: '≤0.01' }
  ]

  for (let i = 0; i < count; i++) {
    const item = checkItems[i % checkItems.length]
    const measuredValue = parseFloat((Math.random() * 10 + 45).toFixed(2))
    const qualified = Math.random() > 0.1

    items.push({
      itemNo: `IT${String(i + 1).padStart(3, '0')}`,
      itemName: item.name,
      method: item.method,
      standard: item.standard,
      measuredValue,
      qualified
    })
  }

  return items
}

// 辅助函数
function getRandomDate(min: number, max: number): string {
  const date = new Date()
  date.setDate(date.getDate() + Math.floor(Math.random() * (max - min + 1)) + min)
  return date.toISOString().split('T')[0]
}

function getRandomDateTime(min: number, max: number): string {
  const date = new Date()
  date.setHours(date.getHours() + Math.floor(Math.random() * (max - min + 1)) + min)
  return date.toISOString().slice(0, 19)
}

// 导出所有模拟数据
export const mockData = {
  productionOrders: generateProductionOrders(50),
  processRoutes: generateProcessRoutes(30),
  workOrders: generateWorkOrders(100),
  qualityChecks: generateQualityChecks(80),
  materials: generateMaterials(200),
  equipments: generateEquipments(20),
  orderDispatch: generateOrderDispatch(30),
  workTimeRecords: generateWorkTimeRecords(50),

  // 统计数据
  dashboardStats: {
    totalOrders: 156,
    inProgressOrders: 25,
    pendingOrders: 8,
    completedOrders: 123,
    todayOutput: 1245,
    equipmentOEE: 85.6,
    // SPC相关统计
    spcWarnings: 3,
    qualityPassRate: 98.5
  }
}

// 生成SPC测试样本数据
export function generateSPCTestData(mean: number = 50, stdDev: number = 0.01): number[] {
  return generateSPCSamples(mean, stdDev, 25, 0.05)
}
