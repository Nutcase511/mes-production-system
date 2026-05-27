import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import Actions, { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { useModel, useModelGetItems, useModelList } from '@airiot/client'
import { ViewFilter } from '@/components/kesi/view-filter/view-filter'

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

  return (
    <>
      {/* 过滤器卡片 */}
            {/* 过滤器 */}
      <ViewFilter
        filters={filterFields}
        classNames={{
          form: 'flex flex-row items-end gap-4 flex-wrap w-full',
          group: 'flex flex-row items-end gap-4 flex-1 min-w-0',
          field: 'w-auto',
          label: 'text-blue-200 whitespace-nowrap',
          input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 w-auto',
          description: '',
          error: ''
        }}
        actions={
          <CreateAction>
            <Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] px-4 py-1.5 h-9 text-sm">
              + 新建
            </Button>
          </CreateAction>
        }
      />

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
