import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { BaseFormFieldProps } from '@/lib/base-form-props'
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
import { Upload, Eye, Trash2, Paperclip, Image as ImageIcon } from 'lucide-react'
import { createAPI, useUser } from '@airiot/client'
import isNumber from 'lodash/isNumber'
import isArray from 'lodash/isArray'
import { cn } from '@/lib/utils'
import './form-upload.css'

const restrictedFileExtensions = [
  'html', 'htm', 'js', 'php', 'php3', 'php4', 'php5', 'phtml',
  'asp', 'aspx', 'jsp', 'jspx', 'sh', 'pl', 'py', 'rb',
  'exe', 'bat', 'cmd', 'com', 'vbs', 'vb', 'vbe', 'wsf', 'wsh',
  'xml', 'swf', 'jar', 'class'
]

const fileType = [
  "doc", "docx", "pdf", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "dwg",
  "bin", "css", "json", "map", "wasm", "obj", "fbx", "glb", "gltf", "ply",
  "pcd", "3mf", "mtl"
]
const imageType = [
  "jpg", "jpeg", "png", "webp", "bmp", "gif", "exif", "svg", "ico", "tif"
]
const videoType = [
  "mp4", "wmv", "3gp", "avi", "flv", "vob", "m4v", "mov", "rmvb", "webm"
]
const audioType = [
  "mp3", "wav", "flac", "ape", "aac", "opus", "pcm"
]

function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

const UploadButton: React.FC<{ styleType?: string; onClick?: () => void }> = ({ styleType, onClick }) => {
  if (!styleType || styleType === 'picture-card') {
    return (
      <div className="flex flex-col items-center justify-center cursor-pointer" onClick={onClick}>
        <Upload className="h-8 w-8 text-slate-400" />
        <div className="text-xs text-slate-500 mt-2">上传</div>
      </div>
    )
  }
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Upload className="h-4 w-4 mr-2" />
      上传
    </Button>
  )
}

