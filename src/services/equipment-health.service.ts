export interface HealthScore {
  equipmentId: string
  overallScore: number
  factors: { runtime: number; maintenance: number; failure: number; quality: number }
  trend: 'up' | 'stable' | 'down'
}

export function calculateHealthScore(equipmentId: string): HealthScore {
  return {
    equipmentId,
    overallScore: 85,
    factors: { runtime: 90, maintenance: 80, failure: 85, quality: 88 },
    trend: 'stable'
  }
}

// 设备健康度详情
export interface HealthDetail {
  equipmentId: string
  equipmentName: string
  overallScore: number
  factors: {
    runtime: { score: number; value: number; unit: string }
    maintenance: { score: number; lastDate: Date; nextDate: Date }
    failure: { score: number; count: number; mtbf: number }
    quality: { score: number; passRate: number }
  }
  trend: 'up' | 'stable' | 'down'
  trendHistory: { date: Date; score: number }[]
  alerts: { level: 'warning' | 'critical'; message: string }[]
}

export function getHealthDetail(equipmentId: string): HealthDetail {
  return {
    equipmentId,
    equipmentName: '设备-' + equipmentId,
    overallScore: 85,
    factors: {
      runtime: { score: 90, value: 1200, unit: '小时' },
      maintenance: { 
        score: 80, 
        lastDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      failure: { score: 85, count: 2, mtbf: 600 },
      quality: { score: 88, passRate: 98.5 }
    },
    trend: 'stable',
    trendHistory: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), score: 82 },
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), score: 83 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), score: 84 },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), score: 84 },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), score: 85 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), score: 85 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), score: 85 },
    ],
    alerts: [
      { level: 'warning', message: '即将到达保养周期' }
    ]
  }
}

// 批量计算健康度
export function batchCalculateHealthScore(equipmentIds: string[]): HealthScore[] {
  return equipmentIds.map(id => calculateHealthScore(id))
}
