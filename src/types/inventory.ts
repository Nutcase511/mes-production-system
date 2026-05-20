// 库存相关类型定义

export type MaterialType = 'raw' | 'tool' | 'gauge' | 'fixture' | 'semi' | 'finished'

export interface Material {
  id: string
  materialId: string        // 物料编码
  materialName: string
  materialType: MaterialType
  spec: string
  grade: string
  unit: string
  warehouse: string         // 仓库
  location: string          // 库位
  quantity: number
  availableQty: number      // 可用数量
  batchNo: string
  supplier: string
}
