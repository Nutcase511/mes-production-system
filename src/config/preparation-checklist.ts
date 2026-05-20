/**
 * 生产准备检查清单配置
 * 定义检查项、检查标准和预警规则
 */

export interface CheckItem {
  /** 检查项ID */
  id: string
  /** 检查项名称 */
  name: string
  /** 是否必检 */
  required: boolean
  /** 检查说明 */
  description?: string
  /** 检查方法 */
  checkMethod?: string
}

export interface CheckCategory {
  /** 类别ID */
  id: string
  /** 类别名称 */
  name: string
  /** 图标 */
  icon: string
  /** 检查项列表 */
  items: CheckItem[]
}

/**
 * 准备检查清单配置
 */
export const PREPARATION_CHECKLIST: CheckCategory[] = [
  {
    id: 'tools',
    name: '刀具检查',
    icon: '🔧',
    items: [
      {
        id: 'T001',
        name: '刀具规格确认',
        required: true,
        description: '确认刀具规格符合调度要求',
        checkMethod: '对照调度文件核对刀具型号'
      },
      {
        id: 'T002',
        name: '刀具寿命检查',
        required: true,
        description: '确认刀具剩余寿命满足加工需求',
        checkMethod: '查看刀具使用记录'
      },
      {
        id: 'T003',
        name: '备用刀具准备',
        required: false,
        description: '准备备用刀具以防更换',
        checkMethod: '确认备用刀具已准备'
      },
      {
        id: 'T004',
        name: '刀具安装调试',
        required: true,
        description: '确认刀具安装正确并调试完成',
        checkMethod: '试切验证'
      }
    ]
  },
  {
    id: 'programs',
    name: '程序检查',
    icon: '💾',
    items: [
      {
        id: 'P001',
        name: '加工程序版本确认',
        required: true,
        description: '确认使用正确版本的加工程序',
        checkMethod: '与CAPP系统核对版本号'
      },
      {
        id: 'P002',
        name: '程序仿真验证',
        required: true,
        description: '通过仿真验证程序正确性',
        checkMethod: '使用仿真软件运行程序'
      },
      {
        id: 'P003',
        name: '程序备份完成',
        required: false,
        description: '备份当前使用的程序',
        checkMethod: '确认程序已备份'
      },
      {
        id: 'P004',
        name: '刀具路径验证',
        required: true,
        description: '验证刀具路径无碰撞',
        checkMethod: '仿真检查刀具路径'
      }
    ]
  },
  {
    id: 'materials',
    name: '物料检查',
    icon: '📦',
    items: [
      {
        id: 'M001',
        name: '原材料规格确认',
        required: true,
        description: '确认原材料规格符合要求',
        checkMethod: '核对材质证明书'
      },
      {
        id: 'M002',
        name: '物料数量充足',
        required: true,
        description: '确认物料数量满足生产需求',
        checkMethod: '清点物料数量'
      },
      {
        id: 'M003',
        name: '物料质量检验',
        required: true,
        description: '确认物料质量合格',
        checkMethod: '查看质检报告'
      },
      {
        id: 'M004',
        name: '物料预处理完成',
        required: false,
        description: '如需要热处理等预处理已完成',
        checkMethod: '查看预处理记录'
      }
    ]
  },
  {
    id: 'personnel',
    name: '人员检查',
    icon: '👥',
    items: [
      {
        id: 'H001',
        name: '操作工资质确认',
        required: true,
        description: '确认操作工具备相应资质',
        checkMethod: '查看上岗证'
      },
      {
        id: 'H002',
        name: '人员到岗确认',
        required: true,
        description: '确认操作人员已到岗',
        checkMethod: '现场确认'
      },
      {
        id: 'H003',
        name: '安全培训完成',
        required: true,
        description: '确认操作人员已完成安全培训',
        checkMethod: '查看培训记录'
      }
    ]
  },
  {
    id: 'equipment',
    name: '设备检查',
    icon: '⚙️',
    items: [
      {
        id: 'E001',
        name: '设备点检完成',
        required: true,
        description: '确认设备点检已完成并合格',
        checkMethod: '查看点检记录'
      },
      {
        id: 'E002',
        name: '设备精度校验',
        required: true,
        description: '确认设备精度符合加工要求',
        checkMethod: '试切检验'
      },
      {
        id: 'E003',
        name: '设备运行状态',
        required: true,
        description: '确认设备运行正常无异常',
        checkMethod: '试运行设备'
      },
      {
        id: 'E004',
        name: '安全装置检查',
        required: true,
        description: '确认设备安全装置完好有效',
        checkMethod: '测试安全装置'
      },
      {
        id: 'E005',
        name: '辅助设备准备',
        required: false,
        description: '确认夹具、量具等辅助设备已准备',
        checkMethod: '现场检查'
      }
    ]
  }
]

