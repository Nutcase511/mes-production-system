import { Clock } from 'lucide-react'

interface ProcessRecordViewProps {
  processRecord?: any
  showQuantityStats?: boolean
}

function ProcessRecordView({ processRecord, showQuantityStats }: ProcessRecordViewProps) {
  if (!processRecord) {
    return (
      <div className="text-sm text-blue-200/50 flex items-center gap-2 py-2">
        <Clock className="w-4 h-4" />
        暂无工序记录
      </div>
    )
  }

  const records = Array.isArray(processRecord) ? processRecord : [processRecord]

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-blue-200/70 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        工序记录
      </div>
      {records.map((record: any, i: number) => (
        <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-sm text-blue-100">
            {typeof record === 'string' ? record : record?.name || record?.processName || `工序 ${i + 1}`}
          </div>
          {showQuantityStats && record?.quantity !== undefined && (
            <div className="text-xs text-blue-200/50 mt-1">
              数量: {record.quantity}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ProcessRecordView
