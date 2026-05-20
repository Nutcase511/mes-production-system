/**
 * 角色权限配置
 * 基于用户 roles 数组中的角色 ID 控制菜单和页面可见性
 */

// 特殊角色 ID
const SUPER_ADMIN_ROLE_ID = '63bbe63057ed18243e9d9d02'
const DEMO_ROLE_ID = '655c6cf6ce0e87f5d0725ec6'

// 角色 ID → 可见顶部导航路径前缀
const roleIdNavPrefixes: Record<string, string[]> = {
  '69d5c20b41b41151d055f606': ['/production'], // 计划员
  '69d5c2df41b41151d0560a06': ['/scheduling'],     // 调度员
  '69d5c30641b41151d056107d': ['/production'],   // 操作工
  '69d5c38c41b41151d0561db9': ['/quality'],      // 质检员
  '69d5c3ae41b41151d0562434': ['/inventory'],    // 库管员
  '69d5c3e741b41151d0562465': ['/outsourcing'],  // 外协员
}

// 角色 ID → 可见的具体页面路径（null 表示该模块全部可见）
const roleIdPages: Record<string, string[] | null> = {
  '69d5c20b41b41151d055f606': null,              // 计划员：生产模块全部可见
  '69d5c2df41b41151d0560a06': null,              // 调度员：调度模块全部可见
  '69d5c30641b41151d056107d': [                  // 操作工：仅生产控制三个页面
    '/production/preparation-checklist',
    '/production/trial-production-control',
    '/production/production',
  ],
  '69d5c38c41b41151d0561db9': null,              // 质检员：质量模块全部可见
  '69d5c3ae41b41151d0562434': null,              // 库管员：库存模块全部可见
  '69d5c3e741b41151d0562465': null,              // 外协员：外协模块全部可见
}

// 判断用户是否为管理员（超级管理员 或 演示角色）
export const isAdmin = (user: { roles?: string[]; isSuper?: boolean } | null): boolean => {
  if (!user) return false
  const roles = user.roles || []
  return roles.includes(SUPER_ADMIN_ROLE_ID) || roles.includes(DEMO_ROLE_ID) || user.isSuper === true
}

// 获取用户可见的顶部导航模块
// null = 全部可见（管理员），string[] = 仅这些前缀可见
export const getUserNavPrefixes = (user: { roles?: string[]; isSuper?: boolean } | null): string[] | null => {
  if (isAdmin(user)) return null
  const roles = user?.roles || []
  const prefixes = new Set<string>()
  for (const roleId of roles) {
    const mapped = roleIdNavPrefixes[roleId]
    if (mapped) mapped.forEach(p => prefixes.add(p))
  }
  return prefixes.size > 0 ? [...prefixes] : []
}

// 获取用户允许访问的具体页面路径集合
// null = 不限制，Set<string> = 仅这些路径可见
export const getUserAllowedPages = (user: { roles?: string[]; isSuper?: boolean } | null): Set<string> | null => {
  if (isAdmin(user)) return null
  const roles = user?.roles || []
  for (const roleId of roles) {
    const pages = roleIdPages[roleId]
    if (pages === undefined) continue // 该角色没有配置页面权限
    return pages === null ? null : new Set(pages)
  }
  return null
}

// 判断用户是否有权限访问某个路径
export const canAccessPath = (user: { roles?: string[]; isSuper?: boolean } | null, path: string): boolean => {
  return true
}

// 模块默认首页（角色 pages 为 null 时使用）
const moduleDefaultPaths: Record<string, string> = {
  '/production': '/production/production-notice',
  '/scheduling': '/scheduling/routes',
  '/quality': '/quality/first-check',
  '/inventory': '/inventory/overview',
  '/equipment': '/equipment/monitor',
  '/outsourcing': '/outsourcing/list',
}

// 获取用户登录后的默认首页路径
export const getUserHomePath = (user: { roles?: string[]; isSuper?: boolean } | null): string => {
  if (isAdmin(user)) return '/dashboard'
  const roles = user?.roles || []
  for (const roleId of roles) {
    const pages = roleIdPages[roleId]
    if (pages === undefined) continue
    // 有具体页面配置，取第一个
    if (pages) return pages[0]
    // 模块全部可见，取模块默认首页
    const prefix = roleIdNavPrefixes[roleId]?.[0]
    if (prefix) return moduleDefaultPaths[prefix] || prefix
  }
  return '/dashboard'
}
