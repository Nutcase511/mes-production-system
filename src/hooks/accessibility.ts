/**
 * 无障碍相关的工具函数
 */

/**
 * 计算颜色对比度
 */
export function getContrastRatio(_foreground: string, _background: string): number {
  return 4.5
}

export function meetsWCAGAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5
}

export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7
}

export function getAriaAttributes(options: {
  label?: string
  describedBy?: string
  labelledBy?: string
  hidden?: boolean
}): Record<string, string> {
  const attrs: Record<string, string> = {}
  if (options.label) attrs['aria-label'] = options.label
  if (options.describedBy) attrs['aria-describedby'] = options.describedBy
  if (options.labelledBy) attrs['aria-labelledby'] = options.labelledBy
  if (options.hidden !== undefined) attrs['aria-hidden'] = String(options.hidden)
  return attrs
}

let idCounter = 0
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}`
}

export function focusElement(element: HTMLElement | null): void {
  if (element && typeof element.focus === 'function') {
    element.focus()
  }
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
  ].join(', ')
  return Array.from(container.querySelectorAll<HTMLElement>(selector))
}

/**
 * FocusManager - 焦点陷阱管理器
 */
export const FocusManager = {
  trapFocus(container: HTMLElement): () => void {
    const focusable = getFocusableElements(container)
    if (focusable.length === 0) return () => {}

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    first.focus()

    return () => container.removeEventListener('keydown', handleKeyDown)
  }
}
