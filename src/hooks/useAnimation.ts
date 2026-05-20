/**
 * 动画相关的 React Hooks
 */

import { useEffect, useState } from 'react'
import { prefersReducedMotion, getAnimationDuration } from './animation'

/**
 * 使用动画延迟的 Hook
 * @param delay 延迟时间（毫秒）
 * @param immediate 是否立即显示（无动画）
 */
export function useAnimationDelay(delay: number = 0, immediate: boolean = false) {
  const [isVisible, setIsVisible] = useState(immediate)

  useEffect(() => {
    if (immediate || prefersReducedMotion()) {
      setIsVisible(true)
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, immediate])

  return isVisible
}

/**
 * 使用交错动画的 Hook
 * @param count 项目数量
 * @param staggerDelay 交错延迟（毫秒）
 */
export function useStaggeredAnimation(count: number, staggerDelay: number = 100) {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisibleIndices(new Set(Array.from({ length: count }, (_, i) => i)))
      return
    }

    const timers: ReturnType<typeof setTimeout>[] = []

    for (let i = 0; i < count; i++) {
      const timer = setTimeout(() => {
        setVisibleIndices(prev => new Set([...prev, i]))
      }, i * staggerDelay)
      timers.push(timer)
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [count, staggerDelay])

  return visibleIndices
}

/**
 * 使用淡入动画的 Hook
 * @param duration 动画持续时间（毫秒）
 */
export function useFadeIn(duration: number = 300) {
  const [opacity, setOpacity] = useState(0)
  const animationDuration = getAnimationDuration('slow')

  useEffect(() => {
    if (prefersReducedMotion()) {
      setOpacity(1)
      return
    }

    // 初始设置为 0
    setOpacity(0)

    // 触发动画
    const timer = setTimeout(() => {
      setOpacity(1)
    }, 50)

    return () => clearTimeout(timer)
  }, [duration])

  return { opacity, style: { opacity, transition: `opacity ${animationDuration}ms ease-out` } }
}

/**
 * 使用悬停效果的 Hook
 */
export function useHover() {
  const [isHovered, setIsHovered] = useState(false)

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    style: {
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  }

  return { isHovered, hoverProps }
}

/**
 * 使用按压效果的 Hook（按钮等）
 */
export function usePress() {
  const [isPressed, setIsPressed] = useState(false)

  const pressProps = {
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    onMouseLeave: () => setIsPressed(false),
    onTouchStart: () => setIsPressed(true),
    onTouchEnd: () => setIsPressed(false),
    style: {
      transform: isPressed ? 'scale(0.98)' : 'scale(1)',
      transition: 'transform 100ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  }

  return { isPressed, pressProps }
}
