import type { PageParams, PageResponse } from '@/types/api'
import type { LaborStandard, StandardStatus } from '@/types/labor-standard'

export const STANDARD_STATUS: { value: StandardStatus; label: string; color: string }[] = [
  { value: '启用', label: '启用', color: '#52c41a' },
  { value: '停用', label: '停用', color: '#999' },
]

const mockData: LaborStandard[] = Array.from({ length: 25 }, (_, i) => {
  const products = ['齿轮-A01','轴-B02','阀体-C03','涡轮-D04','壳体-E05','法兰-F06']
  const steps = ['车削','铣削','磨削','钻孔','热处理','检验','装配']
  const equipments = ['CNC车床','数控铣床','外圆磨床','钻床','热处理炉','三坐标','装配台']
  const idx = Math.floor(i / 3)
  return {
    id: `ls-${i+1}`,
    productCode: products[idx % 6],
    stepNo: `${idx+1}.${(i%3)+1}`,
    stepName: steps[i%7],
    equipmentType: equipments[i%7],
    standardTime: Math.round((Math.random()*4+0.5)*100)/100,
    preparationTime: Math.round(Math.random()*60)/100,
    batchSize: [50,100,200][i%3],
    difficultyCoefficient: [1.0,1.1,1.2,1.3,1.5][i%5],
    batchCoefficient: [0.8,0.9,1.0,1.1,1.2][i%5],
    version: i < 15 ? 'v1.0' : 'v2.0',
    effectiveDate: i < 15 ? '2025-01-01' : '2026-01-01',
    status: i === 24 ? '停用' : '启用',
    remark: '',
    _createTime: i < 15 ? '2025-01-01 08:00:00' : '2026-01-01 08:00:00',
    createUser: 'admin',
    _updateTime: i < 15 ? '2025-01-01 08:00:00' : '2026-01-01 08:00:00',
  }
})

export async function getLaborStandardList(params?: PageParams & { status?: string; search?: string }): Promise<PageResponse<LaborStandard>> {
  const { page = 1, size = 15, status, search } = params || {}
  await new Promise(r => setTimeout(r, 300))
  let filtered = [...mockData]
  if (status && status !== 'all') filtered = filtered.filter(i => i.status === status)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.productCode.toLowerCase().includes(s) || i.stepName.toLowerCase().includes(s))
  }
  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createLaborStandard(data: Partial<LaborStandard>): Promise<LaborStandard> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as LaborStandard
}

export async function updateLaborStandard(id: string, data: Partial<LaborStandard>): Promise<LaborStandard> {
  await new Promise(r => setTimeout(r, 200))
  return { id, ...data } as LaborStandard
}

export async function deleteLaborStandard(_id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}
