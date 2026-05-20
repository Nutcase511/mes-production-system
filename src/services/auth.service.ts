// 认证服务 - 使用官方 @airiot/client SDK
import SHA1 from 'crypto-js/sha1'
import type { LoginRequest, LoginResponse } from '@/types/api'
import { setToken, removeToken, removeUser, getToken, getUserStr } from '@/lib/auth-token'

/**
 * 用户登录
 * 注意：@airiot/client SDK 使用 SHA1 加密密码
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  // 检查是否使用Mock数据
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    // Mock登录 - 凭据从环境变量读取，不应硬编码在源码中
    const mockUsers: Record<string, { password: string; user: LoginResponse['user'] }> = {
      [import.meta.env.VITE_MOCK_USERNAME_ADMIN || 'admin']: {
        password: import.meta.env.VITE_MOCK_PASSWORD_ADMIN || 'admin123',
        user: {
          id: '1',
          username: 'admin',
          name: '系统管理员',
          email: 'admin@example.com',
          role: 'admin',
          permissions: ['*'],
        },
      },
      [import.meta.env.VITE_MOCK_USERNAME_OPERATOR || 'operator']: {
        password: import.meta.env.VITE_MOCK_PASSWORD_OPERATOR || '123456',
        user: {
          id: '2',
          username: 'operator',
          name: '操作员',
          role: 'operator',
          permissions: ['production:read', 'production:write', 'quality:read'],
        },
      },
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUser = mockUsers[data.username]
        if (mockUser && data.password === mockUser.password) {
          const token = `mock-token-${data.username}-${Date.now()}`
          setToken(token)
          resolve({
            token,
            user: mockUser.user,
            expiresIn: 7200,
          })
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 800)
    })
  }

  // 真实API登录 - 使用SHA1加密
  try {
    const projectId = import.meta.env.VITE_AIRIOT_PROJECT_ID
    const hashedPassword = SHA1(data.password).toString()


    // 匹配服务端的请求头
    const response = await fetch('/rest/core/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-project': projectId,
        'X-Access-Path': 'admin',
        'X-Request-TimeZone': '+08:00',
      },
      body: JSON.stringify({
        username: data.username,
        password: hashedPassword,
        verifyCode: data.verifyCode,
      }),
    })

    const result = await response.json()


    // 服务端直接返回用户对象，不是包装在 { code, data } 中
    if (response.ok) {
      // 返回原始数据，角色解析由 AuthContext 处理
      const loginData: LoginResponse = {
        token: result.token || result.accessToken,
        user: {
          id: result.id || result.userId,
          username: result.username,
          name: result.username,
          email: result.email,
          roles: result.roles || [],
          role: result.role,
          permissions: result.permissions || ['*'],
          isSuper: result.isSuper ?? false,
        },
        expiresIn: result.expiresAt ? Math.floor((result.expiresAt - Date.now() / 1000)) : undefined,
      }

      return loginData
    } else {
      throw new Error(result.message || result.msg || `登录失败 (${response.status})`)
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '登录失败，请检查网络连接'
    throw new Error(msg)
  }
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    removeToken()
    removeUser()
    return Promise.resolve()
  }

  try {
    // 使用相对路径通过代理
    await fetch('/rest/core/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    })
  } catch (error) {
    // Silently ignore logout errors
  } finally {
    removeToken()
    removeUser()
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    const userStr = getUserStr()
    if (userStr) {
      return JSON.parse(userStr)
    }
    throw new Error('未登录')
  }

  try {
    // 使用相对路径通过代理
    const response = await fetch('/rest/core/auth/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    })

    const result = await response.json()

    if (result.code === 0) {
      return result.data
    } else {
      throw new Error(result.message || '获取用户信息失败')
    }
  } catch (error: any) {
    throw new Error(error.message || '获取用户信息失败')
  }
}

/**
 * 验证Token是否有效
 * 注意：这里不做主动验证，让 SDK 在 API 请求时自动验证
 * 当 API 返回 401 时，SDK 会触发 on401 回调
 */
export async function validateToken(token: string): Promise<boolean> {
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  if (useMock) {
    return token.startsWith('mock-token-')
  }

  // 不做主动验证，只检查 token 格式
  // 实际验证会在 API 请求中进行
  try {
    return !!token && token !== 'null' && token !== 'undefined' && token.trim().length > 0
  } catch {
    return false
  }
}
