import React, { useState } from 'react'
import { useModelGet, useModelSave, useModelDelete, useModelGetItems, useModel } from '@airiot/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Copy,
  AlertTriangle,
  Plus,
} from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'
import { SchemaForm } from '@/components/kesi/schema-form/schema-form'
import { ViewDetail } from '@/components/kesi/view-detail/view-detail'
import { HasPermission } from '@/components/kesi/view-permission/view-permission'
import type { FormSchemaItem } from '@/lib/model-types'
import { formLayoutToClassNames } from '@/lib/form-layout'

interface EditActionContentProps {
  itemId: string
  onClose?: () => void
  formSchema?: FormSchemaItem[]
  classNames?: Record<'form' | 'group' | 'field' | 'label' | 'input' | 'description' | 'error', string>
}

const EditActionContent: React.FC<EditActionContentProps> = ({ itemId, onClose, formSchema, classNames }) => {
  const { data, loading, model } = useModelGet({ id: itemId })
  const { getItems } = useModelGetItems()
  const { saveItem } = useModelSave()
  const [saving, setSaving] = useState(false)

  const formId = `edit-form-${itemId}`

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      await saveItem(values)
      await getItems() // 刷新列表数据
      onClose?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>编辑 {model?.title}</DialogTitle>
      </DialogHeader>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="max-h-[70vh] pr-3">
          <SchemaForm formId={formId} defaultValues={data} schema={model} classNames={classNames} formSchema={formSchema || model.formSchema || model.form} onSubmit={handleSave} fieldRules={(model as any)?.fieldRules} />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">取消</Button>
        </DialogClose>
        <Button form={formId} type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          保存
        </Button>
      </DialogFooter>
    </>
  )
}

interface ExportActionContentProps {
  itemId: string
  format?: 'json' | 'csv' | 'excel'
}

const ExportActionContent: React.FC<ExportActionContentProps> = ({ itemId, format = 'json' }) => {
  const { data, loading } = useModelGet({ id: itemId })

  const handleExport = () => {
    let content = ''
    let filename = `export_${itemId}`
    let mimeType = 'text/plain'

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2)
        filename += '.json'
        mimeType = 'application/json'
        break
      case 'csv':
        // Simple CSV export
        if (data && typeof data === 'object') {
          const headers = Object.keys(data)
          const values = Object.values(data).map(v =>
            typeof v === 'object' ? JSON.stringify(v) : String(v)
          )
          content = [headers.join(','), values.join(',')].join('\n')
        }
        filename += '.csv'
        mimeType = 'text/csv'
        break
      case 'excel':
        // For excel, you would typically use a library like xlsx
        content = JSON.stringify(data, null, 2)
        filename += '.json'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>导出数据</DialogTitle>
      </DialogHeader>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4 pr-4">
            <p className="text-sm text-slate-600">
              选择导出格式：
            </p>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleExport()}
              >
                JSON 格式
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleExport()}
              >
                CSV 格式
              </Button>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">关闭</Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}

interface CreateActionContentProps {
  onClose?: () => void
  formSchema?: FormSchemaItem[]
  classNames?: Record<'form' | 'group' | 'field' | 'label' | 'input' | 'description' | 'error', string>
}

const CreateActionContent: React.FC<CreateActionContentProps> = ({ onClose, classNames, formSchema }) => {
  const { getItems, model } = useModelGetItems()
  const { saveItem } = useModelSave()
  const [saving, setSaving] = useState(false)

  const formId = `create-form-${model.key}`

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      await saveItem(values)
      await getItems() // 刷新列表数据
      onClose?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>新建 {model.title}</DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[70vh] pr-3">
        <SchemaForm formId={formId} schema={model} classNames={classNames} formSchema={formSchema || model.formSchema || model.form} onSubmit={handleSave} fieldRules={(model as any)?.fieldRules} />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">取消</Button>
        </DialogClose>
        <Button form={formId} type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          创建
        </Button>
      </DialogFooter>
    </>
  )
}

interface CopyActionContentProps {
  itemId: string
  onClose?: () => void
}

