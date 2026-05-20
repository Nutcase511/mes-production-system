import { Link } from 'react-router-dom'
import { Home, ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { getUserHomePath } from '@/config/permissions'

export function ForbiddenPage() {
  const { user } = useAuth()
  const homePath = getUserHomePath(user)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative inline-block">
          <div className="text-[120px] font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent leading-none">
            403
          </div>
          <div className="absolute inset-0 text-[120px] font-black text-red-400/10 leading-none blur-xl">
            403
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-red-400">
          <ShieldX className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-slate-100">无访问权限</h2>
        </div>
        <p className="text-blue-300 text-lg">
          您没有权限访问此页面
        </p>
        <p className="text-blue-400/60 text-sm">
          如需访问权限，请联系系统管理员
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            asChild
            className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] px-6"
          >
            <Link to={homePath}>
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20 px-6"
          >
            返回上页
          </Button>
        </div>
      </div>
    </div>
  )
}
