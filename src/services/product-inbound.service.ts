/**
 * 成品入库管理服务
 */
import type { PageParams, PageResponse } from '@/types/api'
import type { ProductInbound } from '@/types/product-inbound'

// 质量状态选项
export const QUALITY_STATUS = [
  { value: '合格', label: '合格', color: '#22c55e' },
  { value: '让步接收', label: '让步接收', color: '#f59e0b' },
]

// 入库状态选项
export const INBOUND_STATUS = [
  { value: '待入库', label: '待入库', color: '#f59e0b' },
  { value: '已入库', label: '已入库', color: '#22c55e' },
]

// 仓库选项
export const WAREHOUSES = [
  { value: '成品库A', label: '成品库A' },
  { value: '成品库B', label: '成品库B' },
  { value: '半成品库', label: '半成品库' },
]

// 产品列表
const PRODUCTS = [
  { code: 'PI-GC-001', name: '精密齿轮组件' },
  { code: 'PI-YF-001', name: '液压阀总成' },
  { code: 'PI-CD-001', name: '传动轴总成' },
  { code: 'PI-SK-001', name: '数控刀柄' },
  { code: 'PI-WL-001', name: '涡轮叶轮组件' },
  { code: 'PI-LP-001', name: '离合器总成' },
  { code: 'PI-ZC-001', name: '轴承座组件' },
  { code: 'PI-BT-001', name: '泵体总成' },
  { code: 'PI-FL-001', name: '法兰组件' },
  { code: 'PI-SD-001', name: '伺服电机总成' },
]

const INSPECTORS = ['检验员A', '检验员B', '检验员C', '检验员D']
const KEEPERS = ['保管员甲', '保管员乙', '保管员丙']
const USERS = ['张三', '李四', '王五', '赵六']
const LOCATIONS = ['A-01-01', 'A-01-02', 'A-02-01', 'B-01-01', 'B-01-02', 'B-02-01', 'C-01-01', 'C-01-02']

// 模拟数据
const mockProductInbounds: ProductInbound[] = Array.from({ length: 25 }, (_, i) => {
  const product = PRODUCTS[i % PRODUCTS.length]
  const warehouse = WAREHOUSES[i % WAREHOUSES.length]
  const qualityStatuses: Array<'合格' | '让步接收'> = ['合格', '让步接收']
  const qualityStatus = qualityStatuses[i % 5 === 0 ? 1 : 0]
  const statuses: Array<'待入库' | '已入库'> = ['待入库', '已入库']
  const status = statuses[i < 8 ? 0 : 1]
  const day = String(27 - (i % 27)).padStart(2, '0')
  const month = i < 10 ? '03' : '02'

  return {
    id: `pi-${String(i + 1).padStart(3, '0')}`,
    inboundNo: `PI${String(202503270000 + i + 1)}`,
    taskId: `TASK-${String(i + 1).padStart(4, '0')}`,
    taskNo: `WO-2025-0${String(i + 1).padStart(3, '0')}`,
    orderId: `ORD-${String(i + 1).padStart(4, '0')}`,
    batchNo: `B2025${month}${day}${String(i + 1).padStart(3, '0')}`,
    warehouseId: `WH-${String((i % 3) + 1).padStart(3, '0')}`,
    warehouseName: warehouse.value,
    location: LOCATIONS[i % LOCATIONS.length],
    productCode: product.code,
    productName: product.name,
    inboundDate: `2025-${month}-${day}`,
    quantity: Math.floor(Math.random() * 200) + 10,
    inspector: INSPECTORS[i % INSPECTORS.length],
    finalInspectionNo: `FC-${String(202503270000 + i + 1).slice(2)}`,
    qualityStatus,
    status,
    keeper: status === '已入库' ? KEEPERS[i % KEEPERS.length] : '',
    remark: i % 4 === 0 ? '注意轻放' : '',
    _createTime: `2025-${month}-${day} ${String(8 + (i % 10)).padStart(2, '0')}:00:00`,
    createUser: USERS[i % USERS.length],
    _updateTime: `2025-${month}-${day} ${String(10 + (i % 8)).padStart(2, '0')}:30:00`,
  }
})

