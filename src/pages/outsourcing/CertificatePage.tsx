import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import Actions, { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { useModel, useModelState, useModelGetItems, useModelList } from '@airiot/client'
import FilterSchemaForm from '@/components/kesi/filter-form/filter-form'

const tableId = '外协单'

const filterFields = [
  {
    key: 'certificate-no',
    name: 'certificate-no',
    title: '合格证编号',
    fieldType: 'filter_string',
    orientation: 'horizontal' as const,
  },
  {
    key: 'outsourcing-order',
    name: 'outsourcing-order',
    title: '外协单号',
    fieldType: 'filter_string',
    orientation: 'horizontal' as const,
  },
  {
    key: 'supplier',
    name: 'supplier',
    title: '供应商',
    fieldType: 'filter_string',
    orientation: 'horizontal' as const,
  },
  {
    key: 'status',
    name: 'status',
    title: '状态',
    fieldType: 'filter_enum',
    orientation: 'horizontal' as const,
  },
]

const CertificateContent: React.FC = () => {
  const { model } = useModel()
  const { items, loading } = useModelList()
  const { getItems } = useModelGetItems()
  const [wheres, setWheres] = useModelState('wheres')

  const onSubmit = (value: any) => {
    const newWheres = { ...(wheres || {}), filter: { ...(wheres?.filter || {}), ...value } }
    setWheres(newWheres)
    getItems()
  }

  const onReset = (reset: () => void) => {
    reset()
    setWheres({ ...(wheres || {}), filter: {} })
    getItems()
  }

  return (
    <>
      {/* 过滤器卡片 */}
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)'
      }}>
        <FilterSchemaForm
          formId="certificate-filter"
          schema={{ ...model, properties: model?.properties || {} }}
          formSchema={filterFields}
          onSubmit={onSubmit}
          classNames={{
            form: 'flex flex-row items-end gap-4 w-full',
            group: '!flex !flex-row !items-end !gap-4',
            field: '!flex !flex-row !items-center !gap-2 !w-auto',
            label: 'text-blue-200 whitespace-nowrap !w-[90px] !flex-none text-sm',
            input: '!w-auto !min-w-[240px]',
            description: '',
            error: '',
            orientation: 'horizontal',
          }}
        >
          {(methods) => (
            <div className="flex items-center gap-2">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 h-9 text-sm">
                搜索
              </Button>
              <Button type="button" variant="outline" className="text-cyan-300 border-cyan-500/60 hover:bg-cyan-500/20 px-4 py-1.5 h-9 text-sm" onClick={() => onReset(methods.reset)}>
                重置
              </Button>
              <CreateAction modelId={tableId}>
                <Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] px-4 py-1.5 h-9 text-sm">
                  + 新建合格证
                </Button>
              </CreateAction>
            </div>
          )}
        </FilterSchemaForm>
      </Card>

      {/* 数据表格 */}
      <ViewDataTable
        tableLayout={{
          border: true,
          headerSticky: true,
          columnsResizable: true,
          stripped: true,
          dense: false,
        }}
      >
        <TableColumn name="certificate-no" title="合格证编号" width={150} />
        <TableColumn name="outsourcing-order" title="外协单号" width={150} />
        <TableColumn name="supplier" title="供应商" width={150} />
        <TableColumn name="product-name" title="产品名称" width={150} />
        <TableColumn name="product-code" title="产品代号" width={120} />
        <TableColumn name="quantity" title="数量" width={100} />
        <TableColumn name="batch-no" title="批次号" width={150} />
        <TableColumn name="inspection-date" title="检验日期" width={120} />
        <TableColumn name="inspector" title="检验员" width={100} />
        <TableColumn name="status" title="状态" width={100}>
          {(props) => {
            const value = props.value
            const colorMap: Record<string, string> = {
              '待检验': 'bg-yellow-500/20 text-yellow-400',
              '合格': 'bg-green-500/20 text-green-400',
              '不合格': 'bg-red-500/20 text-red-400',
              '已入库': 'bg-blue-500/20 text-blue-400',
            }
            return (
              <Badge className={colorMap[value] || 'bg-gray-500/20 text-gray-400'}>
                {value || '-'}
              </Badge>
            )
          }}
        </TableColumn>
        <TableColumn name="remark" title="备注" width={200} />
        <TableColumn name="__actions__" title="操作" fixed="right" width={100}>
          {(props) => (
            <div className="flex items-center gap-1">
            <ViewAction itemId={props.item.id}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </ViewAction>
            <EditAction itemId={props.item.id}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </EditAction>
            <DeleteAction itemId={props.item.id}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DeleteAction>
          </div>
          )}
        </TableColumn>
      </ViewDataTable>

      <div className="p-4">
        <ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50, 100]} />
      </div>
    </>
  )
}

export function CertificatePage() {
  const tableFilters = {
    "select-0362": "1"
  }

  return (
    <div className="space-y-0">
      <ViewModel tableId={tableId} initQuery={true} tableFilters={tableFilters}>
        <CertificateContent />
      </ViewModel>
    </div>
  )
}

export default CertificatePage