// 自定义文件项渲染函数 - 文本样式
const ItemRender: React.FC<{
  file: any
  onRemove: (file: any) => void
}> = ({ file, onRemove }) => {
  const url = file.url || (file.response?.url ? getMediaUrl(file.response?.url) : '')

  // 上传中状态，显示进度条
  if (file.status === 'uploading') {
    return (
      <div className="w-96 p-2 border rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <Paperclip className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-700 flex-1 truncate">{file.name}</span>
          <span className="text-xs text-slate-500">{file.percent || 0}%</span>
        </div>
        <Progress value={file.percent || 0} className="h-1" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md hover:bg-slate-50">
      <Paperclip className="h-4 w-4 text-slate-500" />
      <a
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-sm text-slate-700 hover:text-blue-600 truncate"
        title={file.name || ''}
        href={url}
      >
        {file.name || ''}
      </a>
      <div className="flex gap-1">
        {file?.name?.endsWith('.pdf') && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  title="预览"
                  type="button"
                  className="p-1 hover:bg-slate-200 rounded"
                  onClick={() => window.open(url, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>预览</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onRemove(file)}
                title="删除文件"
                type="button"
                className="p-1 hover:bg-red-100 rounded text-slate-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>删除文件</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

// 图片卡片渲染函数
const ImageCardItemRender: React.FC<{
  file: any
  onPreview: () => void
  onRemove: () => void
}> = ({ file, onPreview, onRemove }) => {
  return (
    <div className="upload-item-container group relative">
      {/* 图片容器 */}
      <div className="upload-item-img-wrapper">
        {file.status === 'uploading' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="text-center">
              <Progress value={file.percent || 0} className="h-2 w-24" />
              <p className="text-xs text-slate-500 mt-1">{file.percent || 0}%</p>
            </div>
          </div>
        ) : (
          <img
            src={getMediaUrl(file.url || file.response?.url || file.thumbUrl)}
            className="upload-item-img"
            alt={file.name}
          />
        )}
      </div>

      {/* 悬停蒙版 */}
      <div className="upload-item-mask">
        <div className="upload-item-text-wrap">
          <div className="upload-item-name">{file.name}</div>
        </div>

        {/* 操作按钮 */}
        <div className="upload-item-actions">
          <button
            className="upload-item-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onPreview()
            }}
            title="预览"
          >
            <Eye className="upload-item-icon" />
          </button>

          <button
            className="upload-item-btn"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            title="删除"
          >
            <Trash2 className="upload-item-icon" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 自动压缩
const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || ''
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

const autoZip = (file: File, zip?: boolean): Promise<File> => {
  const fileSize = parseFloat((parseInt(String(file['size'])) / 1024).toFixed(2))
  const read = new FileReader()
  read.readAsDataURL(file)

  return new Promise(function (resolve, reject) {
    if (!zip) {
      resolve(file)
      return
    }
    read.onload = function (e) {
      const img = new Image()
      img.src = e.target?.result as string
      img.onload = function () {
        const w = img.width
        const h = img.height
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }
        let base64: string
        canvas.setAttribute('width', String(w))
        canvas.setAttribute('height', String(h))
        ctx.drawImage(img, 0, 0, w, h)

        if (fileSize < 100) {
          base64 = canvas.toDataURL(file['type'], 0.5)
        } else if (fileSize > 100 && fileSize < 500) {
          base64 = canvas.toDataURL(file['type'], 0.2)
        } else {
          base64 = canvas.toDataURL(file['type'], 0.1)
        }

        const files = dataURLtoFile(base64, file.name)
        resolve(files)
      }
    }
    read.onerror = () => reject(new Error('FileReader error'))
  })
}

// 加水印
const addWatermark = (
  file: File,
  opt: any,
  user: any
): Promise<File> => {
  return new Promise((resolve) => {
    if (!opt?.use) {
      resolve(file)
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const img = document.createElement('img')
      img.src = reader.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const imgW = img.naturalWidth
        const imgH = img.naturalHeight
        canvas.width = imgW
        canvas.height = imgH
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }
        ctx.drawImage(img, 0, 0)

        ctx.fillStyle = opt.color || 'gray'
        ctx.globalAlpha = 0.5
        ctx.font = `${opt.fontSize || 100}px Arial`

        const text = opt.contentType === 'time'
          ? new Date().toLocaleString('zh-CN')
          : opt.contentType === 'user'
            ? user?.username
            : opt.contentType === 'text'
              ? (opt.content || 'Airiot')
              : 'Airiot'

        const textWidth = ctx.measureText(text)?.width || 0
        const textHeight = opt.fontSize || 100

        if (opt.position === 'repeat') {
          if (opt.rotate) ctx.rotate(Math.PI / 180 * opt.rotate)
          const space = (opt as any).space || 50
          for (let x = -imgW; x < imgW * 1.4; x += (space + textWidth)) {
            for (let y = -imgH; y < imgH * 1.4; y += (space + textHeight)) {
              ctx.fillText(text, x, y)
            }
          }
        } else {
          const pst = opt.position?.split('-') || ['left', 'top']
          const x = pst[0] === 'left'
            ? 20
            : pst[0] === 'center'
              ? imgW / 2 - textWidth / 2
              : imgW - textWidth - 20
          const y = pst[1] === 'top'
            ? textHeight + 20
            : pst[1] === 'center'
              ? imgH / 2 + textHeight / 2
              : imgH - 20
          ctx.fillText(text, x, y)
        }

        canvas.toBlob((result) => {
          if (result) {
            resolve(new File([result], file.name, { type: file.type }))
          } else {
            resolve(file)
          }
        }, file.type)
      }
    }
  })
}

const getAccept = (ac: string | undefined, styleType: string): string => {
  const res = ac ?? (
    styleType === 'text'
      ? '*'
      : styleType === 'video'
        ? 'video/*'
        : styleType === 'audio'
          ? 'audio/*'
          : 'image/*'
  )

  if (res === 'video/*') {
    return videoType.map(v => '.' + v).join(',')
  } else if (res === 'audio/*') {
    return audioType.map(v => '.' + v).join(',')
  } else if (res === 'image/*') {
    return imageType.map(v => '.' + v).join(',')
  } else if (res === '*') {
    return fileType.map(v => '.' + v).join(',')
  } else {
    return res
  }
}

function getMediaUrl(url: string | undefined): string {
  if (!url) return ''
  return url?.startsWith('/rest') ? url : '/rest' + url
}

// 真正的上传函数
const uploadFile = async (
  file: File,
  url: string,
  headers: Record<string, string>,
  onProgress?: (percent: number) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100)
        onProgress(percent)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } catch {
          resolve({ url: xhr.responseText })
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed'))

    xhr.open('POST', url)

    // 设置请求头
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })

    const formData = new FormData()
    formData.append('file', file)

    xhr.send(formData)
  })
}