/**
 * 检查项状态
 */
export type CheckItemStatus = 'pending' | 'ok' | 'ng' | 'na'

/**
 * 检查项记录
 */
export interface CheckItemRecord {
  /** 检查项ID */
  checkItemId: string
  /** 类别ID */
  categoryId: string
  /** 检查项名称 */
  itemName: string
  /** 检查状态 */
  status: CheckItemStatus
  /** 检查人 */
  checker: string
  /** 检查时间 */
  checkTime: Date
  /** 备注 */
  remark?: string
}

/**
 * 准备检查记录
 */
export interface PreparationCheckRecord {
  id?: string
  /** 工单ID */
  workOrderId: string
  /** 工单编号 */
  workOrderNo: string
  /** 订单ID */
  orderId: string
  /** 订单编号 */
  orderNo: string
  /** 检查项记录 */
  checkItems: CheckItemRecord[]
  /** 整体状态 */
  overallStatus: 'pending' | 'passed' | 'warning' | 'failed'
  /** 总检查人 */
  checker?: string
  /** 检查时间 */
  checkTime?: Date
  /** 审批人 */
  approver?: string
  /** 审批时间 */
  approvalTime?: Date
  /** 备注 */
  remark?: string
  /** 状态 */
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
}

/**
 * 预警级别
 */
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical'

/**
 * 准备检查预警
 */
export interface PreparationAlert {
  id?: string
  /** 工单ID */
  workOrderId: string
  /** 工单编号 */
  workOrderNo: string
  /** 预警类型 */
  alertType: string
  /** 预警级别 */
  level: AlertLevel
  /** 预警原因 */
  reason: string
  /** 预警描述 */
  description: string
  /** 状态 */
  status: 'pending' | 'processing' | 'resolved' | 'ignored'
  /** 创建时间 */
  createdAt: Date
  /** 处理人 */
  handler?: string
  /** 处理时间 */
  handledAt?: Date
  /** 处理说明 */
  handleRemark?: string
}

/**
 * 根据类别ID获取检查类别
 */
export function getCheckCategory(categoryId: string): CheckCategory | undefined {
  return PREPARATION_CHECKLIST.find(cat => cat.id === categoryId)
}

/**
 * 根据检查项ID获取检查项
 */
export function getCheckItem(checkItemId: string): { category: CheckCategory; item: CheckItem } | undefined {
  for (const category of PREPARATION_CHECKLIST) {
    const item = category.items.find(i => i.id === checkItemId)
    if (item) {
      return { category, item }
    }
  }
  return undefined
}

/**
 * 计算整体状态
 */
export function calculateOverallStatus(checkItems: CheckItemRecord[]): PreparationCheckRecord['overallStatus'] {
  if (checkItems.length === 0) return 'pending'

  const requiredItems = checkItems.filter(item => {
    const checkItemDef = getCheckItem(item.checkItemId)
    return checkItemDef?.item.required
  })

  const requiredPending = requiredItems.filter(item => item.status === 'pending')
  const requiredNG = requiredItems.filter(item => item.status === 'ng')

  if (requiredNG.length > 0) return 'failed'
  if (requiredPending.length > 0) return 'pending'
  return 'passed'
}

/**
 * 获取预警级别颜色
 */
export function getAlertLevelColor(level: AlertLevel): string {
  const colors = {
    info: 'text-blue-400',
    warning: 'text-yellow-400',
    error: 'text-orange-400',
    critical: 'text-red-400'
  }
  return colors[level]
}

/**
 * 获取预警级别标签
 */
export function getAlertLevelLabel(level: AlertLevel): string {
  const labels = {
    info: '提示',
    warning: '警告',
    error: '错误',
    critical: '严重'
  }
  return labels[level]
}
