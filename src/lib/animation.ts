/**
 * 动画工具函数
 * 提供统一的动画配置和工具
 */

/**
 * 动画持续时间（毫秒）- 基于 UI/UX 最佳实践
 */
export const ANIMATION_DURATION = {
  fast: 150,      // 微交互（按钮点击、悬停等）
  normal: 200,    // 标准过渡
  slow: 300,      // 复杂动画
} as const

/**
 * 缓动函数
 */
export const EASING = {
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const

/**
 * 检测用户是否偏好减少动画
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 获取动画持续时间（考虑用户偏好）
 */
export function getAnimationDuration(duration: keyof typeof ANIMATION_DURATION = 'normal'): number {
  if (prefersReducedMotion()) {
    return 0.01
  }
  return ANIMATION_DURATION[duration]
}

/**
 * 动画类名生成器
 */
export function getAnimationClass(
  type: 'fade-in' | 'fade-in-up' | 'scale-in',
  delay?: number
): string {
  if (prefersReducedMotion()) {
    return ''
  }
  const delayClass = delay ? `style="animation-delay: ${delay}ms"` : ''
  return `animate-${type} ${delayClass}`
}

/**
 * 卡片悬停效果样式
 */
export const cardHoverStyles = `
  transition: transform ${ANIMATION_DURATION.normal}ms ${EASING.easeOut},
              box-shadow ${ANIMATION_DURATION.normal}ms ${EASING.easeOut};
`

/**
 * 按钮按压效果样式
 */
export const buttonPressStyles = `
  transition: transform ${ANIMATION_DURATION.fast}ms ${EASING.easeOut};
`

/**
 * 颜色过渡样式
 */
export const colorTransitionStyles = `
  transition: color ${ANIMATION_DURATION.fast}ms ${EASING.easeOut},
              background-color ${ANIMATION_DURATION.fast}ms ${EASING.easeOut},
              border-color ${ANIMATION_DURATION.fast}ms ${EASING.easeOut};
`
