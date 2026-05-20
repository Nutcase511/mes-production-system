/**
 * 终检单管理服务
 */
import type { PageParams, PageResponse } from '@/types/api'
import type { FinalInspection } from '@/types/final-inspection'

// 质量状态选项
export const QUALITY_STATUS = [
  { value: '合格', label: '合格', color: '#22c55e' },
  { value: '不合格', label: '不合格', color: '#ef4444' },
  { value: '让步接收', label: '让步接收', color: '#f59e0b' },
]

// 终检状态选项
export const INSPECTION_STATUS = [
  { value: '待终检', label: '待终检', color: '#eab308' },
  { value: '合格', label: '合格', color: '#22c55e' },
  { value: '不合格', label: '不合格', color: '#ef4444' },
  { value: '已返修', label: '已返修', color: '#3b82f6' },
  { value: '已报废', label: '已报废', color: '#6b7280' },
]

// 处置意见选项
export const DISPOSITION_OPTIONS = [
  '合格入库',
  '返修后重检',
  '报废处理',
  '让步接收',
  '降级使用',
]

// 产品列表
const PRODUCTS = [
  { code: 'P-GC-001', name: '精密齿轮', spec: 'M3 Z20' },
  { code: 'P-YY-001', name: '液压缸体', spec: 'φ80×200' },
  { code: 'P-CD-001', name: '传动轴', spec: 'φ25×300' },
  { code: 'P-FM-001', name: '阀门芯', spec: 'DN50' },
  { code: 'P-WL-001', name: '涡轮叶片', spec: 'TL-200' },
]

const INSPECTORS = ['张工', '李工', '王工', '赵工', '钱工']
const PERSONS = ['张三', '李四', '王五', '赵六', '钱七', '孙八']

// 模拟数据
const mockFinalInspections: FinalInspection[] = Array.from({ length: 25 }, (_, i) => {
  const product = PRODUCTS[i % PRODUCTS.length]
  const qualityStatuses: Array<'合格' | '不合格' | '让步接收'> = ['合格', '不合格', '让步接收']
  const qualityStatus = qualityStatuses[i % 3]
  const inspectionStatuses: Array<'待终检' | '合格' | '不合格' | '已返修' | '已报废'> =
    ['待终检', '合格', '不合格', '已返修', '已报废']
  const inspectionStatus = inspectionStatuses[i % 5]

  const quantity = Math.floor(Math.random() * 100) + 10
  const qualifiedQuantity = qualityStatus === '合格' ? quantity : Math.floor(quantity * 0.7)
  const unqualifiedQuantity = quantity - qualifiedQuantity
  const scrapQuantity = qualityStatus === '不合格' ? Math.floor(unqualifiedQuantity * 0.5) : 0
  const repairQuantity = unqualifiedQuantity - scrapQuantity

  const day = String(31 - (i % 30)).padStart(2, '0')
  const month = i < 10 ? '03' : '02'

  return {
    id: `fi-${String(i + 1).padStart(3, '0')}`,
    inspectionNo: `FI${String(202503310000 + i + 1)}`,
    workOrderId: `WO2503${String(i + 1).padStart(4, '0')}`,
    batchNo: `B2025${month}${day}${String(i + 1).padStart(3, '0')}`,
    productCode: product.code,
    productName: product.name,
    specification: product.spec,
    quantity,
    qualifiedQuantity,
    unqualifiedQuantity,
    scrapQuantity,
    repairQuantity,
    qualityStatus,
    inspectionStatus,
    inspectionDate: `2025-${month}-${day}`,
    inspector: INSPECTORS[i % INSPECTORS.length],
    inspectionItems: [],
    defectDescription: qualityStatus !== '合格' ? '尺寸超差，表面粗糙度不达标' : '',
    disposition: qualityStatus === '合格' ? '合格入库' : DISPOSITION_OPTIONS[i % DISPOSITION_OPTIONS.length],
    remark: i % 4 === 0 ? '需重点关注' : '',
    _createTime: `2025-${month}-${day} ${String(8 + (i % 10)).padStart(2, '0')}:00:00`,
    createUser: PERSONS[i % PERSONS.length],
    _updateTime: `2025-${month}-${day} ${String(10 + (i % 8)).padStart(2, '0')}:30:00`,
  }
})

/**
 * 获取终检单列表
 */
