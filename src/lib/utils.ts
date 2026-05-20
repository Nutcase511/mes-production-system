import { clsx, type ClassValue } from "clsx"
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * 格式化日期 - 只显示日期部分
 * @param date - 日期字符串或Date对象
 * @returns 格式化后的日期字符串 (YYYY-MM-DD)
 */
export function formatDate(date: string | Date): string {
  if (!date) return '-'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return String(date)
    return format(d, 'yyyy-MM-dd')
  } catch (error) {
    return String(date)
  }
}

/**
 * 格式化时间 - 返回原值
 * @param time - 时间字符串
 * @returns 原时间字符串
 */
export function formatTime(time: string): string {
  return time
}

/**
 * 格式化日期时间 - 显示日期和时间
 * @param dateTime - 日期时间字符串或Date对象
 * @returns 格式化后的日期时间字符串 (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateTime(dateTime: string | Date): string {
  if (!dateTime) return '-'
  try {
    const d = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
    if (isNaN(d.getTime())) return String(dateTime)
    return format(d, 'yyyy-MM-dd HH:mm:ss')
  } catch (error) {
    return String(dateTime)
  }
}

export function getRandomDate(min: number, max: number): string {
  const date = new Date()
  date.setDate(date.getDate() + Math.floor(Math.random() * (max - min + 1)) + min)
  return date.toISOString().split('T')[0]
}

export function getRandomTime(min: number, max: number): string {
  const date = new Date()
  date.setHours(date.getHours() + Math.floor(Math.random() * (max - min + 1)) + min)
  return date.toISOString().slice(11, 16)
}

export function getRandomDateTime(min: number, max: number): string {
  const date = new Date()
  date.setHours(date.getHours() + Math.floor(Math.random() * (max - min + 1)) + min)
  return date.toISOString().slice(0, 19)
}

// 状态变体映射
export const statusVariantMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  '已完成': 'success',
  '生产中': 'info',
  '准备中': 'warning',
  '已就绪': 'info',
  '已创建': 'default',
  '已取消': 'error',
  '暂停中': 'warning',
  '待开始': 'default',
  '进行中': 'info',
  '合格': 'success',
  '返修': 'warning',
  '报废': 'error',
  '运行中': 'success',
  '空闲': 'default',
  '故障': 'error',
  '保养': 'warning'
}

export function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  return statusVariantMap[status] || 'default'
}
