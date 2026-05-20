export interface TableInfo {
  id: string
  name?: string
  title?: string
  tableMajorType?: string  // 表类型，如 'device'
  [key: string]: any
}

/**
 * 表数据信息（TableData）
 * 表中的某条记录，如某个设备
 * @example
 * {
 *   id: 'A001',
 *   name: '1号设备',
 *   table: { id: 'A', name: '设备表' }
 * }
 */
export interface TableDataInfo {
  id: string
  name?: string
  title?: string
  table: TableInfo
  tabledata?: string  // 表数据ID（向后兼容）
  [key: string]: any
}

/**
 * 标签信息（Tag）
 * 表数据上的某个数据点/字段
 * @example
 * { id: 'temperature', name: '温度' }
 * @example with tableData
 * { id: 'temperature', name: '温度', tableData: { id: 'A001', table: { id: 'A' } } }
 */
export interface TagInfo {
  id: string
  name?: string
  tableData?: TableDataInfo
}

// ==================== 标签配置类型 ====================

/**
 * 标签值（TagValue）
 * 标签的唯一标识符，用于快速定位
 * @example
 * {
 *   tableId: 'A',
 *   tableDataId: 'A001',
 *   tagId: 'temperature'
 * }
 */
export interface TagValue {
  tableId: string
  tableDataId: string
  tagId: string
}

/**
 * 标签配置（TagConfig）
 * 完整的数据点配置，包含表、表数据、标签的完整信息
 *
 * 支持两种输入格式：
 * 1. 直接格式（推荐）：直接提供 table、tableData、tag 对象
 * 2. 简写格式：使用 tableDataTag.value 提供标签值
 *
 * @example 直接格式
 * {
 *   table: { id: 'A', name: '设备表' },
 *   tableData: { id: 'A001', name: '1号设备', table: { id: 'A' } },
 *   tag: { id: 'temperature', name: '温度' },
 *   title: '1号设备温度',
 *   fixed: 2
 * }
 *
 * @example 简写格式
 * {
 *   tableDataTag: {
 *     value: { tableId: 'A', tableDataId: 'A001', tagId: 'temperature' },
 *     name: '1号设备温度'
 *   }
 * }
 */
export interface TagConfig {
  // ==================== 方式1：直接格式（推荐） ====================

  /**
   * 表信息
   */
  table?: TableInfo

  /**
   * 表数据信息（设备等）
   */
  tableData?: TableDataInfo

  /**
   * 标签信息（数据点）
   */
  tag?: TagInfo

  // ==================== 方式2：tableDataTag 简写格式（向后兼容） ====================

  /**
   * tableDataTag 配置格式
   * value: 标签的唯一标识符
   * name: 显示名称
   */
  tableDataTag?: {
    value?: TagValue
    name?: string
  }

  // ==================== 通用配置属性 ====================

  /**
   * 数据点标题/显示名称
   * 优先级最高，用于图表显示
   */
  title?: string

  /**
   * 数据点名称
   */
  name?: string

  /**
   * 唯一键，用于数据标识
   */
  key?: string

  /**
   * 唯一标识符（向后兼容）
   */
  uid?: string
  id?: string

  /**
   * 表ID字符串（简写，向后兼容）
   */
  tableId?: string

  /**
   * 分组相关
   */
  group?: string
  groupType?: 'id' | 'department' | 'other'

  /**
   * 数据格式化
   */
  fixed?: number  // 保留小数位数
  func?: string   // 聚合函数

  /**
   * 查询相关
   */
  fields?: string[]
  query?: Array<Array<{ field?: string; method?: string }>>

  /**
   * 其他扩展属性
   */
  [key: string]: any
}

/**
 * 数据点配置（TagConfig 的别名）
 */
export type DataPointConfig = TagConfig
export type DataItemConfig = TagConfig

/**
 * 列配置
 */
export interface ColumnConfig {
  field?: string
  tableData?: TableDataInfo
  table?: TableInfo
  groupType?: 'id' | 'department' | 'other'
  group?: string
}

// ==================== 查询结果类型 ====================

/**
 * 数据维度
 */
export interface Dimension {
  name: string
  title?: string
  type: string
  tag?: string
}

/**
 * 数据点
 */
export interface DataPoint {
  time: Date | string
  value: number | null
  name?: string
  key?: string
}

/**
 * 查询结果
 */
export interface QueryResult {
  dimensions?: Array<Dimension | { name: string; title?: string; type: string; tag?: string; key?: string }>
  source?: any[][]
  key?: string
  title?: string
  [key: string]: any
}

// ==================== 时间配置类型 ====================

/**
 * 时间范围配置
 */
export interface TimeRangeConfig {
  type?: 'forward' | 'backward' | 'custom'
  range?: {
    radioType?: number
    gte?: string
    lte?: string
    date?: string
    financialMonth?: {
      date?: number
      time?: string
    }
    record?: {
      table?: { id?: string }
      id?: string
    }
  }
  unit?: string
  count?: number
  fromNow?: boolean
  historyTime?: any
}

/**
 * 时间线配置（用于实时数据）
 */
export interface TimeLineConfig {
  count?: number
  unit?: string
}

/**
 * 分组配置
 */
export interface GroupConfig {
  count?: number
  unit?: string
  fill?: { value: string }
  isClassMode?: boolean
  table?: any
  record?: any
}

// ==================== WebSocket 类型 ====================

/**
 * WebSocket 消息数据
 */
export interface WSMessageData {
  tableDataId?: string
  id?: string
  tableId?: string
  fields?: Record<string, any>
  time?: string | number
  [key: string]: any
}

/**
 * WebSocket Hook 返回值
 */
export interface UseWSReturn {
  subscribe: (event: string, data: any) => () => void
  onData: (callback: (data: WSMessageData) => void) => void
  onMessage: (callback: (data: any) => void) => void
  onStatus: (callback: (status: string) => void) => void
}

// ==================== Table Data 类型 ====================

/**
 * 字段配置
 */
export interface FieldConfig {
  id?: string
  key?: string
  type?: string
  title?: string
  name?: string
  propertyType?: string
  tableName?: string
  transform?: (value: any) => any
  config?: string
  enum1?: any[]
  enum_title1?: any[]
  [key: string]: any
}

/**
 * Schema 结构
 */
export interface Schema {
  name?: string
  properties?: Record<string, FieldConfig>
  [key: string]: any
}

/**
 * 分组项配置
 */
export interface GroupItemConfig {
  field?: string | FieldConfig
  dateOperator?: '天' | '周' | '月' | '年' | '一小时内的分钟数' | '一天内的小时数' | '一周内的天数' | '一月内的天数' | '一年内的天数' | '一年内的星期数' | '一年内的月数'
  [key: string]: any
}

/**
 * 列项配置
 */
export interface ColumnItemConfig {
  name?: string
  field?: string | FieldConfig
  accumulator?: '$count' | '$avg' | '$first' | '$last' | '$max' | '$min' | '$sum'
  expression?: any
  [key: string]: any
}

/**
 * 字段格式化配置
 */
export interface FieldFormatConfig {
  field: FieldConfig | { id?: string; key?: string; title?: string; type?: string; propertyType?: string; value?: string; name?: string }
  format?: string | { format?: string; type?: string }
}
