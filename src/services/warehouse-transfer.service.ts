// 调拨管理服务
import type { WarehouseTransfer, WarehouseTransferForm, TransferStats, TransferStatus, TransferType } from '@/types/warehouse-transfer'
import { WAREHOUSES, TRANSFER_TYPES, TRANSFER_STATUS, MOCK_MATERIALS_FOR_TRANSFER } from '@/types/warehouse-transfer'
import type { PageParams, PageResponse } from '@/types/api'

// 重新导出常量，方便统一导入
export { WAREHOUSES, TRANSFER_TYPES, TRANSFER_STATUS, MOCK_MATERIALS_FOR_TRANSFER }

// 生成调拨单号
function generateTransferNo(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `TB${year}${month}${day}${random}`
}

// 模拟数据
const mockTransfers: WarehouseTransfer[] = [
  { 
    id: '1', 
    transferNo: 'TB202603270001', 
    transferType: 'allocation', 
    sourceWarehouse: '一级库', 
    targetWarehouse: '二级库-车间1',
    materialId: '1',
    materialCode: 'MAT-001',
    materialName: '钢材Q235',
    quantity: 500,
    status: 'pending',
    applicant: '张三',
    applyTime: '2024-03-27 09:30:00',
  },
  { 
    id: '2', 
    transferNo: 'TB202603270002', 
    transferType: 'allocation', 
    sourceWarehouse: '一级库', 
    targetWarehouse: '二级库-车间2',
    materialId: '2',
    materialCode: 'MAT-002',
    materialName: '铝材6061',
    quantity: 200,
    status: 'approved',
    applicant: '李四',
    applyTime: '2024-03-27 10:00:00',
    approver: '王经理',
    approveTime: '2024-03-27 14:00:00',
  },
  { 
    id: '3', 
    transferNo: 'TB202603260003', 
    transferType: 'return', 
    sourceWarehouse: '二级库-车间1', 
    targetWarehouse: '一级库',
    materialId: '4',
    materialCode: 'MAT-004',
    materialName: '螺丝M6*20',
    quantity: 1000,
    status: 'completed',
    applicant: '赵六',
    applyTime: '2024-03-26 15:00:00',
    approver: '王经理',
    approveTime: '2024-03-26 16:00:00',
    outboundTime: '2024-03-26 17:00:00',
    inboundTime: '2024-03-27 09:00:00',
  },
  { 
    id: '4', 
    transferNo: 'TB202603260004', 
    transferType: 'allocation', 
    sourceWarehouse: '一级库', 
    targetWarehouse: '二级库-车间3',
    materialId: '5',
    materialCode: 'MAT-005',
    materialName: '轴承6205',
    quantity: 50,
    status: 'rejected',
    applicant: '孙七',
    applyTime: '2024-03-26 11:00:00',
    approver: '王经理',
    approveTime: '2024-03-26 14:30:00',
    approveRemark: '库存不足',
  },
  { 
    id: '5', 
    transferNo: 'TB202603250005', 
    transferType: 'allocation', 
    sourceWarehouse: '一级库', 
    targetWarehouse: '二级库-车间1',
    materialId: '6',
    materialCode: 'MAT-006',
    materialName: '润滑油',
    quantity: 100,
    status: 'in_transit',
    applicant: '张三',
    applyTime: '2024-03-25 09:00:00',
    approver: '王经理',
    approveTime: '2024-03-25 10:00:00',
    outboundTime: '2024-03-25 14:00:00',
  },
  { 
    id: '6', 
    transferNo: 'TB202603240006', 
    transferType: 'return', 
    sourceWarehouse: '二级库-车间2', 
    targetWarehouse: '一级库',
    materialId: '7',
    materialCode: 'MAT-007',
    materialName: '焊条J422',
    quantity: 50,
    status: 'pending',
    applicant: '钱八',
    applyTime: '2024-03-24 16:00:00',
  },
  { 
    id: '7', 
    transferNo: 'TB202603230007', 
    transferType: 'allocation', 
    sourceWarehouse: '一级库', 
    targetWarehouse: '二级库-车间3',
    materialId: '8',
    materialCode: 'MAT-008',
    materialName: '油漆',
    quantity: 200,
    status: 'draft',
    applicant: '孙七',
    applyTime: '2024-03-23 10:00:00',
  },
  { 
    id: '8', 
    transferNo: 'TB202603220008', 
    transferType: 'allocation', 
    sourceWarehouse: '一级库', 
    targetWarehouse: '二级库-车间1',
    materialId: '1',
    materialCode: 'MAT-001',
    materialName: '钢材Q235',
    quantity: 1000,
    status: 'completed',
    applicant: '张三',
    applyTime: '2024-03-22 09:00:00',
    approver: '王经理',
    approveTime: '2024-03-22 10:30:00',
    outboundTime: '2024-03-22 15:00:00',
    inboundTime: '2024-03-23 10:00:00',
  },
]

