/**
 * 生产准备检查预警服务
 * 处理准备检查的预警、超时提醒和升级流程
 */

import {
  type PreparationAlert,
  type PreparationCheckRecord,
  type AlertLevel,
  getAlertLevelColor,
  getAlertLevelLabel
} from '@/config/preparation-checklist'

/**
 * 触发准备检查预警
 */
export async function triggerPreparationAlert(
  workOrderId: string,
  workOrderNo: string,
  reason: string,
  level: AlertLevel = 'warning'
): Promise<PreparationAlert> {
  const alert: PreparationAlert = {
    workOrderId,
    workOrderNo,
    alertType: 'preparation_incomplete',
    level,
    reason,
    description: generateAlertDescription(reason, level),
    status: 'pending',
    createdAt: new Date()
  }

  // TODO: 保存到AIRIOT数据库
  // await saveAlertToDB(alert)

  // TODO: 发送通知给相关人员
  // await sendNotification(alert)

  return alert
}

/**
 * 生成预警描述
 */
function generateAlertDescription(reason: string, level: AlertLevel): string {
  const levelLabel = getAlertLevelLabel(level)
  return `【${levelLabel}】${reason}`
}

/**
 * 检查超时的准备检查
 */
export function checkOverdueChecks(checks: PreparationCheckRecord[]): PreparationAlert[] {
  const alerts: PreparationAlert[] = []
  const now = new Date()

  checks.forEach(check => {
    if (check.status !== 'draft' && check.status !== 'submitted') return

    // 计算检查创建时间（假设24小时后超时）
    const checkTime = check.checkTime || now
    const hoursDiff = (now.getTime() - new Date(checkTime).getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 24) {
      alerts.push({
        workOrderId: check.workOrderId,
        workOrderNo: check.workOrderNo,
        alertType: 'preparation_timeout',
        level: 'critical',
        reason: '准备检查超时24小时未完成',
        description: `工单 ${check.workOrderNo} 的准备检查已超时24小时，请立即处理`,
        status: 'pending',
        createdAt: now
      })
    } else if (hoursDiff > 12) {
      alerts.push({
        workOrderId: check.workOrderId,
        workOrderNo: check.workOrderNo,
        alertType: 'preparation_timeout',
        level: 'warning',
        reason: '准备检查即将超时',
        description: `工单 ${check.workOrderNo} 的准备检查已超过12小时，请尽快完成`,
        status: 'pending',
        createdAt: now
      })
    }
  })

  return alerts
}

/**
 * 处理预警
 */
export async function handleAlert(
  alertId: string,
  handler: string,
  handleRemark: string
): Promise<void> {
  // TODO: 更新数据库中的预警状态
  // await updateAlertInDB(alertId, {
  //   status: 'processing',
  //   handler,
  //   handledAt: new Date(),
  //   handleRemark
  // })
}

/**
 * 解析预警
 */
export async function resolveAlert(
  alertId: string,
  handler: string,
  handleRemark: string
): Promise<void> {
  // TODO: 更新数据库中的预警状态
  // await updateAlertInDB(alertId, {
  //   status: 'resolved',
  //   handler,
  //   handledAt: new Date(),
  //   handleRemark
  // })
}

/**
 * 根据检查记录生成预警
 */
export function generateAlertsFromCheck(
  checkRecord: PreparationCheckRecord
): PreparationAlert[] {
  const alerts: PreparationAlert[] = []

  // 检查是否有必检项未通过
  const failedRequiredItems = checkRecord.checkItems.filter(item => {
    const isRequired = isRequiredCheckItem(item.checkItemId)
    return isRequired && item.status === 'ng'
  })

  if (failedRequiredItems.length > 0) {
    alerts.push({
      workOrderId: checkRecord.workOrderId,
      workOrderNo: checkRecord.workOrderNo,
      alertType: 'check_failed',
      level: 'error',
      reason: '必检项检查未通过',
      description: `以下必检项未通过：${failedRequiredItems.map(i => i.itemName).join('、')}`,
      status: 'pending',
      createdAt: new Date()
    })
  }

  // 检查是否有未完成的必检项
  const pendingRequiredItems = checkRecord.checkItems.filter(item => {
    const isRequired = isRequiredCheckItem(item.checkItemId)
    return isRequired && item.status === 'pending'
  })

  if (pendingRequiredItems.length > 0) {
    alerts.push({
      workOrderId: checkRecord.workOrderId,
      workOrderNo: checkRecord.workOrderNo,
      alertType: 'check_incomplete',
      level: 'warning',
      reason: '有必检项未完成',
      description: `以下必检项尚未检查：${pendingRequiredItems.map(i => i.itemName).join('、')}`,
      status: 'pending',
      createdAt: new Date()
    })
  }

  return alerts
}

/**
 * 判断是否为必检项
 */
function isRequiredCheckItem(checkItemId: string): boolean {
  // TODO: 从配置中获取
  return true
}

/**
 * 升级预警（如果长时间未处理）
 */
export function escalateAlert(alert: PreparationAlert): PreparationAlert | null {
  const now = new Date()
  const hoursSinceCreation = (now.getTime() - new Date(alert.createdAt).getTime()) / (1000 * 60 * 60)

  // 如果超过48小时未处理，升级到严重级别
  if (hoursSinceCreation > 48 && alert.level !== 'critical') {
    return {
      ...alert,
      level: 'critical',
      description: `[已升级] ${alert.description}（超过48小时未处理）`,
      status: 'pending'
    }
  }

  // 如果超过24小时未处理且当前是警告级别，升级到错误级别
  if (hoursSinceCreation > 24 && alert.level === 'warning') {
    return {
      ...alert,
      level: 'error',
      description: `[已升级] ${alert.description}（超过24小时未处理）`,
      status: 'pending'
    }
  }

  return null
}
