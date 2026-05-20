import omit from 'lodash/omit'
import { getToken } from '@/lib/auth-token'

// 获取 API host 的函数 - 需要根据项目实际情况调整
const getApiHost = () => {
  // 这里需要根据项目的实际 API 配置来获取
  // 临时返回空字符串，需要使用者根据实际情况配置
  if (typeof window !== 'undefined') {
    // 从环境变量或配置中获取
    return window.location.origin + '/'
  }
  return '/'
}

// 获取请求头的函数 - 需要根据项目实际情况调整
const getApiHeaders = () => {
  // 这里需要根据项目的实际认证方式来获取
  // 临时返回空对象，需要使用者根据实际情况配置
  const headers: Record<string, string> = {}
  if (typeof window !== 'undefined') {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  return headers
}

class MyUploadAdapter {
  loader: any

  constructor(loader: any) {
    this.loader = loader
  }

  upload() {
    const HOST = getApiHost()

    return this.loader.file
      .then((file: File) => new Promise((resolve, reject) => {
        const formData = new FormData()
        formData.append('file', file)

        fetch(`${HOST}core/media/img`, {
          method: 'POST',
          headers: omit(getApiHeaders(), 'Content-Type'),
          body: formData
        })
        .then(res => res.json())
        .then(res => {
          if (res.url) {
            resolve({ default: HOST.slice(0, -1) + res.url })
          } else {
            reject(new Error('Upload failed'))
          }
        })
        .catch(err => reject(err))
      }))
  }

  abort() {
    // 上传中断逻辑
  }
}

class MyUploadAdapterPlugin {
  static readonly pluginName = 'MyUploadAdapterPlugin'
  editor: any

  constructor(editor: any) {
    this.editor = editor
  }

  init() {
    const fileRepository = this.editor.plugins.get('FileRepository')
    if (fileRepository) {
      fileRepository.createUploadAdapter = (loader: any) => new MyUploadAdapter(loader)
    }
  }
}

export default MyUploadAdapterPlugin
