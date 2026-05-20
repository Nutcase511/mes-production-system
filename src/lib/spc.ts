// SPC统计过程控制计算工具

export interface SPCResult {
  mean: number
  stdDev: number
  ucl: number
  lcl: number
  cp: number
  cpk: number
  withinLimits: boolean
  outOfControlIndices?: number[]
}

export interface SPCWarning {
  type: 'out_of_control' | 'trend' | 'cycle' | 'clustering'
  message: string
  severity: 'info' | 'warning' | 'error'
  sampleIndex?: number
}

/**
 * 计算SPC统计数据
 * @param data 样本数据
 * @param targetUcl 用户指定的上控制限（可选）
 * @param targetLcl 用户指定的下控制限（可选）
 */
export function calculateSPC(
  data: number[],
  targetUcl?: number,
  targetLcl?: number
): SPCResult {
  const n = data.length
  if (n < 2) {
    return {
      mean: 0,
      stdDev: 0,
      ucl: targetUcl || 0,
      lcl: targetLcl || 0,
      cp: 0,
      cpk: 0,
      withinLimits: false
    }
  }

  // 计算均值
  const mean = data.reduce((sum, x) => sum + x, 0) / n

  // 计算标准差（使用样本标准差）
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1)
  const stdDev = Math.sqrt(variance)

  // 使用用户指定的控制限或计算3σ控制限
  const ucl = targetUcl !== undefined ? targetUcl : mean + 3 * stdDev
  const lcl = targetLcl !== undefined ? targetLcl : mean - 3 * stdDev

  // 计算过程能力指数
  // 假设控制限就是规格限
  const usl = ucl
  const lsl = lcl

  let cp = 0
  let cpk = 0

  if (stdDev > 0) {
    cp = (usl - lsl) / (6 * stdDev)

    const cpu = (usl - mean) / (3 * stdDev)
    const cpl = (mean - lsl) / (3 * stdDev)
    cpk = Math.min(cpu, cpl)
  }

  // 检查是否所有数据点都在控制限内
  const outOfControlIndices: number[] = []
  data.forEach((x, i) => {
    if (x > usl || x < lsl) {
      outOfControlIndices.push(i)
    }
  })
  const withinLimits = outOfControlIndices.length === 0

  return {
    mean,
    stdDev,
    ucl,
    lcl,
    cp: isNaN(cp) ? 0 : cp,
    cpk: isNaN(cpk) ? 0 : cpk,
    withinLimits,
    outOfControlIndices: outOfControlIndices.length > 0 ? outOfControlIndices : undefined
  }
}

/**
 * 检测SPC异常规则（Western Electric规则）
 */
export function detectSPCWarnings(data: number[], spc: SPCResult): SPCWarning[] {
  const warnings: SPCWarning[] = []
  const { ucl, lcl, mean } = spc

  // 规则1: 任何点超出控制限
  data.forEach((x, i) => {
    if (x > ucl || x < lcl) {
      warnings.push({
        type: 'out_of_control',
        message: `样本${i + 1}超出控制限 (${x.toFixed(4)})`,
        severity: 'error',
        sampleIndex: i
      })
    }
  })

  // 规则2: 连续6点单调上升或下降
  for (let i = 5; i < data.length; i++) {
    let increasing = true
    let decreasing = true
    for (let j = i - 5; j < i; j++) {
      if (data[j] >= data[j + 1]) increasing = false
      if (data[j] <= data[j + 1]) decreasing = false
    }
    if (increasing) {
      warnings.push({
        type: 'trend',
        message: `样本${i - 5}到${i + 1}连续上升`,
        severity: 'warning'
      })
    }
    if (decreasing) {
      warnings.push({
        type: 'trend',
        message: `样本${i - 5}到${i + 1}连续下降`,
        severity: 'warning'
      })
    }
  }

  // 规则3: 连续9点在中心线同一侧
  for (let i = 8; i < data.length; i++) {
    let allAbove = true
    let allBelow = true
    for (let j = i - 8; j <= i; j++) {
      if (data[j] <= mean) allAbove = false
      if (data[j] >= mean) allBelow = false
    }
    if (allAbove || allBelow) {
      warnings.push({
        type: 'clustering',
        message: `样本${i - 8}到${i + 1}连续在中心线${allAbove ? '上方' : '下方'}`,
        severity: 'info'
      })
    }
  }

  return warnings
}

