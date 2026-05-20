// 调拨管理类型定义

export type TransferStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'in_transit' | 'completed' | 'cancelled'
export type TransferType = 'allocation' | 'return'  // allocation-调拨(一级→二级), return-退货(二级→一级)

export interface WarehouseTransfer {
  id: string
  transferNo: string           // 调拨单号
  transferType: TransferType   // 调拨类型
  sourceWarehouse: string      // 源仓库
  targetWarehouse: string      // 目标仓库
  materialId: string           // 物料ID
  materialCode: string         // 物料编码
  materialName: string         // 物料名称
  quantity: number             // 调拨数量
  status: TransferStatus       // 状态
  applicant: string            // 申请人
  applyTime?: string           // 申请时间
  approver?: string            // 审批人
  approveTime?: string         // 审批时间
  approveRemark?: string       // 审批备注
  outboundTime?: string        // 出库时间
  inboundTime?: string         // 入库时间
  remark?: string              // 备注
  createTime?: string          // 创建时间
  updateTime?: string          // 更新时间
}

// 创建/编辑调拨单表单数据
export interface WarehouseTransferForm {
  transferType: TransferType
  sourceWarehouse: string
  targetWarehouse: string
  materialId: string
  materialCode: string
  materialName: string
  quantity: number
  remark?: string
}

// 调拨单统计
export interface TransferStats {
  total: number
  pending: number
  approved: number
  rejected: number
  inTransit: number
  completed: number
}

// 仓库选项
export const WAREHOUSES = [
  { value: '一级库', label: '一级库（原材料库）' },
  { value: '二级库-车间1', label: '二级库-车间1' },
  { value: '二级库-车间2', label: '二级库-车间2' },
  { value: '二级库-车间3', label: '二级库-车间3' },
]

// 调拨类型选项
export const TRANSFER_TYPES = [
  { value: 'allocation', label: '调拨（一级→二级）' },
  { value: 'return', label: '退货（二级→一级）' },
]

// 状态选项
export const TRANSFER_STATUS = [
  { value: 'draft', label: '草稿', color: 'gray' },
  { value: 'pending', label: '待审批', color: 'yellow' },
  { value: 'approved', label: '已通过', color: 'blue' },
  { value: 'rejected', label: '已驳回', color: 'red' },
  { value: 'in_transit', label: '运输中', color: 'purple' },
  { value: 'completed', label: '已完成', color: 'green' },
  { value: 'cancelled', label: '已取消', color: 'gray' },
]

// 模拟物料数据（用于调拨选择）
export const MOCK_MATERIALS_FOR_TRANSFER = [
  { id: '1', materialCode: 'MAT-001', materialName: '钢材Q235', unit: 'kg' },
  { id: '2', materialCode: 'MAT-002', materialName: '铝材6061', unit: 'kg' },
  { id: '3', materialCode: 'MAT-003', materialName: '塑料颗粒PP', unit: 'kg' },
  { id: '4', materialCode: 'MAT-004', materialName: '螺丝M6*20', unit: '个' },
  { id: '5', materialCode: 'MAT-005', materialName: '轴承6205', unit: '套' },
  { id: '6', materialCode: 'MAT-006', materialName: '润滑油', unit: 'L' },
  { id: '7', materialCode: 'MAT-007', materialName: '焊条J422', unit: 'kg' },
  { id: '8', materialCode: 'MAT-008', materialName: '油漆', unit: 'L' },
]
