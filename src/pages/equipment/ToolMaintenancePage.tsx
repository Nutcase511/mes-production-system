import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ViewModel from '@/components/kesi/view-model/view-model'
import { ViewDataTable, TableColumn } from '@/components/kesi/view-data-table/view-data-table'
import ViewPagination from '@/components/kesi/view-pagination/view-pagination'
import ViewFilter from '@/components/kesi/view-filter/view-filter'
import Actions, { CreateAction, ViewAction, EditAction, DeleteAction } from '@/components/kesi/view-actions/view-actions'
import { Eye, Edit, Trash2 } from 'lucide-react'

const tableId = '设备台账'

const PageContent: React.FC = () => {
  return (
    <>
      <Card className="backdrop-blur-xl bg-blue-500/10 border-2 rounded-xl overflow-hidden p-4 mb-4" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div className="flex flex-row items-end gap-2 w-full">
          <ViewFilter filters={[]} classNames={{
            form: 'flex flex-row items-end gap-2 flex-nowrap flex-1 min-w-0',
            group: 'flex flex-row items-end !gap-2 flex-nowrap flex-1 min-w-0',
            field: 'flex flex-row items-center gap-2 !w-auto',
            label: 'text-blue-200 whitespace-nowrap text-sm !w-20 !flex-none !justify-end',
            input: 'bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300/50 !w-48',
            description: '',
            error: ''
          }} />
          <div className="flex gap-2 items-center shrink-0">
            <CreateAction modelId={tableId}><Button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">+ 新建</Button></CreateAction>
          </div>
        </div>
      </Card>

      <ViewDataTable tableLayout={{ border: true, headerSticky: true, columnsResizable: true, stripped: true, dense: false }}>
        <TableColumn name="__actions__" title="操作" fixed="right" width={100}>{(props) => <div className="flex items-center gap-1">
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
          </div>}</TableColumn>
      </ViewDataTable>
      <div className="p-4"><ViewPagination showTotal={true} showSizeChanger={true} showQuickJumper={true} pageSizeOptions={[10, 20, 50, 100]} /></div>
    </>
  )
}

export function ToolMaintenancePage() {
  return <div className="space-y-0"><ViewModel tableId={tableId} initQuery={true}><PageContent /></ViewModel>
    </div>
  }
