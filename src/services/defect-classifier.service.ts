export interface DefectClassification {
  category: string
  subCategory: string
  cause: string
  suggestion: string
}

const rules = [
  { pattern: /尺寸|大小|长度/, category: '尺寸类', cause: '刀具磨损', suggestion: '更换刀具' },
  { pattern: /外观|表面|划痕/, category: '外观类', cause: '操作不当', suggestion: '规范操作' },
  { pattern: /裂纹|断裂|破碎/, category: '结构类', cause: '材料缺陷', suggestion: '检查材料质量' },
  { pattern: /变形|弯曲|扭曲/, category: '变形类', cause: '热处理不当', suggestion: '调整调度参数' },
  { pattern: /颜色|色差|发黑/, category: '外观类', cause: '表面处理问题', suggestion: '检查表面处理调度' },
  { pattern: /毛刺|飞边/, category: '尺寸类', cause: '加工参数不当', suggestion: '调整加工参数' },
  { pattern: /孔径|孔距/, category: '尺寸类', cause: '定位精度不足', suggestion: '检查夹具精度' },
  { pattern: /粗糙|光洁度/, category: '外观类', cause: '切削参数不当', suggestion: '优化切削参数' },
]

export function classifyDefect(defect: any): DefectClassification {
  for (const rule of rules) {
    if (rule.pattern.test(defect.description)) {
      return { category: rule.category, subCategory: '', cause: rule.cause, suggestion: rule.suggestion }
    }
  }
  return { category: '其他', subCategory: '', cause: '未知', suggestion: '人工检查' }
}

// 批量分类
export function batchClassifyDefects(defects: any[]): DefectClassification[] {
  return defects.map(d => classifyDefect(d))
}

// 缺陷统计分析
export interface DefectStatistics {
  total: number
  byCategory: { category: string; count: number; percentage: number }[]
  byCause: { cause: string; count: number }[]
  topIssues: { description: string; count: number }[]
}

export function analyzeDefects(defects: any[]): DefectStatistics {
  const classifications = batchClassifyDefects(defects)
  
  // 按类别统计
  const categoryMap = new Map<string, number>()
  classifications.forEach(c => {
    categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + 1)
  })
  
  const byCategory = Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: (count / defects.length) * 100
    }))
    .sort((a, b) => b.count - a.count)
  
  // 按原因统计
  const causeMap = new Map<string, number>()
  classifications.forEach(c => {
    causeMap.set(c.cause, (causeMap.get(c.cause) || 0) + 1)
  })
  
  const byCause = Array.from(causeMap.entries())
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count)
  
  // 高频问题
  const descMap = new Map<string, number>()
  defects.forEach(d => {
    descMap.set(d.description, (descMap.get(d.description) || 0) + 1)
  })
  
  const topIssues = Array.from(descMap.entries())
    .map(([description, count]) => ({ description, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  return {
    total: defects.length,
    byCategory,
    byCause,
    topIssues
  }
}
