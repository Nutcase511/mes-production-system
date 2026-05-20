/**
 * 表 ID 映射配置
 * 将真实数据表 ID 映射到对应的页面组件
 */

export interface TableMapping {
  /** 表 ID */
  tableId: string
  /** 表标题 */
  title: string
  /** 页面路径 */
  pagePath: string
  /** 搜索字段 */
  searchFields?: string[]
  /** 是否已接入真实数据 */
  connected?: boolean
}

/** 表 ID 映射表 */
export const TABLE_MAPPINGS: TableMapping[] = [
  // ========== 设备管理 ==========
  {
    tableId: '机床列表',
    title: '机床列表',
    pagePath: '/equipment/list',
    searchFields: ['name', 'code', 'model'],
    connected: false,
  },
  {
    tableId: '设备台账',
    title: '设备台账',
    pagePath: '/equipment/list',
    searchFields: ['name', 'code', 'model'],
    connected: false,
  },
  {
    tableId: '设备点检表',
    title: '设备点检表',
    pagePath: '/equipment/inspection',
    searchFields: ['equipmentName', 'checkType'],
    connected: false,
  },
  {
    tableId: '刀具保养记录',
    title: '刀具保养记录',
    pagePath: '/equipment/tool-maintenance',
    searchFields: ['toolCode', 'toolName'],
    connected: false,
  },
  {
    tableId: '量具检验记录',
    title: '量具检验记录',
    pagePath: '/equipment/gauge-inspection',
    searchFields: ['gaugeCode', 'gaugeName'],
    connected: false,
  },

  // ========== 调度管理 ==========
  {
    tableId: '工艺路线表',
    title: '调度路线表',
    pagePath: '/scheduling/routes',
    searchFields: ['routeCode', 'routeName'],
    connected: false,
  },
  {
    tableId: '工序规程表',
    title: '调度流程',
    pagePath: '/scheduling/processes',
    searchFields: ['processCode', 'processName'],
    connected: false,
  },
  {
    tableId: '领料表',
    title: '领料表',
    pagePath: '/inventory/material-requisition',
    searchFields: ['materialCode', 'materialName'],
    connected: true,
  },
  {
    tableId: '报工单',
    title: '报工单',
    pagePath: '/production/work-report',
    searchFields: ['orderNo', 'productName'],
    connected: false,
  },
  {
    tableId: '终检',
    title: '终检',
    pagePath: '/quality/final-check',
    searchFields: ['orderNo', 'productName'],
    connected: false,
  },
  {
    tableId: '返修单',
    title: '返修单',
    pagePath: '/quality/repair-order',
    searchFields: ['orderNo', 'productName'],
    connected: false,
  },
  {
    tableId: '报废单',
    title: '报废单',
    pagePath: '/quality/scrap-order',
    searchFields: ['orderNo', 'productName'],
    connected: false,
  },
  {
    tableId: '跟单',
    title: '跟单',
    pagePath: '/production/order-list',
    searchFields: ['orderNo', 'productName'],
    connected: false,
  },
  {
    tableId: '成品入库',
    title: '成品入库',
    pagePath: '/inventory/product-inbound',
    searchFields: ['productCode', 'productName'],
    connected: true,
  },
  {
    tableId: '生产计划',
    title: '生产计划',
    pagePath: '/production/orders',
    searchFields: ['orderNo', 'productName'],
    connected: true,
  },
  {
    tableId: '生产计划',
    title: '生产计划',
    pagePath: '/production/order-dispatch',
    searchFields: ['orderNo', 'productName'],
    connected: false,
  },
  {
    tableId: '投产通知单',
    title: '投产通知单',
    pagePath: '/production/production-notice',
    searchFields: ['serial-number-1773', 'text-B2EF', 'select-1776'],
    connected: true,
  },
  {
    tableId: '投产通知单',
    title: '投产通知单',
    pagePath: '/production/development',
    searchFields: ['orderNo', 'productName'],
    connected: false,
  },
  {
    tableId: '生产计划单',
    title: '生产计划单',
    pagePath: '/production/scheduling',
    searchFields: ['planNo', 'productName'],
    connected: false,
  },
  {
    tableId: '首检单',
    title: '首检单',
    pagePath: '/quality/first-check',
    searchFields: ['orderNo', 'productName'],
    connected: false,
  },
  {
    tableId: '巡检单',
    title: '巡检单',
    pagePath: '/quality/patrol-check',
    searchFields: ['orderNo', 'productName'],
    connected: false,
  },
  {
    tableId: '外协单',
    title: '外协单',
    pagePath: '/outsourcing/list',
    searchFields: ['orderNo', 'supplierName'],
    connected: false,
  },

  // ========== 库存管理 ==========
  {
    tableId: '库存总表',
    title: '库存总表',
    pagePath: '/inventory/overview',
    searchFields: ['materialCode', 'materialName'],
    connected: true,
  },
  {
    tableId: '采购单',
    title: '采购单',
    pagePath: '/inventory/purchase-order',
    searchFields: ['orderNo', 'supplierName'],
    connected: false,
  },
  {
    tableId: '库存明细表',
    title: '库存明细表',
    pagePath: '/inventory/detail',
    searchFields: ['materialCode', 'materialName'],
    connected: false,
  },
  {
    tableId: '库存流水表',
    title: '库存流水表',
    pagePath: '/inventory/transaction',
    searchFields: ['materialCode', 'transactionType'],
    connected: false,
  },

  // ========== 基础数据 ==========
  {
    tableId: '刀具表',
    title: '刀具表',
    pagePath: '/system/tool',
    searchFields: ['toolCode', 'toolName'],
    connected: false,
  },
  {
    tableId: '工时定额表',
    title: '工时定额表',
    pagePath: '/production/work-time',
    searchFields: ['processName', 'productCode'],
    connected: false,
  },
  {
    tableId: '物料主数据表',
    title: '物料主数据表',
    pagePath: '/system/material',
    searchFields: ['materialCode', 'materialName'],
    connected: false,
  },
  {
    tableId: '供应商',
    title: '供应商',
    pagePath: '/system/supplier',
    searchFields: ['supplierCode', 'supplierName'],
    connected: false,
  },
  {
    tableId: '首件鉴定',
    title: '首件鉴定',
    pagePath: '/quality/first-inspection',
    searchFields: ['orderNo', 'productName'],
    connected: false,
  },
  {
    tableId: '订单录入',
    title: '订单录入',
    pagePath: '/production/order-entry',
    searchFields: ['orderNo', 'customerName'],
    connected: false,
  },
  {
    tableId: '生产计划单下发',
    title: '生产计划单下发',
    pagePath: '/production/plan-release',
    searchFields: ['planNo', 'productName'],
    connected: false,
  },
  {
    tableId: '派单人',
    title: '派单人',
    pagePath: '/production/dispatcher',
    searchFields: ['name', 'code'],
    connected: false,
  },
]

/**
 * 根据表 ID 获取映射配置
 */
export function getTableMapping(tableId: string): TableMapping | undefined {
  return TABLE_MAPPINGS.find(m => m.tableId === tableId)
}

/**
 * 根据页面路径获取表 ID
 */
export function getTableIdByPath(pagePath: string): string | undefined {
  const mapping = TABLE_MAPPINGS.find(m => m.pagePath === pagePath)
  return mapping?.tableId
}

/**
 * 获取所有未接入真实数据的表
 */
export function getUnconnectedTables(): TableMapping[] {
  return TABLE_MAPPINGS.filter(m => !m.connected)
}

/**
 * 获取所有已接入真实数据的表
 */
export function getConnectedTables(): TableMapping[] {
  return TABLE_MAPPINGS.filter(m => m.connected)
}