/**
 * 获取调拨单列表
 */
export async function getWarehouseTransfers(params: PageParams & {
  status?: TransferStatus
  transferType?: TransferType
  search?: string
}): Promise<PageResponse<WarehouseTransfer>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockTransfers]

        // 过滤
        if (params.status) {
          data = data.filter(item => item.status === params.status)
        }
        if (params.transferType) {
          data = data.filter(item => item.transferType === params.transferType)
        }
        if (params.search) {
          const search = params.search.toLowerCase()
          data = data.filter(item => 
            item.transferNo.toLowerCase().includes(search) ||
            item.materialCode.toLowerCase().includes(search) ||
            item.materialName.toLowerCase().includes(search)
          )
        }

        // 按创建时间倒序
        data.sort((a, b) => new Date(b.createTime || b.applyTime || 0).getTime() - new Date(a.createTime || a.applyTime || 0).getTime())

        // 分页
        const page = params.page || 1
        const size = params.size || 15
        const start = (page - 1) * size
        const end = start + size
        const paginatedData = data.slice(start, end)

        resolve({
          list: paginatedData,
          page,
          size,
          total: data.length,
          totalPages: Math.ceil(data.length / size),
        })
      }, 300)
    })
  }

  // TODO: 实际API调用
  return { list: [], page: 1, size: 15, total: 0, totalPages: 0 }
}

/**
 * 获取调拨单详情
 */
export async function getWarehouseTransferById(id: string): Promise<WarehouseTransfer | null> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const transfer = mockTransfers.find(item => item.id === id) || null
        resolve(transfer)
      }, 200)
    })
  }

  // TODO: 实际API调用
  return null
}

/**
 * 创建调拨单
 */
export async function createWarehouseTransfer(data: WarehouseTransferForm): Promise<WarehouseTransfer> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTransfer: WarehouseTransfer = {
          id: String(Date.now()),
          transferNo: generateTransferNo(),
          ...data,
          status: 'pending',
          applicant: '当前用户', // 实际应该从上下文获取
          applyTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
          createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        }
        mockTransfers.push(newTransfer)
        resolve(newTransfer)
      }, 300)
    })
  }

  // TODO: 实际API调用
  throw new Error('Not implemented')
}

/**
 * 更新调拨单
 */
export async function updateWarehouseTransfer(id: string, data: Partial<WarehouseTransferForm>): Promise<WarehouseTransfer> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTransfers.findIndex(item => item.id === id)
        if (index === -1) {
          reject(new Error('调拨单不存在'))
          return
        }
        mockTransfers[index] = {
          ...mockTransfers[index],
          ...data,
          updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        }
        resolve(mockTransfers[index])
      }, 300)
    })
  }

  // TODO: 实际API调用
  throw new Error('Not implemented')
}

/**
 * 删除调拨单（只能是草稿状态）
 */
