/**
 * 表配置管理
 * 统一管理所有表的配置信息
 */

export interface TableFieldConfig {
  /** 字段键名 */
  key: string
  /** 是否在列表中显示 */
  showInList?: boolean
  /** 是否可搜索 */
  searchable?: boolean
  /** 是否可筛选 */
  filterable?: boolean
  /** 列宽 */
  width?: number
  /** 自定义渲染函数 */
  render?: (value: any, record: any) => React.ReactNode
  /** 新建时是否隐藏该字段 */
  hideOnCreate?: boolean
  /** 编辑时是否只读 */
  readonlyOnEdit?: boolean
}

export interface TableConfig {
  /** 表ID（对应 AIRIOT 的表名） */
  tableId: string
  /** 表名称（用于显示） */
  tableName: string
  /** 搜索字段（用于模糊搜索） */
  searchFields?: string[]
  /** 排除的字段（不在列表中显示） */
  excludeFields?: string[]
  /** 字段配置 */
  fieldConfigs?: Record<string, TableFieldConfig>
}

/** 表配置映射 */
export const TABLE_CONFIG: Record<string, TableConfig> = {
  // ========== 投产通知 ==========
  PRODUCTION_NOTICE: {
    tableId: '投产通知单',
    tableName: '投产通知单',
    searchFields: ['serial-number-1773', 'text-B2EF', 'select-1776'],
    excludeFields: [],
  },

  // ========== 生产计划 ==========
  PRODUCTION_ORDER: {
    tableId: '生产计划',
    tableName: '生产计划',
    searchFields: ['notificationNumber', 'customerName', 'customerOrderNo'],
    excludeFields: ['upload-single-AE62', 'text-F185', 'auditByOpinion'],
  },

  // ========== 设备管理 ==========
  EQUIPMENT_LIST: {
    tableId: '机床列表',
    tableName: '机床列表',
    searchFields: ['name', 'code', 'model'],
    excludeFields: [],
  },
  EQUIPMENT_LEDGER: {
    tableId: '设备台账',
    tableName: '设备台账',
    searchFields: ['name', 'code', 'model'],
    excludeFields: [],
  },
  EQUIPMENT_CHECK: {
    tableId: '设备点检表',
    tableName: '设备点检表',
    searchFields: ['equipmentName', 'checkType'],
    excludeFields: [],
  },
  TOOL_MAINTENANCE: {
    tableId: '刀具保养记录',
    tableName: '刀具保养记录',
    searchFields: ['toolCode', 'toolName'],
    excludeFields: [],
  },
  GAUGE_INSPECTION: {
    tableId: '量具检验记录',
    tableName: '量具检验记录',
    searchFields: ['gaugeCode', 'gaugeName'],
    excludeFields: [],
  },

  // ========== 生产管理 ==========
  PRODUCTION_TYPE_DETERMINATION: {
    tableId: '生产类型判定记录',
    tableName: '生产类型判定记录',
    searchFields: ['orderNo', 'finalType'],
    excludeFields: [],
  },
  PREPARATION_CHECKLIST: {
    tableId: '生产准备检查记录',
    tableName: '生产准备检查记录',
    searchFields: ['workOrderNo', 'overallStatus'],
    excludeFields: [],
  },
  TRIAL_PRODUCTION_CONTROL: {
    tableId: '试生产控制记录',
    tableName: '试生产控制记录',
    searchFields: ['workOrderNo', 'overallStatus'],
    excludeFields: [],
  },
  BATCH_RELATION: {
    tableId: '批次关联',
    tableName: '批次关联',
    searchFields: ['batchNo', 'orderNo', 'workOrderNo'],
    excludeFields: [],
  },
  MATERIAL_TRACE: {
    tableId: '物料追溯记录',
    tableName: '物料追溯记录',
    searchFields: ['workOrderNo', 'materialCode', 'batchNo'],
    excludeFields: [],
  },
  INVENTORY_ALERT: {
    tableId: '库存预警',
    tableName: '库存预警',
    searchFields: ['materialCode', 'materialName', 'level'],
    excludeFields: [],
  },
  INVENTORY_ALERT_RULE: {
    tableId: '库存预警规则',
    tableName: '库存预警规则',
    searchFields: ['materialCode', 'materialName'],
    excludeFields: [],
  },
  MONITORING_RULE: {
    tableId: '过程监控规则',
    tableName: '过程监控规则',
    searchFields: ['ruleName', 'processName', 'ruleType'],
    excludeFields: [],
  },
  RULE_EXECUTION_HISTORY: {
    tableId: '规则执行历史',
    tableName: '规则执行历史',
    searchFields: ['ruleName', 'workOrderNo', 'executionTime'],
    excludeFields: [],
  },
  ROUTE_LIST: {
    tableId: '工艺路线表',
    tableName: '调度路线表',
    searchFields: ['routeCode', 'routeName'],
    excludeFields: [],
    fieldConfigs: {
      'serial-number-008': {
        key: 'serial-number-008',
        showInList: true,
        searchable: true,
        // 新建时隐藏，编辑时只读显示
        hideOnCreate: true,
        readonlyOnEdit: true,
      },
      // 确保文本字段配置
      'text-701': {
        key: 'text-701',
        showInList: true,
      },
      'text-702': {
        key: 'text-702',
        showInList: true,
      },
      'text-703': {
        key: 'text-703',
        showInList: true,
      },
      'text-704': {
        key: 'text-704',
        showInList: true,
      },
    },
  },
  PROCESS_FLOW: {
    tableId: '调度流程',
    tableName: '调度流程',
    searchFields: ['processCode', 'processName'],
    excludeFields: [],
  },
  MATERIAL_REQUISITION: {
    tableId: '领料表',
    tableName: '领料表',
    searchFields: ['materialCode', 'materialName'],
    excludeFields: [],
  },
  WORK_REPORT: {
    tableId: '报工单',
    tableName: '报工单',
    searchFields: ['orderNo', 'productName'],
    excludeFields: [],
  },
  FINAL_CHECK: {
    tableId: '终检',
    tableName: '终检',
    searchFields: ['orderNo', 'productName'],
    excludeFields: [],
  },
  REPAIR_ORDER: {
    tableId: '返修单',
    tableName: '返修单',
    searchFields: ['orderNo', 'productName'],
    excludeFields: [],
  },
  SCRAP_ORDER: {
    tableId: '报废单',
    tableName: '报废单',
    searchFields: ['orderNo', 'productName'],
    excludeFields: [],
  },
  ORDER_FOLLOW: {
    tableId: '跟单',
    tableName: '跟单',
    searchFields: ['orderNo', 'productName'],
    excludeFields: [],
  },
  PRODUCT_INBOUND: {
    tableId: '成品入库',
    tableName: '成品入库',
    searchFields: ['productCode', 'productName'],
    excludeFields: [],
  },
  PRODUCTION_DISPATCH: {
    tableId: '生产计划',
    tableName: '生产计划',
    searchFields: ['orderNo', 'productName'],
    excludeFields: [],
  },
  DEVELOPMENT_NOTICE: {
    tableId: '投产通知单',
    tableName: '投产通知单',
    searchFields: ['orderNo', 'productName'],
    excludeFields: [],
  },
  SCHEDULE_PLAN: {
    tableId: '生产计划单',
    tableName: '生产计划单',
    searchFields: ['planNo', 'productName'],
    excludeFields: [],
  },
  FIRST_CHECK: {
    tableId: '首检单',
    tableName: '首检单',
    searchFields: ['orderNo', 'productName'],
    excludeFields: [],
  },
  OUTSOURCING: {
    tableId: '外协单',
    tableName: '外协单',
    searchFields: ['orderNo', 'supplierName'],
    excludeFields: [],
  },

  // ========== 库存管理 ==========
  INVENTORY_OVERVIEW: {
    tableId: '库存总表',
    tableName: '库存总表',
    searchFields: ['materialCode', 'materialName'],
    excludeFields: [],
  },
  PURCHASE_ORDER: {
    tableId: '采购单',
    tableName: '采购单',
    searchFields: ['orderNo', 'supplierName'],
    excludeFields: [],
  },
  INVENTORY_DETAIL: {
    tableId: '库存明细表',
    tableName: '库存明细表',
    searchFields: ['materialCode', 'materialName'],
    excludeFields: [],
  },
  INVENTORY_TRANSACTION: {
    tableId: '库存流水表',
    tableName: '库存流水表',
    searchFields: ['materialCode', 'transactionType'],
    excludeFields: [],
  },

  // ========== 基础数据 ==========
  TOOL: {
    tableId: '刀具表',
    tableName: '刀具表',
    searchFields: ['toolCode', 'toolName'],
    excludeFields: [],
  },
  WORK_TIME_QUOTA: {
    tableId: '工时定额表',
    tableName: '工时定额表',
    searchFields: ['processName', 'productCode'],
    excludeFields: [],
  },
  WORK_TIME_RECORD: {
    tableId: '工时记录表',
    tableName: '工时记录表',
    searchFields: ['orderNo', 'productName'],
    excludeFields: [],
  },
  EQUIPMENT_DETAIL: {
    tableId: '设备台账',
    tableName: '设备台账',
    searchFields: ['name', 'code', 'model'],
    excludeFields: [],
  },
  EQUIPMENT_MAINTENANCE: {
    tableId: '设备保养记录',
    tableName: '设备保养记录',
    searchFields: ['equipmentName', 'maintenanceType'],
    excludeFields: [],
  },
  PATROL_CHECK: {
    tableId: '巡检单',
    tableName: '巡检单',
    searchFields: ['orderNo', 'productName'],
    excludeFields: [],
  },
  MATERIAL_MASTER: {
    tableId: '物料主数据表',
    tableName: '物料主数据表',
    searchFields: ['materialCode', 'materialName'],
    excludeFields: [],
  },
  SUPPLIER: {
    tableId: '供应商',
    tableName: '供应商',
    searchFields: ['supplierCode', 'supplierName'],
    excludeFields: [],
  },
  FIRST_INSPECTION: {
    tableId: '首件鉴定',
    tableName: '首件鉴定',
    searchFields: ['orderNo', 'productName'],
    excludeFields: [],
  },
  ORDER_ENTRY: {
    tableId: '订单录入',
    tableName: '订单录入',
    searchFields: ['orderNo', 'customerName'],
    excludeFields: [],
  },
  PLAN_RELEASE: {
    tableId: '生产计划单下发',
    tableName: '生产计划单下发',
    searchFields: ['planNo', 'productName'],
    excludeFields: [],
  },
  DISPATCHER: {
    tableId: '派单人',
    tableName: '派单人',
    searchFields: ['name', 'code'],
    excludeFields: [],
  },

  // ========== 旧配置（保留兼容性）==========
  ORDER_DISPATCH: {
    tableId: '生产计划单下发',
    tableName: '订单下发',
    searchFields: ['serial-number-3F58', 'text-9AFE'],
    excludeFields: [],
  },
  MATERIAL: {
    tableId: '物料',
    tableName: '物料',
    searchFields: ['serial-number-1001', 'text-1002'],
    excludeFields: [],
  },
}

/**
 * 获取表配置
 */
export function getTableConfig(key: string): TableConfig | undefined {
  return TABLE_CONFIG[key]
}

/**
 * 根据表ID获取表配置
 */
export function getTableConfigById(tableId: string): TableConfig | undefined {
  return Object.values(TABLE_CONFIG).find(config => config.tableId === tableId)
}
