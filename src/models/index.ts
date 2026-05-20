/**
 * MES 数据模型定义
 * 基于 @airiot/client Model 模块
 */
import { type ModelSchema, modelRegistry } from '@airiot/client'

/**
 * 投产通知单模型
 */
export const productionOrderModel: ModelSchema = {
  name: '投产通知单',
  title: '投产通知单',
  resource: 'core/t/投产通知单/d', // 指定正确的API资源路径
  key: 'production-orders',
  permission: {
    view: true,
    add: true,
    edit: true,
    delete: true,
  },
  defaultValue: () => ({
    status: '待投产',
    createdAt: new Date().toISOString(),
  }),
  initialValues: {
    option: { skip: 0, limit: 15 },
  },
  listFields: [
    'notificationNumber',
    'productName',
    'customerName',
    'quantity',
    'deliveryDate',
    'status',
  ],
  defaultOrder: { createdAt: 'DESC' },
  defaultPageSize: 15,
  properties: {
    notificationNumber: {
      type: 'string',
      title: '通知单号',
    },
    productName: {
      type: 'string',
      title: '产品名称',
    },
    customerName: {
      type: 'string',
      title: '客户名称',
    },
    quantity: {
      type: 'number',
      title: '数量',
    },
    deliveryDate: {
      type: 'string',
      title: '交货日期',
    },
    status: {
      type: 'string',
      title: '状态',
      enum: ['待投产', '生产中', '已完成', '已取消'],
    },
    createdAt: {
      type: 'string',
      title: '创建时间',
    },
  },
}

/**
 * 生产类型判定记录模型
 */
export const productionTypeDeterminationModel: ModelSchema = {
  name: '生产类型判定记录',
  title: '生产类型判定记录',
  resource: 'core/t/生产类型判定记录/d', // 指定正确的API资源路径
  key: 'production-type-determinations',
  permission: {
    view: true,
    add: true,
    edit: true,
    delete: true,
  },
  defaultValue: () => ({
    status: 'determined',
    createdAt: new Date().toISOString(),
  }),
  initialValues: {
    option: { skip: 0, limit: 15 },
  },
  listFields: ['orderNo', 'productName', 'finalType', 'status', 'createdAt'],
  defaultOrder: { createdAt: 'DESC' },
  defaultPageSize: 15,
  properties: {
    orderNo: {
      type: 'string',
      title: '订单编号',
    },
    productName: {
      type: 'string',
      title: '产品名称',
    },
    customerName: {
      type: 'string',
      title: '客户名称',
    },
    originalType: {
      type: 'string',
      title: '系统判定',
      enum: ['development', 'outsourcing', 'normal'],
    },
    finalType: {
      type: 'string',
      title: '最终类型',
      enum: ['development', 'outsourcing', 'normal'],
    },
    confidence: {
      type: 'number',
      title: '置信度',
    },
    reasons: {
      type: 'array',
      title: '判定依据',
    },
    status: {
      type: 'string',
      title: '状态',
      enum: ['determined', 'modified'],
    },
    remark: {
      type: 'string',
      title: '备注',
    },
    createdAt: {
      type: 'string',
      title: '创建时间',
    },
  },
}

/**
 * 设备模型
 */
export const equipmentModel: ModelSchema = {
  name: '设备',
  title: '设备',
  key: 'equipment',
  permission: {
    view: true,
    add: true,
    edit: true,
    delete: true,
  },
  defaultValue: () => ({
    status: '空闲',
  }),
  initialValues: {
    option: { skip: 0, limit: 15 },
  },
  listFields: ['code', 'name', 'type', 'status', 'location'],
  defaultOrder: { createdAt: 'DESC' },
  defaultPageSize: 15,
  properties: {
    code: {
      type: 'string',
      title: '设备编号',
    },
    name: {
      type: 'string',
      title: '设备名称',
    },
    type: {
      type: 'string',
      title: '设备类型',
    },
    status: {
      type: 'string',
      title: '状态',
      enum: ['运行中', '空闲', '故障', '保养'],
    },
    location: {
      type: 'string',
      title: '位置',
    },
  },
}

/**
 * 库存模型
 */
export const inventoryModel: ModelSchema = {
  name: '库存',
  title: '库存',
  key: 'inventory',
  permission: {
    view: true,
    add: true,
    edit: true,
    delete: true,
  },
  defaultValue: () => ({}),
  initialValues: {
    option: { skip: 0, limit: 15 },
  },
  listFields: ['materialCode', 'materialName', 'quantity', 'unit', 'warehouseLocation'],
  defaultOrder: { updatedAt: 'DESC' },
  defaultPageSize: 15,
  properties: {
    materialCode: {
      type: 'string',
      title: '物料编码',
    },
    materialName: {
      type: 'string',
      title: '物料名称',
    },
    quantity: {
      type: 'number',
      title: '数量',
    },
    unit: {
      type: 'string',
      title: '单位',
    },
    warehouseLocation: {
      type: 'string',
      title: '库位',
    },
    updatedAt: {
      type: 'string',
      title: '更新时间',
    },
  },
}

/**
 * 注册所有模型
 * 在应用启动时调用一次
 */
export function registerModels() {
  modelRegistry.registerModel('投产通知单', productionOrderModel)
  modelRegistry.registerModel('生产类型判定记录', productionTypeDeterminationModel)
  modelRegistry.registerModel('设备', equipmentModel)
  modelRegistry.registerModel('库存', inventoryModel)
}

