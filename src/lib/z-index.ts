/**
 * Z-Index 管理系统
 * 基于 UI/UX Pro Max 最佳实践
 */

/**
 * Z-Index 刻度系统
 * 使用预定义的刻度值，避免使用任意大数字
 */
export const Z_INDEX = {
  // 基础层（默认内容）
  base: 0,

  // 上升层（轻微提升）
  raised: 10,

  // 下拉菜单、弹出层
  dropdown: 20,

  // 固定头部、侧边栏
  sticky: 30,

  // 模态框覆盖层
  modal: 50,

  // 提示框、通知
  tooltip: 100,

  // 最高层级（仅用于绝对必要的情况）
  max: 999,
} as const

/**
 * Z-Index 类名映射
 */
export const Z_INDEX_CLASSES = {
  base: 'z-0',
  raised: 'z-10',
  dropdown: 'z-20',
  sticky: 'z-30',
  modal: 'z-50',
  tooltip: 'z-[100]',
  max: 'z-[999]',
} as const

/**
 * 获取 z-index 值
 */
export function getZIndex(level: keyof typeof Z_INDEX): number {
  return Z_INDEX[level]
}

/**
 * 获取 z-index 类名
 */
export function getZIndexClass(level: keyof typeof Z_INDEX): string {
  return Z_INDEX_CLASSES[level]
}
