export type GaugeType = '卡尺' | '千分尺' | '三坐标' | '粗糙度仪'
export type GaugeInspectionResult = '合格' | '不合格'

export interface GaugeInspectionItem {
  itemNo: string
  itemName: string
  standardValue: string
  measuredValue: string
  result: '合格' | '不合格'
}

export interface GaugeInspection {
  id: string
  inspectionNo: string
  gaugeId: string
  gaugeCode: string
  gaugeName: string
  gaugeType: GaugeType
  inspectionDate: string
  inspector: string
  inspectionItems: GaugeInspectionItem[]
  inspectionResult: GaugeInspectionResult
  nextInspectionDate: string
  remark: string
  _createTime: string
  createUser: string
  _updateTime: string
}
