/**
 * 动画工具函数
 */

/**
 * 检测用户是否偏好减少动画
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 获取动画持续时间
 * @param speed 速度类型：'fast' | 'normal' | 'slow'
 */
export function getAnimationDuration(speed: 'fast' | 'normal' | 'slow' = 'normal'): number {
  const durations = {
    fast: 150,
    normal: 300,
    slow: 500,
  }
  return durations[speed]
}

/**
 * 动画缓动函数
 */
export const easings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  linear: 'linear',
}
