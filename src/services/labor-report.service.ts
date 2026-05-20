import type { PageParams, PageResponse } from '@/types/api'
import type { LaborReport, ReportType } from '@/types/labor-report'

export const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: '日报', label: '日报' },
  { value: '周报', label: '周报' },
  { value: '月报', label: '月报' },
]

const mockData: LaborReport[] = Array.from({ length: 20 }, (_, i) => {
  const operators = ['张伟','李明','王强','赵磊','陈刚']
  const teams = ['数控一班','数控二班','磨削班','热处理一班','装配一班']
  const reportTypes: ReportType[] = ['日报','周报','月报']
  const stdTime = Math.round((Math.random()*8+4)*100)/100
  const actTime = Math.round((stdTime * (0.8 + Math.random()*0.5))*100)/100
  const efficiency = Math.round((stdTime/actTime)*10000)/100
  const dt = new Date(2026, 2, 27 - Math.floor(i/5), (i%28)+1)
  const workRecords = [
    { taskNo: `WO-202603${String((i%28)+1).padStart(2,'0')}-001`, stepNo: '10', stepName: '车削', standardTime: 2.5, actualTime: 2.8, quantity: 50, qualified: 48 },
    { taskNo: `WO-202603${String((i%28)+1).padStart(2,'0')}-001`, stepNo: '20', stepName: '铣削', standardTime: 3.0, actualTime: 2.5, quantity: 50, qualified: 49 },
    { taskNo: `WO-202603${String((i%28)+1).padStart(2,'0')}-002`, stepNo: '10', stepName: '磨削', standardTime: 1.5, actualTime: 1.8, quantity: 30, qualified: 30 },
  ]
  return {
    id: `lr-${i+1}`,
    reportNo: `LR${String(Date.now()).slice(-10).slice(0,-i%4)}${String(i+1).padStart(4,'0')}`,
    reportDate: dt.toISOString().slice(0,10),
    reportType: reportTypes[i%3],
    operator: operators[i%5],
    teamId: `tm-${(i%5)+7}`,
    teamName: teams[i%5],
    totalStandardTime: stdTime,
    totalActualTime: actTime,
    efficiency: Math.min(efficiency, 150),
    workRecords,
    _createTime: `${dt.toISOString().slice(0,10)} 18:00:00`,
    createUser: operators[i%5],
    _updateTime: `${dt.toISOString().slice(0,10)} 18:00:00`,
  }
})

export async function getLaborReportList(params?: PageParams & { reportType?: string; search?: string }): Promise<PageResponse<LaborReport>> {
  const { page = 1, size = 15, reportType, search } = params || {}
  await new Promise(r => setTimeout(r, 300))
  let filtered = [...mockData]
  if (reportType && reportType !== 'all') filtered = filtered.filter(i => i.reportType === reportType)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.reportNo.toLowerCase().includes(s) || i.operator.toLowerCase().includes(s) || i.teamName.toLowerCase().includes(s))
  }
  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createLaborReport(data: Partial<LaborReport>): Promise<LaborReport> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as LaborReport
}

export async function updateLaborReport(id: string, data: Partial<LaborReport>): Promise<LaborReport> {
  await new Promise(r => setTimeout(r, 200))
  return { id, ...data } as LaborReport
}

export async function deleteLaborReport(_id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}