// 导出类型供外部使用
export { fileType, imageType, videoType, audioType }

export interface FormUploadProps extends BaseFormFieldProps {
  /** 展示样式类型 */
  styleType?: 'picture-card' | 'text' | 'video' | 'audio'
  /** 接受的文件类型 */
  accept?: string
  /** 文件大小限制(MB) */
  size?: number
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 最大上传数量 */
  maxUploadNum?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 仅相机 */
  onlyCamera?: boolean
  /** 上传位置 */
  uploadPosition?: 'media' | 'local'
  /** 上传文件夹 */
  uploadFolder?: boolean
  /** 文件夹类型 */
  folderType?: 'folder' | 'upload'
  /** 文件夹路径 */
  folder?: string
  /** 是否 base64 编码 */
  base64?: boolean
  /** 是否自动压缩 */
  autoZip?: boolean
  /** 是否自动命名 */
  autoName?: boolean
  /** 水印配置 */
  watermark?: any
  /** 排序方式 */
  sort?: 'asc' | 'desc'
  /** 是否允许删除媒体 */
  mediaDelete?: boolean
  /** 是否 FTP 上传 */
  ftp?: boolean
  /** 文本转音频 */
  textToAudio?: boolean
  /** 默认值 */
  defaultVal?: any
  /** 默认值类型 */
  defaultValType?: string
  /** 键名 */
  key?: string
  /** 上传类型 */
  uploadType?: 'upload_attachment' | 'upload_attachment_group'
}

