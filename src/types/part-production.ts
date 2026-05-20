/**
 * 零件生产追溯系统相关类型和常量
 */

// 零件状态枚举
export enum PartStatus {
  PENDING = 'pending',                      // 待生产
  TRIAL_PRODUCING = 'trial_producing',      // 试生产中
  TRIAL_COMPLETED = 'trial_completed',      // 试产完成
  WAITING_FIRST_CHECK = 'waiting_first_check', // 待首检
  FIRST_CHECK_PASS = 'first_check_pass',    // 首检合格
  FIRST_CHECK_FAIL = 'first_check_fail',    // 首检不合格
  PRODUCING = 'producing',                  // 正式生产中
  PRODUCTION_COMPLETED = 'production_completed', // 生产完成
  WAITING_FINAL_CHECK = 'waiting_final_check', // 待终检
  FINAL_CHECK_PASS = 'final_check_pass',    // 终检合格
  FINAL_CHECK_FAIL = 'final_check_fail'     // 终检不合格
}

// 零件状态显示文本映射
export const PartStatusLabel: Record<PartStatus, string> = {
  [PartStatus.PENDING]: '待生产',
  [PartStatus.TRIAL_PRODUCING]: '试生产中',
  [PartStatus.TRIAL_COMPLETED]: '试产完成',
  [PartStatus.WAITING_FIRST_CHECK]: '待首检',
  [PartStatus.FIRST_CHECK_PASS]: '首检合格',
  [PartStatus.FIRST_CHECK_FAIL]: '首检不合格',
  [PartStatus.PRODUCING]: '正式生产中',
  [PartStatus.PRODUCTION_COMPLETED]: '生产完成',
  [PartStatus.WAITING_FINAL_CHECK]: '待终检',
  [PartStatus.FINAL_CHECK_PASS]: '终检合格',
  [PartStatus.FINAL_CHECK_FAIL]: '终检不合格'
}

// 零件记录接口
export interface PartRecord {
  partID: string                        // 零件ID
  partStatus: PartStatus                // 零件状态
  startTime?: string                    // 开始生产时间
  endTime?: string                      // 结束生产时间
  equipment?: string                    // 生产设备
  operator?: string                     // 操作人
  inspector?: string                    // 检验人
  inspectorTime?: string                // 检验时间
  failReason?: string                   // 不合格原因
  inspectPhotos?: any                   // 检验照片
}

// 生成零件ID
export function generatePartId(workOrderNo: string, seq: number): string {
  const seqStr = String(seq).padStart(2, '0')
  return `${workOrderNo}-${seqStr}`
}

// 字段Key常量（用于访问顶层表的字段）
export const FIELD_KEYS = {
  PARENT_ORDER_ID: 'parentWorkOrderID',         // 父级跟单ID（修正字段名）
  PART_RECORDS: 'partProductionRecords',        // 零件生产记录
  PART_ID: 'partID',                            // 零件ID
  OPERATOR: 'operator',                         // 操作人
  INSPECTOR: 'inspector',                       // 检验人
} as const
