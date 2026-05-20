/**
 * 报废单管理服务
 */
import type { PageParams, PageResponse } from '@/types/api'
import type { ScrapOrder } from '@/types/scrap-order'

// 报废类型选项
export const SCRAP_TYPES = [
  { value: '生产报废', label: '生产报废', color: '#ef4444' },
  { value: '检验报废', label: '检验报废', color: '#f59e0b' },
  { value: '外协报废', label: '外协报废', color: '#8b5cf6' },
]

// 缺陷等级选项
export const DEFECT_LEVELS = [
  { value: 'Class I', label: 'Class I - 轻微', color: '#22c55e' },
  { value: 'Class II', label: 'Class II - 严重', color: '#f59e0b' },
  { value: 'Class III', label: 'Class III - 致命', color: '#ef4444' },
]

// 审批状态选项
export const APPROVAL_STATUS = [
  { value: '待审批', label: '待审批', color: '#eab308' },
  { value: '已批准', label: '已批准', color: '#22c55e' },
  { value: '已拒绝', label: '已拒绝', color: '#ef4444' },
]

// 报废状态选项
export const SCRAP_STATUS = [
  { value: '待报废', label: '待报废', color: '#f59e0b' },
  { value: '已报废', label: '已报废', color: '#6b7280' },
]

// 产品列表
const PRODUCTS = [
  { code: 'P-GC-001', name: '精密齿轮' },
  { code: 'P-YY-001', name: '液压缸体' },
  { code: 'P-CD-001', name: '传动轴' },
  { code: 'P-FM-001', name: '阀门芯' },
  { code: 'P-WL-001', name: '涡轮叶片' },
  { code: 'P-LP-001', name: '离合器片' },
  { code: 'P-ZC-001', name: '轴承座' },
  { code: 'P-FL-001', name: '法兰盘' },
  { code: 'P-SC-001', name: '伺服电机壳' },
  { code: 'P-BT-001', name: '泵体组件' },
]

const UNITS = ['件', '个', '套']
const SCRAP_REASONS = [
  '尺寸超差', '表面缺陷', '材料裂纹', '热处理不合格',
  '加工变形', '装配干涉', '功能失效', '外观不良',
]
const PERSONS = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
const APPROVERS = ['主管A', '主管B', '经理C']

// 模拟数据
const mockScrapOrders: ScrapOrder[] = Array.from({ length: 25 }, (_, i) => {
  const product = PRODUCTS[i % PRODUCTS.length]
  const scrapType = SCRAP_TYPES[i % SCRAP_TYPES.length].value as any
  const defectLevel = DEFECT_LEVELS[i % DEFECT_LEVELS.length].value as any
  const approvalStatuses: Array<'待审批' | '已批准' | '已拒绝'> = ['待审批', '已批准', '已拒绝']
  const approvalStatus = approvalStatuses[i % 3]
  const statuses: Array<'待报废' | '已报废'> = ['待报废', '已报废']
  const status = approvalStatus === '已批准' ? statuses[i % 2] : '待报废'
  const quantity = Math.floor(Math.random() * 50) + 1
  const unitCost = Math.floor(Math.random() * 500) + 50
  const totalCost = quantity * unitCost
  const day = String(27 - (i % 27)).padStart(2, '0')
  const month = i < 5 ? '03' : '02'

  return {
    id: `scrap-${String(i + 1).padStart(3, '0')}`,
    scrapNo: `SC${String(202503270000 + i + 1)}`,
    taskId: `TASK-${String(i + 1).padStart(4, '0')}`,
    batchNo: `B2025${month}${day}${String(i + 1).padStart(3, '0')}`,
    scrapType,
    scrapReason: SCRAP_REASONS[i % SCRAP_REASONS.length],
    defectLevel,
    productCode: product.code,
    productName: product.name,
    quantity,
    unit: UNITS[i % UNITS.length],
    unitCost,
    totalCost,
    residualValue: Math.floor(totalCost * 0.1),
    responsiblePerson: PERSONS[i % PERSONS.length],
    approvalStatus,
    approver: approvalStatus !== '待审批' ? APPROVERS[i % APPROVERS.length] : '',
    approvalDate: approvalStatus !== '待审批' ? `2025-${month}-${day}` : '',
    status,
    remark: i % 3 === 0 ? '需跟踪原因分析' : '',
    _createTime: `2025-${month}-${day} ${String(8 + (i % 10)).padStart(2, '0')}:00:00`,
    createUser: PERSONS[i % PERSONS.length],
    _updateTime: `2025-${month}-${day} ${String(10 + (i % 8)).padStart(2, '0')}:30:00`,
  }
})

