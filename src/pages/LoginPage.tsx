import { useState, useEffect, useCallback, type FC, type InputHTMLAttributes } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toastApi } from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getUserHomePath } from '@/config/permissions'
import { useLogin, createAPI } from '@airiot/client'

const ImageCode: FC<{
  input: InputHTMLAttributes<HTMLInputElement>
  refreshKey: number
}> = ({ input, refreshKey }) => {
  const [url, setUrl] = useState('')

  const getImageCode = useCallback(() => {
    const query = { height: 36, width: 240, captchaLen: 4, maxSkew: 0.7, dotCount: 80 }
    createAPI({ name: 'core/auth/captcha' })
      .fetch('?query=' + JSON.stringify(query), {})
      .then(({ json }) => {
        setUrl(json.data)
      })
      .catch(() => {
        toastApi.error('获取验证码失败')
      })
  }, [])

  useEffect(() => {
    getImageCode()
  }, [refreshKey, getImageCode])

  return (
    <div className="flex items-center gap-2">
      <Input
        {...input}
        placeholder="请输入验证码"
        className="flex-1 min-w-0 bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all text-[18px] h-12"
      />
      <img
        className="rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
        src={url}
        alt="验证码"
        onClick={getImageCode}
        style={{ maxWidth: '120px', maxHeight: '48px', border: '1px solid rgba(59, 130, 246, 0.3)' }}
        title="点击刷新验证码"
      />
    </div>
  )
}

interface LoginForm {
  username: string
  password: string
  verifyCode: string
  remember: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showCode } = useLogin()
  const [isLoading, setIsLoading] = useState(false)
  const [captchaKey, setCaptchaKey] = useState(0)
  const [formData, setFormData] = useState<LoginForm>({
    username: '',
    password: '',
    verifyCode: '',
    remember: false
  })

  const refreshCaptcha = () => setCaptchaKey((k) => k + 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim()) {
      toastApi.error('请输入用户名')
      return
    }
    if (!formData.password) {
      toastApi.error('请输入密码')
      return
    }
    if (showCode && !formData.verifyCode.trim()) {
      toastApi.error('请输入验证码')
      return
    }

    setIsLoading(true)

    try {
      const userData = await login(formData.username, formData.password, formData.verifyCode || undefined)

      if (formData.remember) {
        localStorage.setItem('remember', 'true')
      }

      toastApi.success('登录成功！')
      navigate(getUserHomePath(userData))
    } catch (error: any) {
      toastApi.error(error.message || '登录失败')
      refreshCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl mb-4 shadow-[0_0_20px_rgba(34,211,238,0.6)]">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-[28px] font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">MES 生产管理系统</h1>
          <p className="text-[20px] text-blue-200 mt-2">机械加工行业智能制造执行系统</p>
        </div>

        {/* 登录表单 */}
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_40px_rgba(34,211,238,0.4)] transition-all duration-300" style={{
          borderColor: 'rgba(59, 130, 246, 0.3)'
        }}>
          <CardContent className="p-8 pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <Label htmlFor="username" className="text-[18px] text-blue-200 block mb-3">用户名</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入用户名"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isLoading}
                  autoComplete="username"
                  className="bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all text-[18px] h-12"
                />
              </div>

              <div className="space-y-6">
                <Label htmlFor="password" className="text-[18px] text-blue-200 block mb-3">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all text-[18px] h-12"
                />
              </div>

              {showCode && (
                <div className="space-y-3">
                  <Label className="text-[18px] text-blue-200 block">验证码</Label>
                  <ImageCode
                    input={{
                      value: formData.verifyCode,
                      onChange: (e) => setFormData({ ...formData, verifyCode: e.target.value }),
                      required: true,
                    }}
                    refreshKey={captchaKey}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-blue-400/50 bg-blue-500/10 text-blue-500 focus:ring-blue-400 focus:ring-offset-0"
                  />
                  <span className="text-[18px] text-blue-200">记住我</span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_25px_rgba(34,211,238,0.5)] transition-all text-[18px] h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 版权信息 */}
        <div className="text-center mt-8 text-[18px] text-blue-300">
          <p>© 2025 MES 生产管理系统 v2.0</p>
        </div>
      </div>
    </div>
  )
}