const CopyActionContent: React.FC<CopyActionContentProps> = ({ itemId, onClose }) => {
  const { data, loading } = useModelGet({ id: itemId })
  const { saveItem } = useModelSave()
  const [copying, setCopying] = useState(false)

  const handleCopy = async () => {
    setCopying(true)
    try {
      if (data) {
        const newItem = {
          ...data,
          name: data.name ? `${data.name} (副本)` : undefined
        }
        delete newItem.id // 删除 id 以创建新项
        await saveItem(newItem)
        onClose?.()
      }
    } finally {
      setCopying(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>复制数据</DialogTitle>
      </DialogHeader>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4 pr-4">
            <p className="text-sm text-slate-600">
              确定要复制这条数据吗？
            </p>
            {data && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium">原数据：</p>
                <pre className="text-xs mt-2 overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">取消</Button>
        </DialogClose>
        <Button onClick={handleCopy} disabled={copying}>
          {copying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          确认复制
        </Button>
      </DialogFooter>
    </>
  )
}

// ==================== Individual Action Components ====================

interface BaseActionProps {
  itemId: string
  children?: React.ReactNode
}

interface ViewActionProps extends BaseActionProps {
  formSchema?: FormSchemaItem[]
  permission?: string
}

export const ViewAction: React.FC<ViewActionProps> = ({ itemId, children, formSchema, permission }) => {
  const { model } = useModelGetItems()
  const layout = formLayoutToClassNames(model?.formLayout)
  const trigger = children || (
    <Button variant="ghost" size="sm">
      <Eye className="h-4 w-4" />
      查看
    </Button>
  )

  return (
    <HasPermission permission={permission}>
      <Dialog>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className={layout?.dialog ? layout.dialog : "max-w-4xl"}>
          <ViewDetail itemId={itemId} classNames={layout?.classNames} formSchema={formSchema} />
        </DialogContent>
      </Dialog>
    </HasPermission>
  )
}

interface EditActionProps extends BaseActionProps {
  formSchema?: FormSchemaItem[]
  permission?: string
}

export const EditAction: React.FC<EditActionProps> = ({ itemId, children, formSchema, permission }) => {
  const { model } = useModelGetItems()
  const layout = formLayoutToClassNames(model?.formLayout)
  const [open, setOpen] = useState(false)

  const trigger = children || (
    <Button variant="ghost" size="sm">
      <Edit className="h-4 w-4" />
      编辑
    </Button>
  )

  return (
    <HasPermission permission={permission}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className={layout?.dialog ? layout.dialog : "max-w-4xl"}>
          <EditActionContent itemId={itemId} onClose={() => setOpen(false)} classNames={layout?.classNames} formSchema={formSchema} />
        </DialogContent>
      </Dialog>
    </HasPermission>
  )
}

interface CreateActionProps {
  children?: React.ReactNode
  formSchema?: FormSchemaItem[]
  permission?: string
}

export const CreateAction: React.FC<CreateActionProps> = ({ children, formSchema, permission }) => {
  const { model } = useModelGetItems()
  const layout = formLayoutToClassNames(model?.formLayout)
  const [open, setOpen] = useState(false)

  const trigger = children || (
    <Button variant="ghost" size="sm">
      <Plus className="h-4 w-4" />
      新建
    </Button>
  )

  return (
    <HasPermission permission={permission}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className={layout?.dialog ? layout.dialog : "max-w-4xl"}>
          <CreateActionContent onClose={() => setOpen(false)} classNames={layout?.classNames} formSchema={formSchema} />
        </DialogContent>
      </Dialog>
    </HasPermission>
  )
}

interface DeleteActionProps extends BaseActionProps {
  confirmMessage?: string
  permission?: string
}

export const DeleteAction: React.FC<DeleteActionProps> = ({
  itemId,
  children,
  confirmMessage = '确定要删除这条数据吗？',
  permission
}) => {
  const { deleteItem } = useModelDelete()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteItem(itemId)
      setOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  const trigger = children || (
    <Button variant="ghost" size="sm">
      <Trash2 className="h-4 w-4 text-destructive" />
      删除
    </Button>
  )

  return (
    <HasPermission permission={permission}>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              确认删除
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              确认删除
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </HasPermission>
  )
}

interface ExportActionProps extends BaseActionProps {
  format?: 'json' | 'csv' | 'excel'
  permission?: string
}

export const ExportAction: React.FC<ExportActionProps> = ({
  itemId,
  children,
  format = 'json',
  permission
}) => {
  const trigger = children || (
    <Button variant="ghost" size="sm">
      <Download className="h-4 w-4" />
      导出
    </Button>
  )

  return (
    <HasPermission permission={permission}>
      <Dialog>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="md">
          <ExportActionContent itemId={itemId} format={format} />
        </DialogContent>
      </Dialog>
    </HasPermission>
  )
}

interface CopyActionProps extends BaseActionProps {
  permission?: string
}

export const CopyAction: React.FC<CopyActionProps> = ({ itemId, children, permission }) => {
  const [open, setOpen] = useState(false)

  const trigger = children || (
    <Button variant="ghost" size="sm">
      <Copy className="h-4 w-4" />
      复制
    </Button>
  )

  return (
    <HasPermission permission={permission}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="md">
          <CopyActionContent itemId={itemId} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </HasPermission>
  )
}

// ==================== Actions Container Component ====================

export type ActionType = 'create' | 'edit' | 'delete' | 'view' | 'export' | 'copy'

interface ActionsProps {
  itemId?: string
  item?: any & { id: string }
  modelId?: string
  actions: ActionType[]
  variant?: 'buttons' | 'dropdown'
  createFormSchema?: FormSchemaItem[]
  editFormSchema?: FormSchemaItem[]
  viewFormSchema?: FormSchemaItem[]
  permission?: { create: string; view: string; edit: string; delete: string; export: string; copy: string }
}

const Actions: React.FC<ActionsProps> = ({
  itemId,
  item,
  actions = ['view', 'edit'],
  variant = 'dropdown',
  createFormSchema,
  editFormSchema,
  viewFormSchema,
  permission
}) => {
  const id = itemId || item?.id
  const { model } = useModel()

  if (!id) return null

  const modelKey = model?.key
  const defaultPermissions = {
    create: `ext_${modelKey}.edit`,
    view: `ext_${modelKey}.view`,
    edit: `ext_${modelKey}.edit`,
    delete: `ext_${modelKey}.delete`,
    export: `ext_${modelKey}.view`,
    copy: `ext_${modelKey}.view`
  }
  const finalPermission = permission || defaultPermissions

  // Render as button group
  if (variant === 'buttons') {
    return (
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          action === 'create' ? (
            <CreateAction formSchema={createFormSchema} permission={finalPermission?.create} />
          ) : action === 'delete' ? (
            <DeleteAction itemId={id!} permission={finalPermission?.delete} />
          ) : action === 'view' ? (
            <ViewAction itemId={id!} formSchema={viewFormSchema} permission={finalPermission?.view} />
          ) : action === 'edit' ? (
            <EditAction itemId={id!} formSchema={editFormSchema} permission={finalPermission?.edit} />
          ) : action === 'export' ? (
            <ExportAction itemId={id!} permission={finalPermission?.export} />
          ) : action === 'copy' ? (
            <CopyAction itemId={id!} permission={finalPermission?.copy} />
          ) : null
        ))}
      </div>
    )
  }

  // Render as dropdown menu
  const actionLabels: Record<ActionType, string> = {
    create: '新建',
    view: '查看',
    edit: '编辑',
    delete: '删除',
    export: '导出',
    copy: '复制'
  }

  const actionIcons: Record<ActionType, React.ReactNode> = {
    create: <Plus className="h-4 w-4" />,
    view: <Eye className="h-4 w-4" />,
    edit: <Edit className="h-4 w-4" />,
    delete: <Trash2 className="h-4 w-4 text-destructive" />,
    export: <Download className="h-4 w-4" />,
    copy: <Copy className="h-4 w-4" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <span className="sr-only">打开菜单</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <React.Fragment key={action}>
            {action === 'create' ? (
              <CreateAction formSchema={createFormSchema} permission={permission?.create}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {actionIcons[action]}
                  {actionLabels[action]}
                </DropdownMenuItem>
              </CreateAction>
            ) : action === 'delete' ? (
              <DeleteAction itemId={id!} permission={permission?.delete}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                  }}
                >
                  {actionIcons[action]}
                  {actionLabels[action]}
                </DropdownMenuItem>
              </DeleteAction>
            ) : action === 'view' ? (
              <ViewAction itemId={id!} formSchema={viewFormSchema} permission={permission?.view}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {actionIcons[action]}
                  {actionLabels[action]}
                </DropdownMenuItem>
              </ViewAction>
            ) : action === 'edit' ? (
              <EditAction itemId={id!} formSchema={editFormSchema} permission={permission?.edit}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {actionIcons[action]}
                  {actionLabels[action]}
                </DropdownMenuItem>
              </EditAction>
            ) : action === 'export' ? (
              <ExportAction itemId={id!} permission={permission?.export}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {actionIcons[action]}
                  {actionLabels[action]}
                </DropdownMenuItem>
              </ExportAction>
            ) : action === 'copy' ? (
              <CopyAction itemId={id!} permission={permission?.copy}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {actionIcons[action]}
                  {actionLabels[action]}
                </DropdownMenuItem>
              </CopyAction>
            ) : null}
            {index < actions.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { Actions }
export default Actions
