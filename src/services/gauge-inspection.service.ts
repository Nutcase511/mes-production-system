import type { PageParams, PageResponse } from '@/types/api'
import type { GaugeInspection, GaugeType, GaugeInspectionResult } from '@/types/gauge-inspection'

export const GAUGE_TYPES: { value: GaugeType; label: string }[] = [
  { value: '卡尺', label: '卡尺' },
  { value: '千分尺', label: '千分尺' },
  { value: '三坐标', label: '三坐标' },
  { value: '粗糙度仪', label: '粗糙度仪' },
]

export const GAUGE_INSPECTION_RESULTS: { value: GaugeInspectionResult; label: string; color: string }[] = [
  { value: '合格', label: '合格', color: '#52c41a' },
  { value: '不合格', label: '不合格', color: '#ff4d4f' },
]

const mockData: GaugeInspection[] = Array.from({ length: 20 }, (_, i) => {
  const types: GaugeType[] = ['卡尺', '千分尺', '三坐标', '粗糙度仪']
  const isFail = i % 5 === 4
  const inspectors = ['郑丽', '王测量', '李检验']
  const gauges = ['数显卡尺-001','外径千分尺-005','内径千分尺-003','三坐标测量仪-001','粗糙度仪-002','杠杆千分尺-001']
  const items = [
    { itemNo: '1', itemName: '示值误差', standardValue: '±0.01mm', measuredValue: isFail?'0.015mm':'0.005mm', result: (isFail?'不合格':'合格') as '合格'|'不合格' },
    { itemNo: '2', itemName: '重复性', standardValue: '≤0.005mm', measuredValue: isFail?'0.008mm':'0.003mm', result: (isFail?'不合格':'合格') as '合格'|'不合格' },
    { itemNo: '3', itemName: '外观检查', standardValue: '无损伤、刻度清晰', measuredValue: '正常', result: '合格' as '合格'|'不合格' },
  ]
  const dt = new Date(2026, 2 - Math.floor(i/5), (i%28)+1)
  return {
    id: `gi-${i+1}`,
    inspectionNo: `GI${String(Date.now()).slice(-10).slice(0,-i%4)}${String(i+1).padStart(4,'0')}`,
    gaugeId: `g-${(i%6)+1}`,
    gaugeCode: gauges[i%6].split('-')[0]+'-'+gauges[i%6].split('-')[1],
    gaugeName: gauges[i%6],
    gaugeType: types[i%4],
    inspectionDate: `${dt.toISOString().slice(0,10)} 09:00`,
    inspector: inspectors[i%3],
    inspectionItems: items,
    inspectionResult: isFail?'不合格':'合格',
    nextInspectionDate: new Date(dt.getTime() + 180*86400000).toISOString().slice(0,10),
    remark: isFail?'示值超差，建议校准或更换':'',
    _createTime: `${dt.toISOString().slice(0,10)} 09:00:00`,
    createUser: inspectors[i%3],
    _updateTime: `${dt.toISOString().slice(0,10)} 09:00:00`,
  }
})

export async function getGaugeInspectionList(params?: PageParams & { gaugeType?: string; result?: string; search?: string }): Promise<PageResponse<GaugeInspection>> {
  const { page = 1, size = 15, gaugeType, result, search } = params || {}
  await new Promise(r => setTimeout(r, 300))
  let filtered = [...mockData]
  if (gaugeType && gaugeType !== 'all') filtered = filtered.filter(i => i.gaugeType === gaugeType)
  if (result && result !== 'all') filtered = filtered.filter(i => i.inspectionResult === result)
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(i => i.inspectionNo.toLowerCase().includes(s) || i.gaugeName.toLowerCase().includes(s) || i.gaugeCode.toLowerCase().includes(s))
  }
  const total = filtered.length
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) }
}

export async function createGaugeInspection(data: Partial<GaugeInspection>): Promise<GaugeInspection> {
  await new Promise(r => setTimeout(r, 200))
  return { id: Date.now().toString(), ...data } as GaugeInspection
}

export async function updateGaugeInspection(id: string, data: Partial<GaugeInspection>): Promise<GaugeInspection> {
  await new Promise(r => setTimeout(r, 200))
  return { id, ...data } as GaugeInspection
}

export async function deleteGaugeInspection(_id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200))
  return true
}
