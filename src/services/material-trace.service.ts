/**
 * 物料追溯服务
 * 处理物料追溯、批次管理、缺料预警等功能
 */

export interface MaterialInfo {
  /** 物料编码 */
  materialCode: string
  /** 物料名称 */
  materialName: string
  /** 批次号 */
  batchNo: string
  /** 供应商 */
  supplierName: string
  /** 当前库存 */
  currentStock: number
  /** 单位 */
  unit: string
}

export interface MaterialTraceRecord {
  id?: string
  /** 关联的领料单ID */
  requisitionId: string
  /** 物料编码 */
  materialCode: string
  /** 物料名称 */
  materialName: string
  /** 批次号 */
  batchNo: string
  /** 供应商 */
  supplierName: string
  /** 扫描时间 */
  scanTime: Date
  /** 扫描人 */
  scanner: string
  /** 工单ID */
  workOrderId?: string
  /** 工单编号 */
  workOrderNo?: string
}

/**
 * 根据物料条码获取物料信息
 */
export async function getMaterialByBarcode(barcode: string): Promise<MaterialInfo> {
  // TODO: 实现从AIRIOT获取物料信息的逻辑
  // 这里是模拟数据
  const mockMaterials: Record<string, MaterialInfo> = {
    'M001': {
      materialCode: 'M001',
      materialName: '铝棒 φ50',
      batchNo: 'B20240301001',
      supplierName: 'XX材料厂',
      currentStock: 150,
      unit: 'kg'
    }
  }

  const material = mockMaterials[barcode]
  if (!material) {
    throw new Error('物料不存在：' + barcode)
  }

  return material
}

/**
 * 验证物料是否匹配领料需求
 */
export async function validateMaterial(
  materialInfo: MaterialInfo,
  requiredMaterials: any[]
): Promise<boolean> {
  // 检查物料是否在需求清单中
  const required = requiredMaterials.find(
    rm => rm.materialCode === materialInfo.materialCode
  )

  if (!required) {
    return false
  }

  // 检查规格是否匹配
  // TODO: 添加更多验证逻辑

  return true
}

/**
 * 保存物料追溯记录
 */
export async function saveMaterialTraceRecord(
  record: MaterialTraceRecord
): Promise<void> {
  // TODO: 保存到AIRIOT数据库
}

/**
 * 批量保存物料追溯记录
 */
export async function saveMaterialTraceRecords(
  records: MaterialTraceRecord[]
): Promise<void> {
  // TODO: 批量保存到AIRIOT数据库
}

/**
 * 根据批次号获取物料追溯信息
 */
export async function getMaterialTraceByBatchNo(
  batchNo: string
): Promise<MaterialTraceRecord[]> {
  // TODO: 从AIRIOT查询
  return []
}

/**
 * 根据工单号获取物料追溯信息
 */
export async function getMaterialTraceByWorkOrder(
  workOrderId: string
): Promise<MaterialTraceRecord[]> {
  // TODO: 从AIRIOT查询
  return []
}

/**
 * 缺料预警信息
 */
export interface MaterialShortageAlert {
  /** 物料编码 */
  materialCode: string
  /** 物料名称 */
  materialName: string
  /** 当前库存 */
  currentStock: number
  /** 需求数量 */
  requiredQty: number
  /** 缺口数量 */
  shortage: number
  /** 预警级别 */
  level: 'warning' | 'critical'
}

/**
 * 检查物料缺料情况
 */
export async function checkMaterialShortage(
  materialList: any[]
): Promise<MaterialShortageAlert[]> {
  const alerts: MaterialShortageAlert[] = []

  for (const material of materialList) {
    // 获取当前库存
    const inventory = await getInventoryByMaterial(material.materialCode)

    // 检查库存是否充足
    if (inventory.quantity < material.requiredQty) {
      const shortage = material.requiredQty - inventory.quantity
      alerts.push({
        materialCode: material.materialCode,
        materialName: material.materialName,
        currentStock: inventory.quantity,
        requiredQty: material.requiredQty,
        shortage,
        level: shortage > 10 ? 'critical' : 'warning'
      })
    }
  }

  return alerts
}

/**
 * 根据物料编码获取库存信息
 */
async function getInventoryByMaterial(materialCode: string): Promise<any> {
  // TODO: 从AIRIOT查询库存
  return {
    quantity: 100 // 模拟数据
  }
}

/**
 * 创建采购申请
 */
export async function createPurchaseRequest(request: {
  materialCode: string
  materialName: string
  requestQty: number
  urgency: 'low' | 'medium' | 'high'
  reason: string
}): Promise<void> {
  // TODO: 创建采购申请单并保存到AIRIOT
}

/**
 * 替代料信息
 */
export interface SubstituteMaterial {
  /** 物料编码 */
  materialCode: string
  /** 物料名称 */
  materialName: string
  /** 库存 */
  stock: number
  /** 替代原因 */
  reason: string
  /** 是否需要调度调整 */
  requiresProcessAdjustment: boolean
}

/**
 * 获取替代料列表
 */
export async function getSubstituteMaterials(
  materialCode: string,
  requiredQty: number
): Promise<SubstituteMaterial[]> {
  // TODO: 从AIRIOT查询替代料
  return [
    {
      materialCode: 'M001-ALT',
      materialName: '铝棒 φ50（替代）',
      stock: 50,
      reason: '规格相同，材质相近',
      requiresProcessAdjustment: false
    }
  ]
}

/**
 * 创建替代料申请
 */
export async function createSubstituteRequest(request: {
  originalMaterialCode: string
  originalMaterialName: string
  substituteMaterialCode: string
  substituteMaterialName: string
  reason: string
  workOrderId: string
}): Promise<void> {
  // TODO: 创建替代料申请单
}

/**
 * 生成物料追溯链
 */
export async function buildMaterialTraceChain(
  workOrderId: string
): Promise<any[]> {
  const traceRecords = await getMaterialTraceByWorkOrder(workOrderId)

  // 构建追溯链
  const chain = traceRecords.map(record => ({
    type: 'material',
    materialCode: record.materialCode,
    materialName: record.materialName,
    batchNo: record.batchNo,
    supplier: record.supplierName,
    scanTime: record.scanTime,
    scanner: record.scanner
  }))

  return chain
}
