import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserAllowedPages } from '@/config/permissions'

/**
 * 根据用户角色过滤菜单项
 * @param menuItems 菜单项数组，每项需有 path 字段
 * @returns 过滤后的菜单项
 */
export function useFilteredMenu<T extends { path: string }>(menuItems: T[]): T[] {
  const { user } = useAuth()
  return useMemo(() => {
    const allowedPages = getUserAllowedPages(user)
    // 管理员或不限制：全部可见
    if (!allowedPages) return menuItems
    return menuItems.filter(item => allowedPages.has(item.path))
  }, [user, menuItems])
}