/**
 * 获取成品入库列表
 */
export async function getProductInboundList(params: PageParams & {
  status?: string
  search?: string
  qualityStatus?: string
  warehouse?: string
}): Promise<PageResponse<ProductInbound>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockProductInbounds]

      if (params.status && params.status !== 'all') {
        filtered = filtered.filter(item => item.status === params.status)
      }
      if (params.qualityStatus && params.qualityStatus !== 'all') {
        filtered = filtered.filter(item => item.qualityStatus === params.qualityStatus)
      }
      if (params.warehouse && params.warehouse !== 'all') {
        filtered = filtered.filter(item => item.warehouseName === params.warehouse)
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        filtered = filtered.filter(item =>
          item.inboundNo.toLowerCase().includes(searchLower) ||
          item.taskNo.toLowerCase().includes(searchLower) ||
          item.batchNo.toLowerCase().includes(searchLower) ||
          item.productName.toLowerCase().includes(searchLower)
        )
      }

      const total = filtered.length
      const start = (params.page - 1) * params.size
      const end = start + params.size
      const list = filtered.slice(start, end)

      resolve({
        list,
        total,
        page: params.page,
        size: params.size,
        totalPages: Math.ceil(total / params.size),
      })
    }, 400)
  })
}

/**
 * 创建成品入库单
 */
export async function createProductInbound(data: Partial<ProductInbound>): Promise<ProductInbound> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newInbound: ProductInbound = {
        id: `pi-${Date.now()}`,
        inboundNo: `PI${String(Date.now()).padStart(13, '0').slice(0, 10)}`,
        taskId: data.taskId || `TASK-${Date.now()}`,
        taskNo: data.taskNo || '',
        orderId: data.orderId || '',
        batchNo: data.batchNo || '',
        warehouseId: data.warehouseId || '',
        warehouseName: data.warehouseName || '',
        location: data.location || '',
        productCode: data.productCode || '',
        productName: data.productName || '',
        inboundDate: data.inboundDate || new Date().toISOString().split('T')[0],
        quantity: data.quantity || 0,
        inspector: data.inspector || '',
        finalInspectionNo: data.finalInspectionNo || '',
        qualityStatus: data.qualityStatus || '合格',
        status: '待入库',
        keeper: '',
        remark: data.remark || '',
        _createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        createUser: data.createUser || '当前用户',
        _updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }
      mockProductInbounds.unshift(newInbound)
      resolve(newInbound)
    }, 300)
  })
}

/**
 * 更新成品入库单
 */
export async function updateProductInbound(id: string, data: Partial<ProductInbound>): Promise<ProductInbound> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockProductInbounds.findIndex(item => item.id === id)
      if (index !== -1) {
        const updated = {
          ...mockProductInbounds[index],
          ...data,
          _updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        }
        mockProductInbounds[index] = updated
        resolve(updated)
      } else {
        resolve({} as ProductInbound)
      }
    }, 300)
  })
}

/**
 * 删除成品入库单
 */
export async function deleteProductInbound(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockProductInbounds.findIndex(item => item.id === id)
      if (index !== -1) {
        mockProductInbounds.splice(index, 1)
        resolve(true)
      } else {
        resolve(false)
      }
    }, 300)
  })
}

/**
 * 确认入库
 */
export async function confirmInbound(id: string, keeper: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockProductInbounds.findIndex(item => item.id === id)
      if (index !== -1) {
        mockProductInbounds[index].status = '已入库'
        mockProductInbounds[index].keeper = keeper || '保管员甲'
        mockProductInbounds[index]._updateTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
        resolve(true)
      } else {
        resolve(false)
      }
    }, 300)
  })
}
