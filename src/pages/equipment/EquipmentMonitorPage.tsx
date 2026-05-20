// @ts-ignore
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ViewModel from '@/components/kesi/view-model/view-model'
import { useModelList, useModel, useModelGetItems } from '@airiot/client'
import ViewFilter from '@/components/kesi/view-filter/view-filter'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import Actions, { CreateAction } from '@/components/kesi/view-actions/view-actions'
import { LoadingDots } from '@/components/ui/loading-dots'
import { Settings, Activity, Calendar, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const tableId = '设备台账'

const getStatusColor = (status: string) => {
  const statusMap: Record<string, { bg: string, border: string, text: string, dot: string }> = {
    '运行中': { bg: 'bg-green-500/5', border: 'border-green-500/40', text: 'text-green-400', dot: 'bg-green-400' },
    '空闲': { bg: 'bg-slate-400/5', border: 'border-slate-400/40', text: 'text-slate-300', dot: 'bg-slate-400' },
    '故障': { bg: 'bg-red-500/5', border: 'border-red-500/40', text: 'text-red-400', dot: 'bg-red-400' },
    '保养': { bg: 'bg-yellow-500/5', border: 'border-yellow-500/40', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  }
  return statusMap[status] || statusMap['空闲']
}

const PageContent: React.FC = () => {
  const { items, loading } = useModelList({ initQuery: false })
  const { model } = useModel()
  const { getItems } = useModelGetItems()

  return (
    <>
      {/* 筛选和操作栏 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-6" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div className="flex flex-row items-end gap-2 w-full">
          <ViewFilter
            classNames={{
              form: 'flex flex-row items-end gap-2 flex-nowrap flex-1 min-w-0',
              group: 'flex flex-row items-end !gap-2 flex-nowrap flex-1 min-w-0',
              field: 'flex flex-row items-center gap-2 !w-auto',
              label: 'text-blue-200 whitespace-nowrap text-sm !w-20 !flex-none !justify-end',
              input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 !w-48',
              description: '',
              error: ''
            }}
          />
          <div className="flex gap-2 items-center shrink-0">
            <CreateAction modelId={tableId}><Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">+ 新建</Button></CreateAction>
          </div>
        </div>
      </Card>

      {/* 设备卡片网格 */}
      {loading ? (
        <LoadingDots text="加载中..." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items?.map((item: any) => {
              const statusColors = getStatusColor(item.deviceStatus || item['select-1702'] || '空闲')
              return (
                <Card
                  key={item.id}
                  className={`backdrop-blur-xl border-2 rounded-xl overflow-hidden hover:shadow-lg cursor-pointer ${statusColors.bg} ${statusColors.border}`}
                  style={{ borderColor: statusColors.border }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-cyan-300 font-semibold text-base mb-1 truncate" title={item.name || item.id}>
                          {item.name || item.id || '未命名设备'}
                        </CardTitle>
                        <div className="text-blue-200 text-sm flex items-center gap-1 truncate" title={item.brandModel || '-'}>
                          <Settings className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.brandModel || '-'}</span>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${statusColors.dot} ${item.deviceStatus === '运行中' ? 'animate-pulse' : ''} shrink-0`}></div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200/70 flex items-center gap-1.5 shrink-0">
                          <Activity className="w-3.5 h-3.5" />
                          设备编号
                        </span>
                        <span className="text-blue-100 font-medium">{item.deviceModel || item.id || '-'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-200/70 flex items-center gap-1.5 shrink-0">
                          <Settings className="w-3.5 h-3.5" />
                          生产厂家
                        </span>
                        <span className="text-blue-100 truncate ml-2" title={item.manufacturer || '-'}>{item.manufacturer || '-'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-200/70 flex items-center gap-1.5 shrink-0">
                          <Activity className="w-3.5 h-3.5" />
                          设备状态
                        </span>
                        <span className={`${statusColors.text} font-medium`}>{item.deviceStatus || '空闲'}</span>
                      </div>

                      {item.maintenanceStatus && (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-200/70 flex items-center gap-1.5 shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                            维护状态
                          </span>
                          <span className="text-blue-100">{item.maintenanceStatus}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-blue-400/20">
                      <Actions item={item} actions={['view', 'edit']} variant="buttons" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 分页器 */}
          {/* <div className="p-4">
            <ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50, 100]} />
          </div> */}
        </>
      )}

      {/* 空状态 */}
      {!loading && (!items || items.length === 0) && (
        <Card className="backdrop-blur-xl bg-blue-500/10 border-2 border-blue-400/20 rounded-xl p-12 text-center">
          <div className="text-blue-200 text-lg mb-4">暂无设备数据</div>
          <CreateAction modelId={tableId}>
            <Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              + 新建设备
            </Button>
          </CreateAction>
        </Card>
      )}
    </>
  )
}

export function EquipmentMonitorPage() {
  return <div className="space-y-0"><ViewModel tableId={tableId} initQuery={true}><PageContent /></ViewModel></div>
}