/**
 * 获取报废单列表
 */
export async function getScrapOrderList(params: PageParams & {
  status?: string
  search?: string
  scrapType?: string
  approvalStatus?: string
}): Promise<PageResponse<ScrapOrder>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockScrapOrders]

      if (params.status && params.status !== 'all') {
        filtered = filtered.filter(item => item.status === params.status)
      }
      if (params.approvalStatus && params.approvalStatus !== 'all') {
        filtered = filtered.filter(item => item.approvalStatus === params.approvalStatus)
      }
      if (params.scrapType && params.scrapType !== 'all') {
        filtered = filtered.filter(item => item.scrapType === params.scrapType)
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        filtered = filtered.filter(item =>
          item.scrapNo.toLowerCase().includes(searchLower) ||
          item.batchNo.toLowerCase().includes(searchLower) ||
          item.productName.toLowerCase().includes(searchLower) ||
          item.productCode.toLowerCase().includes(searchLower)
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
 * 创建报废单
 */
export async function createScrapOrder(data: Partial<ScrapOrder>): Promise<ScrapOrder> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newOrder: ScrapOrder = {
        id: `scrap-${Date.now()}`,
        scrapNo: `SC${String(Date.now()).padStart(13, '0').slice(0, 10)}`,
        taskId: data.taskId || `TASK-${Date.now()}`,
        batchNo: data.batchNo || '',
        scrapType: data.scrapType || '生产报废',
        scrapReason: data.scrapReason || '',
        defectLevel: data.defectLevel || 'Class II',
        productCode: data.productCode || '',
        productName: data.productName || '',
        quantity: data.quantity || 0,
        unit: data.unit || '件',
        unitCost: data.unitCost || 0,
        totalCost: (data.quantity || 0) * (data.unitCost || 0),
        residualValue: data.residualValue || 0,
        responsiblePerson: data.responsiblePerson || '',
        approvalStatus: '待审批',
        approver: '',
        approvalDate: '',
        status: '待报废',
        remark: data.remark || '',
        _createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        createUser: data.createUser || '当前用户',
        _updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }
      mockScrapOrders.unshift(newOrder)
      resolve(newOrder)
    }, 300)
  })
}

/**
 * 更新报废单
 */
export async function updateScrapOrder(id: string, data: Partial<ScrapOrder>): Promise<ScrapOrder> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockScrapOrders.findIndex(item => item.id === id)
      if (index !== -1) {
        const updated = {
          ...mockScrapOrders[index],
          ...data,
          totalCost: (data.quantity ?? mockScrapOrders[index].quantity) * (data.unitCost ?? mockScrapOrders[index].unitCost),
          _updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        }
        mockScrapOrders[index] = updated
        resolve(updated)
      } else {
        resolve({} as ScrapOrder)
      }
    }, 300)
  })
}

/**
 * 删除报废单
 */
export async function deleteScrapOrder(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockScrapOrders.findIndex(item => item.id === id)
      if (index !== -1) {
        mockScrapOrders.splice(index, 1)
        resolve(true)
      } else {
        resolve(false)
      }
    }, 300)
  })
}

/**
 * 审批报废单
 */
export async function approveScrapOrder(id: string, approved: boolean, comment?: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockScrapOrders.findIndex(item => item.id === id)
      if (index !== -1) {
        mockScrapOrders[index].approvalStatus = approved ? '已批准' : '已拒绝'
        mockScrapOrders[index].approver = '当前审批人'
        mockScrapOrders[index].approvalDate = new Date().toISOString().split('T')[0]
        if (approved) {
          mockScrapOrders[index].status = '待报废'
        }
        mockScrapOrders[index]._updateTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
        if (comment) {
          mockScrapOrders[index].remark = comment
        }
        resolve(true)
      } else {
        resolve(false)
      }
    }, 300)
  })
}
