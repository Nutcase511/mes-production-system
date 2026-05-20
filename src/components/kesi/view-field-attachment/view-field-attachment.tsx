import React from 'react'
import { Download, Eye, Video, Music, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import JSZip from 'jszip'
// @ts-ignore - file-saver doesn't have proper types
import { saveAs } from 'file-saver'
import './attachment.css'

// ============================================
// 工具函数
// ============================================

function getMediaUrl(url: string | undefined): string {
  if (!url) return ''
  // base64 编码的图片直接返回
  if (url.length > 200) return url
  return url?.startsWith('/rest') ? url : '/rest' + url
}

// ============================================
// 子组件
// ============================================

// 视频/音频展示组件
const MediaShow = ({ file, downloadFile, type }: { file: any; downloadFile: (file: any) => void; type: 'video' | 'audio' }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md">
      {type === 'video' ? (
        <Video className="h-5 w-5 text-slate-500" />
      ) : (
        <Music className="h-5 w-5 text-slate-500" />
      )}
      <span className="flex-1 text-sm truncate">{file.name}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-1 hover:bg-slate-100 rounded"
              onClick={() => setOpen(true)}
            >
              <Eye className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>预览文件</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-1 hover:bg-slate-100 rounded"
              onClick={() => downloadFile(file)}
            >
              <Download className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>下载文件</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{file.name}</DialogTitle>
          </DialogHeader>
          {type === 'video' ? (
            <video
              className="w-full max-h-[70vh]"
              src={file.url || file.preview}
              controls
            />
          ) : (
            <audio
              className="w-full"
              src={file.url || file.preview}
              controls
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// PDF 预览组件
const PDFPreview = ({ downloadFile, value }: { downloadFile: (file: any) => void; value: any }) => {
  const fileUrl = getMediaUrl(value.url || value.preview)

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md">
      <FileText className="h-5 w-5 text-red-500" />
      <span className="flex-1 text-sm truncate">{value?.name ?? ''}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-1 hover:bg-slate-100 rounded"
              onClick={() => window.open(location.origin + fileUrl, '_blank')}
            >
              <Eye className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>预览 PDF</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-1 hover:bg-slate-100 rounded"
              onClick={() => downloadFile(value)}
            >
              <Download className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>下载文件</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

// 文本模式展示（文件列表）
const FileDownload = ({ downloadFile, value }: { downloadFile: (file: any) => void; value: any }) => {
  if (isArray(value)) {
    return (
      <div className="space-y-1">
        {value.map((item: any, index: number) =>
          item?.name?.endsWith('.pdf') ? (
            <PDFPreview key={index} downloadFile={downloadFile} value={item} />
          ) : (
            <a
              key={index}
              className="block p-2 border rounded-md hover:bg-slate-50 cursor-pointer"
              onClick={() => downloadFile(item)}
            >
              {item?.name ?? ''}
            </a>
          )
        )}
      </div>
    )
  }

  return value?.name?.endsWith('.pdf') ? (
    <PDFPreview downloadFile={downloadFile} value={value} />
  ) : (
    <a
      className="block p-2 border rounded-md hover:bg-slate-50 cursor-pointer"
      onClick={() => downloadFile(value)}
    >
      {value?.name ?? ''}
    </a>
  )
}

// 图片卡片展示组件
const PhotoCard = ({
  file,
  handlePreview,
  downloadFile,
  canDownload = true,
  previewSize
}: {
  file: any
  handlePreview: () => void
  downloadFile: () => void
  canDownload?: boolean
  previewSize?: { width: number; height: number }
}) => {
  const src = getMediaUrl(file.previewURL || file.url || file.preview)
  const fileName = file.name

  const cardStyle: React.CSSProperties = previewSize
    ? { width: previewSize.width, height: previewSize.height }
    : { width: 160, height: 200 }

  return (
    <div className="photo-card-container" style={cardStyle}>
      <div className="photo-card-image-wrapper" onClick={handlePreview}>
        <img src={src} alt={fileName} loading="lazy" />
      </div>
      <div className="photo-card-info-wrapper">
        <div title={fileName} className="photo-card-file-info">
          <span className="photo-card-file-name">{fileName}</span>
        </div>
        {canDownload && (
          <Button
            size="sm"
            variant="ghost"
            onClick={downloadFile}
            className="photo-card-download-btn"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// 图片条形展示组件
const PhotoBar = ({
  file,
  handlePreview,
  downloadFile,
  canDownload = true
}: {
  file: any
  handlePreview: () => void
  downloadFile: () => void
  canDownload?: boolean
}) => {
  const src = getMediaUrl(file.previewURL || file.url || file.preview)
  const fileName = file.name

  return (
    <div className="photo-bar-container">
      <div className="photo-bar-image-wrapper" onClick={handlePreview}>
        <img src={src} alt={fileName} loading="lazy" />
      </div>
      <div title={fileName} className="photo-bar-name-wrapper">
        <span className="photo-bar-file-name">{fileName}</span>
      </div>
      {canDownload && (
        <div className="photo-bar-download-wrapper">
          <Button
            size="sm"
            variant="ghost"
            onClick={downloadFile}
            className="photo-bar-download-btn"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

// 图片展示组件（根据配置选择不同展示方式）
const ImageShow = ({
  file,
  downloadFile,
  handlePreview,
  schema,
  canDownload,
  inList
}: {
  file: any
  downloadFile: () => void
  handlePreview: () => void
  schema?: any
  canDownload?: boolean
  inList?: boolean
}) => {
  const src = getMediaUrl(file.previewURL || file.url || file.preview)

  // 列表中显示小缩略图
  if (inList) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="upload-item-img-wrapper-thumb" onClick={handlePreview}>
              <img src={src} style={{ width: 36, height: 36 }} className="upload-item-img" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <PhotoCard
              file={file}
              handlePreview={handlePreview}
              downloadFile={downloadFile}
              canDownload={canDownload}
              previewSize={schema?.previewSize}
            />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // 小图条形模式
  if (schema?.showType === 'smallImage') {
    return <PhotoBar file={file} handlePreview={handlePreview} downloadFile={downloadFile} canDownload={canDownload} />
  }

  // 默认卡片模式
  return (
    <PhotoCard
      file={file}
      handlePreview={handlePreview}
      downloadFile={downloadFile}
      canDownload={canDownload}
      previewSize={schema?.previewSize || { height: 200, width: 160 }}
    />
  )
}

// ============================================
// 附件展示主组件
// ============================================

export interface ShowAttachmentProps {
  schema?: any
  value: any
  item?: any
  inList?: boolean
}

export const Attachment: React.FC<ShowAttachmentProps> = ({
  schema = {},
  value,
  item,
  inList = false
}) => {
  const { styleType, showNum, addToken, canDownload } = schema

  const [fileList, setFileList] = React.useState<any[]>([])
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [previewImage, setPreviewImage] = React.useState('')
  const [previewTitle, setPreviewTitle] = React.useState('')

  // 处理文件列表
  React.useEffect(() => {
    let temp: any[] = isArray(value) ? value : value && value !== '' ? [value] : []
    temp = temp.map((t: any) => {
      let res = t
      if (isString(t)) {
        try {
          res = JSON.parse(t)
        } catch (e) {
          // Silently ignore JSON parse errors
        }
      }
      return res
    })

    let f = showNum ? temp.slice(0, showNum) : temp
    setFileList(
      f.map((file: any) => {
        // 处理缩略图
        if (file.thumbUrl) {
          return {
            ...file,
            previewURL: file.thumbUrl,
            thumbUrl: file.thumbUrl + '?thumbnail=true&width=70&height=70'
          }
        }
        if (file.url?.indexOf('/rest') > -1) {
          return {
            ...file,
            previewURL: file.url,
            url: file.url + '?thumbnail=true&width=70&height=70'
          }
        }
        return file
      })
    )
  }, [value, showNum])

  // 预览图片
  const handlePreview = (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = file.thumbUrl
    }
    setPreviewImage(file.url || file.response?.url || file.preview || '')
    setPreviewOpen(true)
    setPreviewTitle(file.name || file.url?.substring(file.url?.lastIndexOf('/') + 1))
  }

  // 下载文件
  const downloadFile = (val: any) => {
    let url = getMediaUrl(val.previewURL || val.url || val.response?.url || val.preview)

    // 如果需要添加 token
    if (addToken) {
      // TODO: 从适当的地方获取 token
      // url = url + '?token=' + user?.token
    }

    // 创建下载链接
    const a = document.createElement('a')
    a.href = url
    a.download = val.name || 'download'
    a.click()
  }

  // 批量下载所有文件
  const downloadAllFiles = async (e: React.MouseEvent) => {
    e.stopPropagation()

    const zip = new JSZip()

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const fileUrl = getMediaUrl(file.previewURL || file.url || file.preview)

      try {
        const response = await fetch(location.origin + fileUrl)
        if (!response.ok) throw new Error('文件获取失败')
        const fileBlob = await response.blob()

        zip.file(file.name || `file_${i + 1}`, fileBlob)
      } catch (error) {
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const fileName = item?._label
      ? `${item._label}_${schema.title}`
      : schema.title || 'files'

    saveAs(zipBlob, `${fileName}_${Date.now()}.zip`)
  }

  // ============================================
  // 渲染不同类型的附件
  // ============================================

  // 文本模式
  if (styleType === 'text') {
    return <FileDownload downloadFile={downloadFile} value={value} />
  }

  // 视频模式
  if (styleType === 'video') {
    const videos = isArray(value) && value.length > 0 ? value : value ? [value] : []
    return (
      <div className="space-y-1 max-h-42 overflow-y-auto">
        {videos.map((file: any, index: number) => (
          <MediaShow key={index} file={file} downloadFile={downloadFile} type="video" />
        ))}
      </div>
    )
  }

  // 音频模式
  if (styleType === 'audio') {
    const audios = isArray(value) && value.length > 0 ? value : value ? [value] : []
    return (
      <div className="space-y-1 max-h-42 overflow-y-auto">
        {audios.map((file: any, index: number) => (
          <MediaShow key={index} file={file} downloadFile={downloadFile} type="audio" />
        ))}
      </div>
    )
  }

  // 默认图片模式
  return (
    <div className="show-attachment">
      <div className="flex flex-wrap gap-2">
        {fileList.map((file, index) => (
          <ImageShow
            key={index}
            file={file}
            handlePreview={() => handlePreview(file)}
            downloadFile={() => downloadFile(file)}
            schema={schema}
            canDownload={canDownload}
            inList={inList}
          />
        ))}
      </div>

      {/* 图片预览 Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
          </DialogHeader>
          <img
            alt="预览图片"
            className="w-full"
            src={getMediaUrl(previewImage)}
          />
        </DialogContent>
      </Dialog>

      {/* 批量下载按钮 */}
      {canDownload?.downloadAll !== false && fileList.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="mt-2 p-2 hover:bg-slate-100 rounded flex items-center gap-2 text-sm"
                onClick={downloadAllFiles}
              >
                <Download className="h-4 w-4" />
                <span>下载全部</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>下载所有文件为 ZIP</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
