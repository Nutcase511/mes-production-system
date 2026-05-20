import * as React from 'react'
import type { BaseFormFieldProps } from '@/lib/base-form-props'
import DOMPurify from 'dompurify'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document'
import '@ckeditor/ckeditor5-build-decoupled-document/build/translations/zh-cn'
import { cn } from '@/lib/utils'
import isEmpty from 'lodash/isEmpty'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// 导入配置
import { fontBackgroundColor, fontColor, fontFamily } from './RichTextConfig'
import MyUploadAdapterPlugin from './RichTextUploadAdapter'

// 导入样式
// import './form-rich-text.css'

export interface FormRichTextProps extends Omit<BaseFormFieldProps, 'value' | 'onChange'> {
  /** 当前值 */
  value?: string
  /** 值变化回调 */
  onChange?: (value: string) => void
  /** 占位文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 默认值 */
  defaultVal?: string
  /** 默认值类型 */
  defaultValType?: 'fixed' | 'logic'
  /** 是否在列表中 */
  inList?: boolean
  /** 键名 */
  key?: string
  /** 标题 */
  title?: string
  /** 编辑表单 */
  ediforms?: boolean
  /** 工具栏配置 */
  toolbar?: any
  /** 表单记录数据 */
  record?: any
  [key: string]: any
}

// 预览组件
const Preview: React.FC<{
  value?: string
  inList?: boolean
  title?: string
}> = ({ value, inList, title }) => {
  const [visible, setVisible] = React.useState(false)
  const content = (
    <div
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(value?.replace(/<a/g, '<a target="_Blank"') || '', { ADD_TAGS: ['a'], ADD_ATTR: ['target'] })
      }}
      className="ck-content"
    />
  )

  if (!inList || !value) {
    return content
  }

  return (
    <>
      <span
        style={{ cursor: 'pointer' }}
        onClick={() => setVisible(true)}
        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
      >
        <span className="mr-1">📄</span>
        <a>查看内容</a>
      </span>
      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{title || '富文本内容'}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    </>
  )
}

const FormRichText = React.forwardRef<HTMLDivElement, FormRichTextProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      placeholder = '编辑富文本',
      disabled = false,
      defaultVal,
      defaultValType = 'fixed',
      inList = false,
      key: fieldKey,
      title,
      toolbar,
    } = props

    const editorRef = React.useRef<any>(null)

    // 默认值生效和语言设置
    React.useEffect(() => {
      if (typeof window !== 'undefined' && window.CKEDITOR_TRANSLATIONS?.['zh-cn']) {
        const dictionary: Record<string, string> = {
          'In line': '嵌入行内',
          'Wrap text': '图片侧边显示',
          'Break text': '图片对齐方式',
          'Toggle caption on': '图片解释说明',
          'List properties': '列表属性',
          'Start at': '开始于',
          'Reversed order': '倒叙'
        }
        window.CKEDITOR_TRANSLATIONS['zh-cn'].dictionary = {
          ...window.CKEDITOR_TRANSLATIONS['zh-cn'].dictionary,
          ...dictionary
        }
      }
    }, [])

    // 只读模式显示预览
    if (disabled) {
      return <Preview value={value} inList={inList} title={title} />
    }

    return (
      <div ref={ref} className="custom-text-editor" {...props}>
        <CKEditor
          id={fieldKey}
          onReady={(editor) => {
            editorRef.current = editor
            if (editor) {
              if (!inList && !value && defaultVal && defaultValType !== 'logic') {
                editor.setData(defaultVal)
              }
              const toolbarElement = editor.ui.view.toolbar.element
              const editableElement = editor.ui.getEditableElement()
              if (editableElement && editableElement.parentElement) {
                editableElement.parentElement.insertBefore(toolbarElement as Node, editableElement as Node)
              }
            }
          }}
          onChange={(_event, editor) => {
            const data = editor.getData()
            onChange?.(data)
          }}
          editor={DecoupledEditor}
          data={value || '<p></p>'}
          config={{
            language: 'zh-cn',
            extraPlugins: [MyUploadAdapterPlugin],
            placeholder: placeholder,
            toolbar: !isEmpty(toolbar) ? toolbar : {
              shouldNotGroupWhenFull: true,
              items: [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                'link',
                '|',
                'bulletedList',
                'numberedList',
                '|',
                'outdent',
                'indent',
                '|',
                'blockQuote',
                'insertTable',
                '|',
                'fontFamily',
                'fontSize',
                'fontColor',
                'fontBackgroundColor',
                'undo',
                'redo'
              ]
            },
            fontFamily,
            fontBackgroundColor,
            fontColor,
          }}
        />
      </div>
    )
  }
)

FormRichText.displayName = 'FormRichText'

export { FormRichText }
