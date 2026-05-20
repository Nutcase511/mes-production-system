import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout } from '@/services/auth.service'
import { useUser as useAiriotUser } from '@airiot/client'
import type { CurrentUser } from '@/types/api'
import { getToken, getUserStr, setToken, setUser as saveUser, removeToken, removeUser, isTokenExpired } from '@/lib/auth-token'

// 角色表：角色 name → 内部角色标识
const ROLE_NAME_MAP: Record<string, string> = {
  admin: 'admin',
  管理员: 'admin',
  planner: 'planner',
  计划员: 'planner',
  technician: 'technician',
  调度员: 'technician',
  operator: 'operator',
  操作工: 'operator',
  inspector: 'inspector',
  质检员: 'inspector',
  warehouseman: 'warehouseman',
  库管员: 'warehouseman',
  outsourcing_staff: 'outsourcing_staff',
  外协员: 'outsourcing_staff',
}

interface AuthContextType {
  user: CurrentUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string, verifyCode?: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 使用 AIRIOT SDK 的 useUser hook
  // 这会让 SDK 自动在 API 请求中添加 token
  const { setUser: setAiriotUser } = useAiriotUser()

  useEffect(() => {
    // 从localStorage恢复用户信息
    // 不调用 API 验证 token，避免不必要的请求
    // token 有效性会在后续 API 请求中自动验证
    const restoreAuth = () => {
      const storedUser = getUserStr()
      const storedToken = getToken()

      if (storedUser && storedToken && isTokenExpired()) {
        removeUser()
        removeToken()
        setIsLoading(false)
        return
      }

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser) as CurrentUser

          // 只要 localStorage 中有 token 就认为已登录
          // 不主动验证 token 有效性
          // 实际的 token 验证会在后续 API 请求中进行
          if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
            setUser(parsedUser)
            setIsAuthenticated(true)
            // 将用户信息（包含token）设置到 AIRIOT SDK
            // SDK 会自动在 API 请求失败时处理认证错误
            setAiriotUser({
              ...parsedUser,
              token: storedToken,
            })
          }
        } catch (error) {
          removeUser()
          removeToken()
        }
      }
      setIsLoading(false)
    }

    restoreAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在组件挂载时执行一次

  const login = async (username: string, password: string, verifyCode?: string) => {
    try {
      const response = await apiLogin({ username, password, verifyCode })
      const roleId = response.user.roles?.[0] || ''

      // 先把 token 设给 SDK
      setAiriotUser({
        ...response.user,
        token: response.token,
      })

      // 查询角色 name 并映射为内部标识（此时 token 已存储）
      let roleName = 'user'
      if (roleId) {
        try {
          const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID
          const res = await fetch(`/rest/core/role/${roleId}`, {
            headers: { 'x-request-project': projectId },
          })
          const data = await res.json()
          const name = data.name || data.roleName || data.data?.name || ''
          roleName = ROLE_NAME_MAP[name] || name
        } catch (e) {
          // Silently ignore role lookup failures
        }
      }

      const userData: CurrentUser = {
        id: response.user.id,
        username: response.user.username,
        name: response.user.name,
        email: response.user.email,
        role: roleName,
        roles: response.user.roles || [],
        permissions: response.user.permissions || [],
        isSuper: response.user.isSuper ?? false,
      }

      setUser(userData)
      setIsAuthenticated(true)
      saveUser(userData)
      setToken(response.token, response.expiresIn)

      return userData
    } catch (error: any) {
      throw new Error(error.message || '登录失败')
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      // Silently ignore logout errors
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      removeUser()
      removeToken()
      // 清除 AIRIOT SDK 中的用户信息
      setAiriotUser(null)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    const permissions = user.permissions || []
    // 拥有所有权限
    if (permissions.includes('*')) return true
    // 检查具体权限
    return permissions.includes(permission)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