export async function getFinalInspectionList(
  params: PageParams & {
    status?: string
    qualityStatus?: string
    search?: string
  }
): Promise<PageResponse<FinalInspection>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockFinalInspections]

      // 状态筛选
      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((item) => item.inspectionStatus === params.status)
      }

      // 质量状态筛选
      if (params.qualityStatus && params.qualityStatus !== 'all') {
        filtered = filtered.filter((item) => item.qualityStatus === params.qualityStatus)
      }

      // 搜索筛选
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        filtered = filtered.filter(
          (item) =>
            item.inspectionNo.toLowerCase().includes(searchLower) ||
            item.productName.toLowerCase().includes(searchLower) ||
            item.batchNo.toLowerCase().includes(searchLower)
        )
      }

      // 分页
      const start = ((params.page || 1) - 1) * (params.size || 15)
      const end = start + (params.size || 15)
      const paginatedData = filtered.slice(start, end)

      resolve({
        list: paginatedData,
        total: filtered.length,
        page: params.page || 1,
        size: params.size || 15,
        totalPages: Math.ceil(filtered.length / (params.size || 15)),
      })
    }, 300)
  })
}

/**
 * 获取终检单详情
 */
export async function getFinalInspectionDetail(id: string): Promise<FinalInspection | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = mockFinalInspections.find((item) => item.id === id)
      resolve(item || null)
    }, 200)
  })
}

/**
 * 创建终检单
 */
export async function createFinalInspection(
  data: Partial<FinalInspection>
): Promise<FinalInspection> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const newId = `fi-${String(mockFinalInspections.length + 1).padStart(3, '0')}`
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const inspectionNo = `FI${dateStr}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

      const newInspection: FinalInspection = {
        id: newId,
        inspectionNo,
        workOrderId: data.workOrderId || '',
        batchNo: data.batchNo || '',
        productCode: data.productCode || '',
        productName: data.productName || '',
        specification: data.specification || '',
        quantity: data.quantity || 0,
        qualifiedQuantity: data.qualifiedQuantity || 0,
        unqualifiedQuantity: data.unqualifiedQuantity || 0,
        scrapQuantity: data.scrapQuantity || 0,
        repairQuantity: data.repairQuantity || 0,
        qualityStatus: data.qualityStatus || '合格',
        inspectionStatus: data.inspectionStatus || '待终检',
        inspectionDate: data.inspectionDate || new Date().toISOString().split('T')[0],
        inspector: data.inspector || '',
        inspectionItems: data.inspectionItems || [],
        defectDescription: data.defectDescription || '',
        disposition: data.disposition || '',
        remark: data.remark || '',
        _createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        createUser: data.createUser || '当前用户',
        _updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }

      mockFinalInspections.unshift(newInspection)
      resolve(newInspection)
    }, 400)
  })
}

/**
 * 更新终检单
 */
export async function updateFinalInspection(
  id: string,
  data: Partial<FinalInspection>
): Promise<FinalInspection> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockFinalInspections.findIndex((item) => item.id === id)
      if (index === -1) {
        reject(new Error('终检单不存在'))
        return
      }

      const updated = {
        ...mockFinalInspections[index],
        ...data,
        _updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }

      mockFinalInspections[index] = updated
      resolve(updated)
    }, 300)
  })
}

/**
 * 删除终检单
 */
export async function deleteFinalInspection(id: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockFinalInspections.findIndex((item) => item.id === id)
      if (index === -1) {
        reject(new Error('终检单不存在'))
        return
      }

      mockFinalInspections.splice(index, 1)
      resolve(true)
    }, 300)
  })
}

/**
 * 批准终检单（合格入库）
 */
export async function approveFinalInspection(
  id: string,
  inspector: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockFinalInspections.findIndex((item) => item.id === id)
      if (index === -1) {
        reject(new Error('终检单不存在'))
        return
      }

      mockFinalInspections[index].inspectionStatus = '合格'
      mockFinalInspections[index].qualityStatus = '合格'
      mockFinalInspections[index].inspector = inspector
      mockFinalInspections[index]._updateTime = new Date().toISOString().replace('T', ' ').slice(0, 19)

      resolve(true)
    }, 300)
  })
}

/**
 * 拒收终检单（不合格）
 */
export async function rejectFinalInspection(
  id: string,
  defectDescription: string,
  disposition: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockFinalInspections.findIndex((item) => item.id === id)
      if (index === -1) {
        reject(new Error('终检单不存在'))
        return
      }

      mockFinalInspections[index].inspectionStatus = '不合格'
      mockFinalInspections[index].qualityStatus = '不合格'
      mockFinalInspections[index].defectDescription = defectDescription
      mockFinalInspections[index].disposition = disposition
      mockFinalInspections[index]._updateTime = new Date().toISOString().replace('T', ' ').slice(0, 19)

      resolve(true)
    }, 300)
  })
}