/**
 * 计算移动平均
 */
export function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = data.slice(start, i + 1)
    result.push(slice.reduce((sum, x) => sum + x, 0) / slice.length)
  }
  return result
}

/**
 * 计算移动极差
 */
export function calculateMovingRange(data: number[]): number[] {
  const result: number[] = []
  for (let i = 1; i < data.length; i++) {
    result.push(Math.abs(data[i] - data[i - 1]))
  }
  return result
}

/**
 * 计算Xbar-R控制图数据
 */
export function calculateXbarR(subgroups: number[][]) {
  const Xbars = subgroups.map(group => {
    return group.reduce((sum, x) => sum + x, 0) / group.length
  })

  const Ranges = subgroups.map(group => {
    return Math.max(...group) - Math.min(...group)
  })

  const Xbar = Xbars.reduce((sum, x) => sum + x, 0) / Xbars.length
  const Rbar = Ranges.reduce((sum, x) => sum + x, 0) / Ranges.length

  const n = subgroups[0]?.length || 1

  // A2, D3, D4常数表（基于子组大小n）
  const constants: Record<number, { A2: number; D3: number; D4: number }> = {
    2: { A2: 1.880, D3: 0, D4: 3.267 },
    3: { A2: 1.023, D3: 0, D4: 2.574 },
    4: { A2: 0.729, D3: 0, D4: 2.282 },
    5: { A2: 0.577, D3: 0, D4: 2.114 },
    6: { A2: 0.483, D3: 0, D4: 2.004 },
    7: { A2: 0.419, D3: 0.076, D4: 1.924 },
    8: { A2: 0.373, D3: 0.136, D4: 1.864 },
    9: { A2: 0.337, D3: 0.184, D4: 1.816 },
    10: { A2: 0.308, D3: 0.223, D4: 1.777 }
  }

  const constant = constants[Math.min(n, 10)] || constants[5]

  // Xbar图控制限
  const Xbar_UCL = Xbar + constant.A2 * Rbar
  const Xbar_LCL = Xbar - constant.A2 * Rbar

  // R图控制限
  const R_UCL = constant.D4 * Rbar
  const R_LCL = constant.D3 * Rbar

  return {
    Xbar: {
      values: Xbars,
      center: Xbar,
      ucl: Xbar_UCL,
      lcl: Xbar_LCL
    },
    R: {
      values: Ranges,
      center: Rbar,
      ucl: R_UCL,
      lcl: R_LCL
    }
  }
}

/**
 * 获取过程能力评级
 */
export function getProcessCapabilityRating(cpk: number): {
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'inadequate'
  description: string
  color: string
} {
  if (cpk >= 2.0) {
    return {
      rating: 'excellent',
      description: '优秀 (Cpk ≥ 2.0)',
      color: 'text-green-600'
    }
  } else if (cpk >= 1.67) {
    return {
      rating: 'excellent',
      description: '优秀 (1.67 ≤ Cpk < 2.0)',
      color: 'text-green-600'
    }
  } else if (cpk >= 1.33) {
    return {
      rating: 'good',
      description: '良好 (1.33 ≤ Cpk < 1.67)',
      color: 'text-blue-600'
    }
  } else if (cpk >= 1.0) {
    return {
      rating: 'fair',
      description: '一般 (1.0 ≤ Cpk < 1.33)',
      color: 'text-yellow-600'
    }
  } else if (cpk >= 0.67) {
    return {
      rating: 'poor',
      description: '较差 (0.67 ≤ Cpk < 1.0)',
      color: 'text-orange-600'
    }
  } else {
    return {
      rating: 'inadequate',
      description: '不足 (Cpk < 0.67)',
      color: 'text-red-600'
    }
  }
}

/**
 * 生成正态分布随机数
 */
export function generateNormalRandom(mean: number, stdDev: number): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()

  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return num * stdDev + mean
}

/**
 * 生成SPC测试数据
 */
export function generateSPCSamples(
  mean: number,
  stdDev: number,
  count: number = 25,
  outlierRate: number = 0.05
): number[] {
  const samples: number[] = []

  for (let i = 0; i < count; i++) {
    const sample = generateNormalRandom(mean, stdDev)

    // 偶尔生成一些超差点
    const isOutlier = Math.random() < outlierRate
    if (isOutlier) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random()) * stdDev
      samples.push(sample + offset)
    } else {
      samples.push(sample)
    }
  }

  return samples
}