export async function deleteWarehouseTransfer(id: string): Promise<void> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTransfers.findIndex(item => item.id === id)
        if (index === -1) {
          reject(new Error('调拨单不存在'))
          return
        }
        if (mockTransfers[index].status !== 'draft') {
          reject(new Error('只能删除草稿状态的调拨单'))
          return
        }
        mockTransfers.splice(index, 1)
        resolve()
      }, 300)
    })
  }

  // TODO: 实际API调用
  throw new Error('Not implemented')
}

/**
 * 审批调拨单
 */
export async function approveWarehouseTransfer(id: string, approved: boolean, remark?: string): Promise<WarehouseTransfer> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTransfers.findIndex(item => item.id === id)
        if (index === -1) {
          reject(new Error('调拨单不存在'))
          return
        }
        const transfer = mockTransfers[index]
        
        if (transfer.status !== 'pending') {
          reject(new Error('只能审批待审批状态的调拨单'))
          return
        }

        // 只有审批通过且是调拨类型才更新状态为approved，退货类型直接完成
        if (approved) {
          transfer.status = transfer.transferType === 'allocation' ? 'approved' : 'in_transit'
        } else {
          transfer.status = 'rejected'
        }
        
        transfer.approver = '当前审批人' // 实际应该从上下文获取
        transfer.approveTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
        transfer.approveRemark = remark || ''
        
        resolve(transfer)
      }, 300)
    })
  }

  // TODO: 实际API调用
  throw new Error('Not implemented')
}

/**
 * 确认出库
 */
export async function outboundWarehouseTransfer(id: string): Promise<WarehouseTransfer> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTransfers.findIndex(item => item.id === id)
        if (index === -1) {
          reject(new Error('调拨单不存在'))
          return
        }
        const transfer = mockTransfers[index]
        
        if (transfer.status !== 'approved') {
          reject(new Error('只能对已审批的调拨单进行出库'))
          return
        }

        transfer.status = 'in_transit'
        transfer.outboundTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
        
        resolve(transfer)
      }, 300)
    })
  }

  // TODO: 实际API调用
  throw new Error('Not implemented')
}

/**
 * 确认入库
 */
export async function inboundWarehouseTransfer(id: string): Promise<WarehouseTransfer> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTransfers.findIndex(item => item.id === id)
        if (index === -1) {
          reject(new Error('调拨单不存在'))
          return
        }
        const transfer = mockTransfers[index]
        
        if (transfer.status !== 'in_transit') {
          reject(new Error('只能对运输中的调拨单进行入库'))
          return
        }

        transfer.status = 'completed'
        transfer.inboundTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
        
        resolve(transfer)
      }, 300)
    })
  }

  // TODO: 实际API调用
  throw new Error('Not implemented')
}

/**
 * 取消调拨单
 */
export async function cancelWarehouseTransfer(id: string, reason?: string): Promise<WarehouseTransfer> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTransfers.findIndex(item => item.id === id)
        if (index === -1) {
          reject(new Error('调拨单不存在'))
          return
        }
        const transfer = mockTransfers[index]
        
        if (transfer.status === 'completed' || transfer.status === 'cancelled') {
          reject(new Error('无法取消已完成的调拨单'))
          return
        }

        transfer.status = 'cancelled'
        transfer.remark = reason ? `${transfer.remark || ''} 取消原因: ${reason}` : transfer.remark
        
        resolve(transfer)
      }, 300)
    })
  }

  // TODO: 实际API调用
  throw new Error('Not implemented')
}

/**
 * 获取调拨单统计
 */
export async function getTransferStats(): Promise<TransferStats> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = mockTransfers
        
        const total = data.length
        const pending = data.filter(item => item.status === 'pending').length
        const approved = data.filter(item => item.status === 'approved').length
        const rejected = data.filter(item => item.status === 'rejected').length
        const inTransit = data.filter(item => item.status === 'in_transit').length
        const completed = data.filter(item => item.status === 'completed').length

        resolve({
          total,
          pending,
          approved,
          rejected,
          inTransit,
          completed,
        })
      }, 200)
    })
  }

  // TODO: 实际API调用
  return { total: 0, pending: 0, approved: 0, rejected: 0, inTransit: 0, completed: 0 }
}
