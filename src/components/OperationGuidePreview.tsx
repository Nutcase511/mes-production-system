import { FileText } from 'lucide-react'

interface OperationGuidePreviewProps {
  files?: any
}

function OperationGuidePreview({ files }: OperationGuidePreviewProps) {
  if (!files) {
    return (
      <div className="text-sm text-blue-200/50 flex items-center gap-2 py-2">
        <FileText className="w-4 h-4" />
        暂无操作指导书
      </div>
    )
  }

  // files can be a string, string[], or object
  const fileList = Array.isArray(files) ? files : [files]

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-blue-200/70 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        操作指导书
      </div>
      <div className="space-y-1">
        {fileList.map((file: any, i: number) => (
          <div key={i} className="text-sm text-cyan-300 hover:text-cyan-200 cursor-pointer">
            {typeof file === 'string' ? file : file?.name || `文件 ${i + 1}`}
          </div>
        ))}
      </div>
    </div>
  )
}

export default OperationGuidePreview
