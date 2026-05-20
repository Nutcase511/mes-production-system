/**
 * 调度路线刀具关联服务
 * 自动关联刀具库、显示库存状态、推荐替代刀具
 */

export interface ToolInfo {
  /** 刀具编码 */
  toolCode: string
  /** 刀具名称 */
  toolName: string
  /** 刀具规格 */
  spec: string
  /** 当前库存 */
  available: number
  /** 总库存 */
  totalStock: number
  /** 库位 */
  location: string
  /** 单位 */
  unit: string
}

export interface ToolWithStock extends ToolInfo {
  /** 是否库存不足 */
  hasShortage: boolean
  /** 缺口数量 */
  shortage: number
  /** 替代刀具列表 */
  substitutes: SubstituteTool[]
}

export interface SubstituteTool {
  toolCode: string
  toolName: string
  spec: string
  stock: number
  reason: string
}

export interface ProcessToolAssociation {
  /** 工序ID */
  processId: string
  /** 工序名称 */
  processName: string
  /** 关联的刀具列表 */
  tools: ToolWithStock[]
}

/**
 * 根据工序和产品自动关联刀具
 */
export async function associateToolsToProcess(
  processId: string,
  productCode: string
): Promise<ProcessToolAssociation> {
  // 1. 获取该工序的推荐刀具
  const recommendedTools = await getRecommendedTools(processId, productCode)

  // 2. 获取每个刀具的库存信息
  const toolsWithStock = await Promise.all(
    recommendedTools.map(async (tool) => {
      const stockInfo = await getToolStock(tool.toolCode)

      // 计算是否库存不足
      const hasShortage = stockInfo.available < tool.requiredQty
      const shortage = hasShortage ? tool.requiredQty - stockInfo.available : 0

      // 如果库存不足，获取替代刀具
      let substitutes: SubstituteTool[] = []
      if (hasShortage) {
        substitutes = await getSubstituteTools(
          tool.toolCode,
          tool.requiredQty,
          shortage
        )
      }

      return {
        ...tool,
        ...stockInfo,
        hasShortage,
        shortage,
        substitutes
      }
    })
  )

  return {
    processId,
    processName: '', // TODO: 获取工序名称
    tools: toolsWithStock
  }
}

/**
 * 获取工序推荐刀具
 */
async function getRecommendedTools(
  processId: string,
  productCode: string
): Promise<any[]> {
  // TODO: 从AIRIOT查询工序刀具关联表
  // 这里返回模拟数据
  return [
    {
      toolCode: 'T001',
      toolName: '外圆刀',
      spec: 'Φ10',
      requiredQty: 2
    },
    {
      toolCode: 'T002',
      toolName: '内圆刀',
      spec: 'Φ8',
      requiredQty: 1
    },
    {
      toolCode: 'T003',
      toolName: '螺纹刀',
      spec: 'M6',
      requiredQty: 1
    }
  ]
}

/**
 * 获取刀具库存信息
 */
async function getToolStock(toolCode: string): Promise<{
  available: number
  totalStock: number
  location: string
  unit: string
}> {
  // TODO: 从AIRIOT查询刀具库存
  // 这里返回模拟数据
  const mockStocks: Record<string, any> = {
    'T001': { available: 1, totalStock: 5, location: 'A01-01', unit: '把' },
    'T002': { available: 3, totalStock: 3, location: 'A01-02', unit: '把' },
    'T003': { available: 0, totalStock: 0, location: 'A01-03', unit: '把' }
  }

  return mockStocks[toolCode] || {
    available: 0,
    totalStock: 0,
    location: '',
    unit: '把'
  }
}

/**
 * 获取替代刀具
 */
async function getSubstituteTools(
  toolCode: string,
  requiredQty: number,
  shortage: number
): Promise<SubstituteTool[]> {
  // TODO: 从AIRIOT查询替代刀具
  // 这里返回模拟数据
  const mockSubstitutes: Record<string, SubstituteTool[]> = {
    'T001': [
      {
        toolCode: 'T001-ALT',
        toolName: '外圆刀（升级版）',
        spec: 'Φ10',
        stock: 3,
        reason: '规格相同，性能更优'
      }
    ],
    'T003': [
      {
        toolCode: 'T003-ALT',
        toolName: '螺纹刀（替代）',
        spec: 'M6',
        stock: 2,
        reason: '规格相同，可互换使用'
      }
    ]
  }

  return mockSubstitutes[toolCode] || []
}

/**
 * 创建刀具采购申请
 */
export async function createToolPurchaseRequest(request: {
  toolCode: string
  toolName: string
  requiredQty: number
  urgency: 'low' | 'medium' | 'high'
  reason: string
}): Promise<void> {
  // TODO: 创建采购申请单并保存到AIRIOT
}

/**
 * 保存调度路线刀具关联
 */
export async function saveProcessToolAssociation(
  routeId: string,
  associations: ProcessToolAssociation[]
): Promise<void> {
  // TODO: 保存到AIRIOT
}

/**
 * 获取调度路线的刀具关联
 */
export async function getProcessToolAssociation(
  routeId: string
): Promise<ProcessToolAssociation[]> {
  // TODO: 从AIRIOT查询
  return []
}

/**
 * 验证刀具库存是否满足生产需求
 */
export function validateToolStock(
  tools: ToolWithStock[]
): {
  valid: boolean
  shortages: ToolWithStock[]
} {
  const shortages = tools.filter(t => t.hasShortage)

  return {
    valid: shortages.length === 0,
    shortages
  }
}

/**
 * 计算刀具库存预警级别
 */
export function getToolStockAlertLevel(tool: ToolWithStock): 'info' | 'warning' | 'critical' {
  if (tool.available === 0) return 'critical'
  if (tool.hasShortage && tool.shortage > 5) return 'critical'
  if (tool.hasShortage) return 'warning'
  if (tool.available <= 2) return 'warning'
  return 'info'
}