const FormUpload = React.forwardRef<HTMLDivElement, FormUploadProps>(
  (props, ref) => {
    const { value, onChange, uploadType } = props

    const { user } = useUser()
    const api = createAPI({ name: 'media' })

    const isSingleUpload = uploadType === 'upload_attachment'
    const styleType = props.styleType || 'picture-card'
    const accept = getAccept(props.accept, styleType)

    // 上传地址
    // console.log('api', api, user)
    const uploadUrl = api.host + '/core/mediaLibrary/upload?action=' +
      (props.onlyCamera ? 'rename' : 'cover')
    const catalog = props.folderType === 'folder' ? ('&catalog=' + props.folder) : ''
    const fullUploadUrl = uploadUrl + catalog

    // 获取请求头
    const getHeaders = () => {
      const headers = (api as any).headers || {}
      // 移除 Content-Type 让浏览器自动设置（FormData 需要）
      const { 'Content-Type': _contentType, ...rest } = headers as Record<string, string>
      return rest
    }

    const [fileList, setFileList] = React.useState<any[]>(() => {
      if (isSingleUpload) {
        return value && value !== '' ? [value] : []
      } else {
        return isArray(value) ? value : []
      }
    })

    const [preview, setPreview] = React.useState({
      visible: false,
      image: '',
      title: ''
    })

    // 默认值生效
    React.useEffect(() => {
      setTimeout(() => {
        if (!value && props.defaultVal && onChange && props.defaultValType !== 'logic') {
          onChange(props.defaultVal)
        }
      })
    }, [])

    React.useEffect(() => {
      if (value === 'loading') return
      setFileList(() => {
        if (isSingleUpload) {
          return value && value !== '' ? [value] : []
        } else {
          return isArray(value) ? value : []
        }
      })
    }, [isSingleUpload, value])

    const cKey = props.key
    const width = props.width
    const height = props.height

    const showPreview = async (file: any) => {
      const fileType = file.name.substring(file.name.lastIndexOf('.') + 1)
      if (['png', 'jpg', 'jpeg', 'gif'].indexOf(fileType) === -1) return
      if (file.response?.url) {
        file.preview = getMediaUrl(file.response.url)
      } else if (!file.url && !file.preview) {
        file.preview = file.originFileObj instanceof Blob
          ? await getBase64(file.originFileObj)
          : file.thumbUrl
      }
      setPreview({
        visible: true,
        image: file.preview || file.url,
        title: file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
      })
    }

    const onRemoveChange = (file: any) => {
      if (isSingleUpload) {
        onChange?.(null)
        setFileList([])
      } else {
        const filtered = fileList.filter((f: any) => f.uid !== file.uid)
        if (filtered.length === 0) {
          setFileList([])
          onChange?.(null)
        } else {
          onChange?.(filtered)
          setFileList(filtered)
        }
      }
    }

    const onRemove = (file: any) => {
      return new Promise((resolve) => {
        if (props.mediaDelete) {
          // TODO: 显示删除确认对话框
          onRemoveChange(file)
          resolve(false)
        } else {
          onRemoveChange(file)
          resolve(false)
        }
      })
    }

    // 处理文件上传
    const handleFileUpload = async (file: File) => {
      // 检查上传数量限制
      if (isNumber(props.maxUploadNum) && fileList.length >= props.maxUploadNum!) {
        return
      }

      const uid = Date.now() + Math.random().toString(36).substring(2, 9)

      // 创建文件对象
      const newFile = {
        uid,
        name: file.name,
        size: file.size,
        status: 'uploading',
        percent: 0,
        originFileObj: file
      }

      // 添加到列表
      setFileList(prev => [...prev, newFile])

      try {
        // 上传前验证
        if (props.size && file.size / 1024 / 1024 > props.size) {
          throw new Error(`文件大小不可超过${props.size}MB`)
        }

        const fileType = file.name.substring(file.name.lastIndexOf('.') + 1)
        if (restrictedFileExtensions.indexOf(fileType) > -1) {
          throw new Error(`不可上传${fileType}文件`)
        }
        if (accept?.indexOf(fileType) === -1) {
          throw new Error('请上传正确类型文件')
        }

        // 自动压缩
        let processedFile = file
        if (props.autoZip) {
          processedFile = await autoZip(file, props.autoZip)
        }

        // 自动重命名
        if (props.autoName) {
          const parts = file.name.split('.')
          const ext = parts.length > 1 ? parts[parts.length - 1] : ''
          const newName = Math.random().toString(36).substring(2, 18) + (ext ? '.' + ext : '')
          processedFile = new File([processedFile], newName, { type: processedFile.type })
        }

        // 加水印
        processedFile = await addWatermark(processedFile, props.watermark, user)

        // 执行上传
        const response = await uploadFile(
          processedFile,
          fullUploadUrl,
          getHeaders(),
          (percent) => {
            setFileList(prev =>
              prev.map(f =>
                f.uid === uid ? { ...f, percent } : f
              )
            )
          }
        )

        // 上传成功
        const successFile = {
          uid,
          name: processedFile.name,
          size: processedFile.size,
          status: 'done',
          percent: 100,
          url: response.url || response,
          response: response,
          originFileObj: file
        }

        setFileList(prev => {
          const updated = prev.map(f => f.uid === uid ? successFile : f)

          // 触发 onChange
          if (isSingleUpload) {
            onChange?.(successFile)
            return [successFile]
          } else {
            onChange?.(updated)
            return updated
          }
        })

      } catch (error: any) {
        const errorFile = {
          uid,
          name: file.name,
          size: file.size,
          status: 'error',
          percent: 0,
          response: { message: error.message || '上传失败' },
          originFileObj: file
        }

        setFileList(prev =>
          prev.map(f => f.uid === uid ? errorFile : f)
        )

        // 从列表中移除失败的文件
        setTimeout(() => {
          setFileList(prev => prev.filter(f => f.uid !== uid))
        }, 2000)
      }
    }

    const hideAddBtn = isSingleUpload && fileList.length >= 1

    const defaultWidth = width || 104
    const defaultHeight = height || 104

    return (
      <div ref={ref} className={cn(
        "custom-upload",
        styleType === 'picture-card' ? 'upload-picture-card' : 'upload-text'
      )}>
        <style>{`
          .upload-list-custom-${cKey} .upload-item-container {
            float: left;
            width: ${defaultWidth}px;
            height: ${defaultHeight}px;
            margin-right: 8px;
          }
        `}</style>

        {/* 图片卡片样式 */}
        {styleType === 'picture-card' ? (
          <div className="table-upload-attach">
            <div className="flex flex-wrap gap-2">
              {fileList.map((file) => (
                <ImageCardItemRender
                  key={file.uid}
                  file={file}
                  onPreview={() => showPreview(file)}
                  onRemove={() => onRemove(file)}
                />
              ))}

              {!hideAddBtn && !props.disabled && (
                <div
                  className="upload-item-container upload-item-add-btn cursor-pointer hover:bg-slate-100"
                  style={{ width: defaultWidth, height: defaultHeight }}
                >
                  <label className="cursor-pointer w-full h-full flex items-center justify-center">
                    <input
                      type="file"
                      className="hidden"
                      accept={accept}
                      multiple={!isSingleUpload}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        files.forEach(file => {
                          handleFileUpload(file)
                        })
                        e.target.value = ''
                      }}
                    />
                    <UploadButton styleType={styleType} />
                  </label>
                </div>
              )}

              {/* 媒体库上传 - TODO */}
              {/* {!props.disabled && (
                <div className="text-sm text-slate-400 flex items-center justify-center border-2 border-dashed rounded"
                  style={{ width: defaultWidth, height: defaultHeight }}>
                  <div className="text-center p-2">
                    <ImageIcon className="h-8 w-8 mx-auto mb-1 text-slate-400" />
                    <div className="text-xs">等待 MediaModal 迁移</div>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        ) : (
          /* 文本样式 */
          <div className="space-y-2">
            {fileList.map((file) => (
              <ItemRender
                key={file.uid}
                file={file}
                onRemove={() => onRemove(file)}
              />
            ))}

            {!hideAddBtn && !props.disabled && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    上传文件
                    <input
                      type="file"
                      className="hidden"
                      accept={accept}
                      multiple={!isSingleUpload}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        files.forEach(file => {
                          handleFileUpload(file)
                        })
                        e.target.value = ''
                      }}
                    />
                  </label>
                </Button>
              </div>
            )}

            {/* 文字转音频 - TODO */}
            {styleType === 'audio' && props.textToAudio && !(isSingleUpload && fileList.length >= 1) && (
              <div className="text-sm text-slate-400">
                等待 Dashboard.BoradcastButton 迁移
              </div>
            )}

            {/* 媒体库上传 - TODO */}
            {/* {!props.disabled && (
              <div className="text-sm text-slate-400">
                等待 MediaModal 迁移
              </div>
            )} */}
          </div>
        )}

        {/* 图片预览对话框 */}
        <Dialog open={preview.visible} onOpenChange={(open) => !open && setPreview({ visible: false, image: '', title: '' })}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{preview.title}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img alt="preview" className="max-w-full" src={preview.image} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
)

FormUpload.displayName = 'FormUpload'

const FormUploadGroup = (props: FormUploadProps) => {
  return <FormUpload {...props} uploadType='upload_attachment_group' />
}

export { FormUpload, FormUploadGroup }