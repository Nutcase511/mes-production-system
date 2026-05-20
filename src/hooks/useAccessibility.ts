/**
 * 可访问性相关的 React Hooks
 */

import { useEffect, useRef } from 'react'
import { FocusManager, generateId } from './accessibility'

/**
 * 管理模态框焦点捕获
 */
export function useFocusTrap(enabled: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const cleanup = FocusManager.trapFocus(containerRef.current)
    return cleanup
  }, [enabled])

  return containerRef
}

/**
 * 管理焦点恢复（用于关闭模态框后恢复焦点）
 */
export function useFocusRestore(enabled: boolean = true) {
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    // 保存当前焦点元素
    previousActiveElementRef.current = document.activeElement as HTMLElement

    return () => {
      // 恢复焦点到之前的元素
      previousActiveElementRef.current?.focus()
    }
  }, [enabled])

  return previousActiveElementRef
}

/**
 * 自动生成唯一 ID
 */
export function useId(prefix: string = 'id') {
  const idRef = useRef<string>(generateId(prefix))
  return idRef.current
}

/**
 * 管理键盘事件
 */
export function useKeyboard(
  keys: string[],
  handler: (event: KeyboardEvent) => void,
  options: { disableOnInput?: boolean } = {}
) {
  const { disableOnInput = true } = options

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否在输入元素中
      if (disableOnInput) {
        const target = event.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }
      }

      if (keys.includes(event.key)) {
        handler(event)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [keys, handler, disableOnInput])
}

/**
 * 管理 Esc 键关闭操作
 */
export function useEscapeKey(
  callback: () => void,
  _enabled: boolean = true
) {
  useKeyboard(['Escape'], callback, { disableOnInput: false })
}

/**
 * 管理点击外部区域
 */
export function useClickOutside(
  callback: () => void,
  enabled: boolean = true
) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [callback, enabled])

  return ref
}

/**
 * 管理屏幕阅读器公告
 */
export function useAnnounce() {
  const announceRef = useRef<HTMLDivElement>(null)

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceRef.current) return

    announceRef.current.setAttribute('aria-live', priority)
    announceRef.current.textContent = message

    // 清除消息以便下次可以重新公告相同内容
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = ''
      }
    }, 1000)
  }

  return { announceRef, announce }
}

/**
 * 管理自动焦点
 */
export function useAutoFocus(enabled: boolean = true, delay: number = 0) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const timer = setTimeout(() => {
      ref.current?.focus()
    }, delay)

    return () => clearTimeout(timer)
  }, [enabled, delay])

  return ref
}
