// 库位管理服务
import type { InventoryLocation, InventoryLocationForm, LocationStats, LocationStatus, LocationType } from '@/types/inventory-location'
import { WAREHOUSE_AREAS, LOCATION_TYPES, LOCATION_STATUS } from '@/types/inventory-location'
import type { PageParams, PageResponse } from '@/types/api'

// 重新导出常量，方便统一导入
export { WAREHOUSE_AREAS, LOCATION_TYPES, LOCATION_STATUS }

// 模拟数据
const mockLocations: InventoryLocation[] = [
  { id: '1', locationCode: 'A-01-001', locationName: 'A区-原料位-001', warehouseArea: 'A区', locationType: 'raw', capacity: 1000, currentQuantity: 500, status: 'occupied', createTime: '2024-01-15 10:00:00' },
  { id: '2', locationCode: 'A-01-002', locationName: 'A区-原料位-002', warehouseArea: 'A区', locationType: 'raw', capacity: 1000, currentQuantity: 0, status: 'idle', createTime: '2024-01-15 10:00:00' },
  { id: '3', locationCode: 'A-01-003', locationName: 'A区-原料位-003', warehouseArea: 'A区', locationType: 'raw', capacity: 800, currentQuantity: 800, status: 'occupied', createTime: '2024-01-15 10:00:00' },
  { id: '4', locationCode: 'B-01-001', locationName: 'B区-半成品位-001', warehouseArea: 'B区', locationType: 'semi-finished', capacity: 500, currentQuantity: 0, status: 'idle', createTime: '2024-01-15 10:00:00' },
  { id: '5', locationCode: 'B-01-002', locationName: 'B区-半成品位-002', warehouseArea: 'B区', locationType: 'semi-finished', capacity: 500, currentQuantity: 300, status: 'occupied', createTime: '2024-01-15 10:00:00' },
  { id: '6', locationCode: 'C-01-001', locationName: 'C区-成品位-001', warehouseArea: 'C区', locationType: 'finished', capacity: 2000, currentQuantity: 1500, status: 'occupied', createTime: '2024-01-15 10:00:00' },
  { id: '7', locationCode: 'C-01-002', locationName: 'C区-成品位-002', warehouseArea: 'C区', locationType: 'finished', capacity: 2000, currentQuantity: 0, status: 'locked', createTime: '2024-01-15 10:00:00' },
  { id: '8', locationCode: 'D-01-001', locationName: 'D区-工具位-001', warehouseArea: 'D区', locationType: 'tool', capacity: 200, currentQuantity: 50, status: 'occupied', createTime: '2024-01-15 10:00:00' },
  { id: '9', locationCode: 'D-01-002', locationName: 'D区-工具位-002', warehouseArea: 'D区', locationType: 'tool', capacity: 200, currentQuantity: 0, status: 'idle', createTime: '2024-01-15 10:00:00' },
  { id: '10', locationCode: 'E-01-001', locationName: 'E区-夹具位-001', warehouseArea: 'E区', locationType: 'fixture', capacity: 300, currentQuantity: 100, status: 'occupied', createTime: '2024-01-15 10:00:00' },
  { id: '11', locationCode: 'A-02-001', locationName: 'A区-原料位-004', warehouseArea: 'A区', locationType: 'raw', capacity: 1000, currentQuantity: 0, status: 'idle', createTime: '2024-01-16 10:00:00' },
  { id: '12', locationCode: 'B-02-001', locationName: 'B区-半成品位-003', warehouseArea: 'B区', locationType: 'semi-finished', capacity: 500, currentQuantity: 0, status: 'locked', createTime: '2024-01-16 10:00:00' },
]

/**
 * 获取库位列表
 */
