import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingDots } from '@/components/ui/loading-dots'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Package, 
  Wrench, 
  Users, 
  FileText,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react'

interface TaskInfo {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'paused'
  startTime?: string
  endTime?: string
  operator?: string
}

interface EquipmentInfo {
  id: string
  name: string
  code: string
  status: 'running' | 'idle' | 'maintenance' | 'fault'
}

interface TeamInfo {
  id: string
  name: string
  leader: string
  members: string[]
}

interface DispatchDetail {
  id: string
  dispatchNo: string
  workOrderNo: string
  productName: string
  productCode: string
  quantity: number
  unit: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  planStartTime: string
  planEndTime: string
  actualStartTime?: string
  actualEndTime?: string
  tasks: TaskInfo[]
  equipment: EquipmentInfo[]
  team: TeamInfo
  remark?: string
}

export function DispatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dispatch, setDispatch] = useState<DispatchDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setDispatch({
        id: id || '1',
        dispatchNo: 'DIS-20250404-001',
        workOrderNo: 'WO-20250404-001',
        productName: '精密轴承座',
        productCode: 'PRD-Bearing-001',
        quantity: 100,
        unit: '件',
        priority: 'high',
        status: 'processing',
        planStartTime: '2025-04-04 08:00',
        planEndTime: '2025-04-04 18:00',
        actualStartTime: '2025-04-04 08:15',
        tasks: [
          { id: '1', name: '原料准备', status: 'completed', startTime: '08:15', endTime: '09:00', operator: '张三' },
          { id: '2', name: '粗加工', status: 'completed', startTime: '09:00', endTime: '11:30', operator: '李四' },
          { id: '3', name: '精加工', status: 'processing', startTime: '13:00', operator: '王五' },
          { id: '4', name: '质检', status: 'pending' },
          { id: '5', name: '入库', status: 'pending' },
        ],
        equipment: [
          { id: '1', name: '数控车床', code: 'CNC-001', status: 'running' },
          { id: '2', name: '加工中心', code: 'MC-002', status: 'idle' },
        ],
        team: {
          id: '1',
          name: 'A班组',
          leader: '赵组长',
          members: ['张三', '李四', '王五', '钱六']
        },
        remark: '注意加工精度要求，公差控制在±0.01mm以内'
      })
      setLoading(false)
    }, 500)
  }, [id])

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { text: string; class: string }> = {
      high: { text: '高优先级', class: 'bg-red-500/20 text-red-400' },
      medium: { text: '中优先级', class: 'bg-yellow-500/20 text-yellow-400' },
      low: { text: '低优先级', class: 'bg-green-500/20 text-green-400' },
    }
    const config = map[priority] || map.medium
    return <Badge className={config.class}>{config.text}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { text: string; class: string; icon: any }> = {
      pending: { text: '待开工', class: 'bg-gray-500/20 text-gray-400', icon: Clock },
      processing: { text: '生产中', class: 'bg-blue-500/20 text-blue-400', icon: PlayCircle },
      completed: { text: '已完成', class: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      cancelled: { text: '已取消', class: 'bg-red-500/20 text-red-400', icon: AlertCircle },
    }
    const config = map[status] || map.pending
    const Icon = config.icon
    return (
      <Badge className={`${config.class} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    )
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'processing':
        return <PlayCircle className="w-5 h-5 text-blue-400" />
      case 'paused':
        return <PauseCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getEquipmentStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      running: 'bg-green-500/20 text-green-400',
      idle: 'bg-gray-500/20 text-gray-400',
      maintenance: 'bg-yellow-500/20 text-yellow-400',
      fault: 'bg-red-500/20 text-red-400',
    }
    const textMap: Record<string, string> = {
      running: '运行中',
      idle: '空闲',
      maintenance: '维护中',
      fault: '故障',
    }
    return <Badge className={map[status] || map.idle}>{textMap[status] || status}</Badge>
  }

  if (loading) {
    return (
      <LoadingDots />
    )
  }

  if (!dispatch) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-red-200">派工单不存在</p>
        <Button onClick={() => navigate('/production/dispatch')} className="mt-4">
          返回列表
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部导航 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/production/dispatch')} className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h1 className="text-2xl font-bold text-blue-100">派工单详情</h1>
        <div className="flex-1" />
        {getPriorityBadge(dispatch.priority)}
        {getStatusBadge(dispatch.status)}
      </div>

      {/* 基本信息 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-6" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <h2 className="text-lg font-semibold text-blue-100 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          基本信息
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-300/70 text-sm">派工单号</p>
            <p className="text-blue-100 font-medium">{dispatch.dispatchNo}</p>
          </div>
          <div>
            <p className="text-blue-300/70 text-sm">关联工单</p>
            <p className="text-blue-100 font-medium">{dispatch.workOrderNo}</p>
          </div>
          <div>
            <p className="text-blue-300/70 text-sm">产品名称</p>
            <p className="text-blue-100 font-medium">{dispatch.productName}</p>
          </div>
          <div>
            <p className="text-blue-300/70 text-sm">产品编码</p>
            <p className="text-blue-100 font-medium">{dispatch.productCode}</p>
          </div>
          <div>
            <p className="text-blue-300/70 text-sm">计划数量</p>
            <p className="text-blue-100 font-medium">{dispatch.quantity} {dispatch.unit}</p>
          </div>
          <div>
            <p className="text-blue-300/70 text-sm">计划开工</p>
            <p className="text-blue-100 font-medium">{dispatch.planStartTime}</p>
          </div>
          <div>
            <p className="text-blue-300/70 text-sm">计划完工</p>
            <p className="text-blue-100 font-medium">{dispatch.planEndTime}</p>
          </div>
          <div>
            <p className="text-blue-300/70 text-sm">实际开工</p>
            <p className="text-blue-100 font-medium">{dispatch.actualStartTime || '-'}</p>
          </div>
        </div>
        {dispatch.remark && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
            <p className="text-yellow-200 text-sm">
              <span className="font-medium">备注：</span>{dispatch.remark}
            </p>
          </div>
        )}
      </Card>

      {/* 标签页内容 */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="bg-blue-500/10 border border-blue-400/30">
          <TabsTrigger value="tasks" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
            <Package className="w-4 h-4 mr-2" />
            生产任务
          </TabsTrigger>
          <TabsTrigger value="equipment" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
            <Wrench className="w-4 h-4 mr-2" />
            设备信息
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
            <Users className="w-4 h-4 mr-2" />
            班组信息
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-6" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <h3 className="text-lg font-semibold text-blue-100 mb-4">工序任务列表</h3>
            <div className="space-y-3">
              {dispatch.tasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-4 p-4 bg-blue-950/30 rounded-lg border border-blue-400/20"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-cyan-300 font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-shrink-0">
                    {getTaskStatusIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-100 font-medium">{task.name}</p>
                    <div className="flex gap-4 text-sm text-blue-300/70 mt-1">
                      {task.operator && <span>操作员: {task.operator}</span>}
                      {task.startTime && <span>开始: {task.startTime}</span>}
                      {task.endTime && <span>结束: {task.endTime}</span>}
                    </div>
                  </div>
                  <Badge className={
                    task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    task.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                    task.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }>
                    {task.status === 'completed' ? '已完成' :
                     task.status === 'processing' ? '进行中' :
                     task.status === 'paused' ? '已暂停' : '待开始'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-6" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <h3 className="text-lg font-semibold text-blue-100 mb-4">关联设备</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dispatch.equipment.map((eq) => (
                <div 
                  key={eq.id} 
                  className="p-4 bg-blue-950/30 rounded-lg border border-blue-400/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-blue-100 font-medium">{eq.name}</p>
                      <p className="text-blue-300/70 text-sm">{eq.code}</p>
                    </div>
                    {getEquipmentStatusBadge(eq.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-6" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <h3 className="text-lg font-semibold text-blue-100 mb-4">班组信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-400/20">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span className="text-blue-100 font-medium">{dispatch.team.name}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-300/70">
                  <User className="w-4 h-4" />
                  <span>组长: {dispatch.team.leader}</span>
                </div>
              </div>
              <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-400/20">
                <p className="text-blue-300/70 mb-3">班组成员</p>
                <div className="flex flex-wrap gap-2">
                  {dispatch.team.members.map((member, idx) => (
                    <Badge key={idx} variant="outline" className="text-blue-200 border-blue-400/30">
                      {member}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DispatchDetailPage
