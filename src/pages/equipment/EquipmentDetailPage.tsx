import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/blocks/status-badge'
import { useMockData } from '@/hooks/useMockData'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Activity, User, FileText, MapPin, Settings, Calendar } from 'lucide-react'
import type { Equipment } from '@/types/equipment'

export function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data } = useMockData('equipments')
  const equipments = data as Equipment[]

  // 根据ID查找设备
  const equipment = equipments.find((eq: Equipment) => eq.id === id)

  if (!equipment) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="设备不存在"
          titleClass="text-white"
          breadcrumbs={[
            { label: '首页', href: '/dashboard' },
            { label: '设备管理', href: '/equipment/monitor' },
            { label: '详情' }
          ]}
        />
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 border-red-500/40 rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center">
            <p className="text-blue-100 mb-4">未找到该设备信息</p>
            <Link to="/equipment/monitor">
              <Button variant="outline" className="text-blue-100 border-blue-400/40 hover:bg-blue-500/10">返回设备列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${equipment.equipmentId} - ${equipment.equipmentName}`}
        titleClass="text-white"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '设备管理', href: '/equipment/monitor' },
          { label: '设备详情' }
        ]}
        actions={
          <Link to="/equipment/monitor">
            <Button variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回列表
            </Button>
          </Link>
        }
      />

      {/* 设备基本信息 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)',
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)'
      }}>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">基本信息</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>设备编号</span>
              </div>
              <p className="font-medium text-white drop-shadow-md">{equipment.equipmentId}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>设备名称</span>
              </div>
              <p className="font-medium text-white drop-shadow-md">{equipment.equipmentName}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>设备类型</span>
              </div>
              <p className="font-medium text-white drop-shadow-md">{equipment.equipmentType}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>设备型号</span>
              </div>
              <p className="font-medium text-white drop-shadow-md">{equipment.model}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>安装位置</span>
              </div>
              <p className="font-medium text-white drop-shadow-md">{equipment.location}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span>当前状态</span>
              </div>
              <div>
                <StatusBadge status={equipment.status} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 运行状态 */}
      {equipment.status === '运行中' && (
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{
          borderColor: 'rgba(34, 197, 94, 0.3)',
          boxShadow: '0 0 30px rgba(34, 197, 94, 0.15)'
        }}>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-white drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">运行状态</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-blue-200">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span>设备综合效率 (OEE)</span>
                </div>
                <p className="font-medium text-2xl text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.8)]" style={{
                  fontFamily: 'ui-monospace, monospace'
                }}>
                  {equipment.oee?.toFixed(1)}%
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-blue-200">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>当前操作员</span>
                </div>
                <p className="font-medium text-white drop-shadow-md">{equipment.currentOperator}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-blue-200">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>当前工单</span>
                </div>
                <p className="font-medium text-white drop-shadow-md">{equipment.currentWorkOrder}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 空闲状态 */}
      {equipment.status === '空闲' && (
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{
          borderColor: 'rgba(156, 163, 175, 0.3)',
          boxShadow: '0 0 30px rgba(156, 163, 175, 0.15)'
        }}>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-white drop-shadow-[0_0_8px_rgba(156,163,175,0.6)]">状态说明</h3>
            <div className="text-blue-100">
              设备当前处于空闲状态，可以分配新的生产任务。
            </div>
          </CardContent>
        </Card>
      )}

      {/* 故障状态 */}
      {equipment.status === '故障' && (
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{
          borderColor: 'rgba(239, 68, 68, 0.4)',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
        }}>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">故障信息</h3>
            <div className="text-red-300">
              设备当前处于故障状态，维修人员已接到通知，正在处理中。
            </div>
          </CardContent>
        </Card>
      )}

      {/* 保养状态 */}
      {equipment.status === '保养' && (
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{
          borderColor: 'rgba(234, 179, 8, 0.4)',
          boxShadow: '0 0 30px rgba(234, 179, 8, 0.2)'
        }}>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">保养信息</h3>
            <div className="text-yellow-200">
              设备正在进行定期保养维护，预计完成后将恢复生产。
            </div>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden" style={{
        borderColor: 'rgba(168, 85, 247, 0.3)',
        boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)'
      }}>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">快速操作</h3>
          <div className="flex gap-3">
            <Button variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]">查看历史记录</Button>
            <Button variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]">维护记录</Button>
            <Button variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]">生产统计</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