export async function getInventoryLocations(params: PageParams & {
  warehouseArea?: string
  status?: LocationStatus
  locationType?: LocationType
  search?: string
}): Promise<PageResponse<InventoryLocation>> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockLocations]

        // 过滤
        if (params.warehouseArea) {
          data = data.filter(item => item.warehouseArea === params.warehouseArea)
        }
        if (params.status) {
          data = data.filter(item => item.status === params.status)
        }
        if (params.locationType) {
          data = data.filter(item => item.locationType === params.locationType)
        }
        if (params.search) {
          const search = params.search.toLowerCase()
          data = data.filter(item => 
            item.locationCode.toLowerCase().includes(search) ||
            item.locationName.toLowerCase().includes(search)
          )
        }

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
 * 获取库位详情
 */
export async function getInventoryLocationById(id: string): Promise<InventoryLocation | null> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const location = mockLocations.find(item => item.id === id) || null
        resolve(location)
      }, 200)
    })
  }

  // TODO: 实际API调用
  return null
}

/**
 * 创建库位
 */
export async function createInventoryLocation(data: InventoryLocationForm): Promise<InventoryLocation> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLocation: InventoryLocation = {
          id: String(Date.now()),
          ...data,
          currentQuantity: 0,
          status: 'idle',
          createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
          updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        }
        mockLocations.push(newLocation)
        resolve(newLocation)
      }, 300)
    })
  }

  // TODO: 实际API调用
  throw new Error('Not implemented')
}

/**
 * 更新库位
 */
export async function updateInventoryLocation(id: string, data: Partial<InventoryLocationForm>): Promise<InventoryLocation> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLocations.findIndex(item => item.id === id)
        if (index === -1) {
          reject(new Error('库位不存在'))
          return
        }
        mockLocations[index] = {
          ...mockLocations[index],
          ...data,
          updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        }
        resolve(mockLocations[index])
      }, 300)
    })
  }

  // TODO: 实际API调用
  throw new Error('Not implemented')
}

/**
 * 删除库位
 */
export async function deleteInventoryLocation(id: string): Promise<void> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLocations.findIndex(item => item.id === id)
        if (index === -1) {
          reject(new Error('库位不存在'))
          return
        }
        if (mockLocations[index].status === 'occupied') {
          reject(new Error('该库位已被占用，无法删除'))
          return
        }
        mockLocations.splice(index, 1)
        resolve()
      }, 300)
    })
  }

  // TODO: 实际API调用
  throw new Error('Not implemented')
}

/**
 * 更新库位状态
 */
export async function updateLocationStatus(id: string, status: LocationStatus): Promise<InventoryLocation> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLocations.findIndex(item => item.id === id)
        if (index === -1) {
          reject(new Error('库位不存在'))
          return
        }
        // 如果要设为空闲，当前数量必须为0
        if (status === 'idle' && mockLocations[index].currentQuantity > 0) {
          reject(new Error('该库位有物料，无法设为空闲'))
          return
        }
        mockLocations[index].status = status
        mockLocations[index].updateTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
        resolve(mockLocations[index])
      }, 300)
    })
  }

  // TODO: 实际API调用
  throw new Error('Not implemented')
}

/**
 * 获取库位统计
 */
export async function getLocationStats(warehouseArea?: string): Promise<LocationStats> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = [...mockLocations]
        
        if (warehouseArea) {
          data = data.filter(item => item.warehouseArea === warehouseArea)
        }

        const total = data.length
        const idle = data.filter(item => item.status === 'idle').length
        const occupied = data.filter(item => item.status === 'occupied').length
        const locked = data.filter(item => item.status === 'locked').length
        const usedCapacity = data.reduce((sum, item) => sum + item.currentQuantity, 0)
        const totalCapacity = data.reduce((sum, item) => sum + item.capacity, 0)
        const utilizationRate = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0

        resolve({
          total,
          idle,
          occupied,
          locked,
          utilizationRate,
        })
      }, 200)
    })
  }

  // TODO: 实际API调用
  return { total: 0, idle: 0, occupied: 0, locked: 0, utilizationRate: 0 }
}
