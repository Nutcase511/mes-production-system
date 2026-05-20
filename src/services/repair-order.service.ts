/**
 * 返修单管理服务
 */
import type { RepairOrder } from '@/types/repair-order'
import type { PageParams, PageResponse } from '@/types/api'

// 返修类型选项
export const REPAIR_TYPES = [
  { value: '首检不合格返修', label: '首检不合格返修', color: '#f59e0b' },
  { value: '终检不合格返修', label: '终检不合格返修', color: '#ef4444' },
  { value: '外协返修', label: '外协返修', color: '#8b5cf6' },
]

// 缺陷等级选项
export const DEFECT_LEVELS = [
  { value: '轻微', label: '轻微', color: '#22c55e' },
  { value: '严重', label: '严重', color: '#ef4444' },
]

// 返修状态选项
export const REPAIR_STATUS = [
  { value: '待返修', label: '待返修', color: '#f59e0b' },
  { value: '返修中', label: '返修中', color: '#3b82f6' },
  { value: '已返修', label: '已返修', color: '#22c55e' },
  { value: '报废', label: '报废', color: '#ef4444' },
]

// 模拟返修单数据
const mockRepairOrders: RepairOrder[] = [
  { id: '1', repairNo: 'RO2026030101', originalTaskId: 'T001', originalBatchNo: 'B20260301-001', newBatchNo: 'B20260301-R01', repairType: '首检不合格返修', repairReason: '尺寸超差，外径偏大0.05mm', defectLevel: '严重', quantity: 12, repairRouteId: 'R001', status: '已返修', startDate: '2026-03-01', endDate: '2026-03-03', actualCost: 350, remark: '返工后全检合格', _createTime: '2026-03-01 09:00:00', createUser: '张伟', _updateTime: '2026-03-03 16:00:00' },
  { id: '2', repairNo: 'RO2026030102', originalTaskId: 'T005', originalBatchNo: 'B20260301-002', newBatchNo: 'B20260301-R02', repairType: '终检不合格返修', repairReason: '表面粗糙度不达标', defectLevel: '严重', quantity: 8, repairRouteId: 'R002', status: '返修中', startDate: '2026-03-01', endDate: '', actualCost: 0, remark: '重新磨削加工中', _createTime: '2026-03-01 10:30:00', createUser: '李明', _updateTime: '2026-03-02 08:00:00' },
  { id: '3', repairNo: 'RO2026030201', originalTaskId: 'T008', originalBatchNo: 'B20260302-001', newBatchNo: 'B20260302-R01', repairType: '外协返修', repairReason: '热处理硬度不足，需外协重新淬火', defectLevel: '严重', quantity: 20, repairRouteId: 'R003', status: '待返修', startDate: '', endDate: '', actualCost: 0, remark: '联系外协厂商中', _createTime: '2026-03-02 09:00:00', createUser: '王强', _updateTime: '2026-03-02 09:00:00' },
  { id: '4', repairNo: 'RO2026030202', originalTaskId: 'T010', originalBatchNo: 'B20260302-002', newBatchNo: 'B20260302-R02', repairType: '首检不合格返修', repairReason: '孔位偏移0.02mm', defectLevel: '轻微', quantity: 5, repairRouteId: 'R001', status: '已返修', startDate: '2026-03-02', endDate: '2026-03-02', actualCost: 120, remark: '校正后合格', _createTime: '2026-03-02 11:00:00', createUser: '赵磊', _updateTime: '2026-03-02 17:00:00' },
  { id: '5', repairNo: 'RO2026030301', originalTaskId: 'T012', originalBatchNo: 'B20260303-001', newBatchNo: 'B20260303-R01', repairType: '终检不合格返修', repairReason: '螺纹通规不过', defectLevel: '严重', quantity: 15, repairRouteId: 'R004', status: '报废', startDate: '2026-03-03', endDate: '2026-03-05', actualCost: 500, remark: '多次返修仍不合格，报废处理', _createTime: '2026-03-03 08:00:00', createUser: '陈刚', _updateTime: '2026-03-05 14:00:00' },
  { id: '6', repairNo: 'RO2026030302', originalTaskId: 'T015', originalBatchNo: 'B20260303-002', newBatchNo: 'B20260303-R02', repairType: '首检不合格返修', repairReason: '端面跳动超差', defectLevel: '轻微', quantity: 6, repairRouteId: 'R002', status: '已返修', startDate: '2026-03-03', endDate: '2026-03-04', actualCost: 180, remark: '重新装夹加工', _createTime: '2026-03-03 10:00:00', createUser: '张伟', _updateTime: '2026-03-04 15:00:00' },
  { id: '7', repairNo: 'RO2026030401', originalTaskId: 'T018', originalBatchNo: 'B20260304-001', newBatchNo: 'B20260304-R01', repairType: '外协返修', repairReason: '电镀层脱落', defectLevel: '严重', quantity: 30, repairRouteId: 'R005', status: '待返修', startDate: '', endDate: '', actualCost: 0, remark: '等待外协厂商报价', _createTime: '2026-03-04 09:00:00', createUser: '李明', _updateTime: '2026-03-04 09:00:00' },
  { id: '8', repairNo: 'RO2026030402', originalTaskId: 'T020', originalBatchNo: 'B20260304-002', newBatchNo: 'B20260304-R02', repairType: '终检不合格返修', repairReason: '内孔圆度超差', defectLevel: '轻微', quantity: 4, repairRouteId: 'R002', status: '返修中', startDate: '2026-03-04', endDate: '', actualCost: 0, remark: '珩磨加工中', _createTime: '2026-03-04 13:00:00', createUser: '王强', _updateTime: '2026-03-05 08:00:00' },
  { id: '9', repairNo: 'RO2026030501', originalTaskId: 'T022', originalBatchNo: 'B20260305-001', newBatchNo: 'B20260305-R01', repairType: '首检不合格返修', repairReason: '键槽宽度偏小', defectLevel: '轻微', quantity: 3, repairRouteId: 'R004', status: '已返修', startDate: '2026-03-05', endDate: '2026-03-05', actualCost: 80, remark: '', _createTime: '2026-03-05 08:30:00', createUser: '赵磊', _updateTime: '2026-03-05 16:00:00' },
  { id: '10', repairNo: 'RO2026030502', originalTaskId: 'T025', originalBatchNo: 'B20260305-002', newBatchNo: 'B20260305-R02', repairType: '终检不合格返修', repairReason: '平面度0.05mm超差', defectLevel: '严重', quantity: 10, repairRouteId: 'R002', status: '返修中', startDate: '2026-03-05', endDate: '', actualCost: 0, remark: '重新铣削', _createTime: '2026-03-05 10:00:00', createUser: '陈刚', _updateTime: '2026-03-06 08:00:00' },
  { id: '11', repairNo: 'RO2026030601', originalTaskId: 'T028', originalBatchNo: 'B20260306-001', newBatchNo: 'B20260306-R01', repairType: '外协返修', repairReason: '焊接气孔缺陷', defectLevel: '严重', quantity: 7, repairRouteId: 'R005', status: '待返修', startDate: '', endDate: '', actualCost: 0, remark: '返修方案评审中', _createTime: '2026-03-06 09:00:00', createUser: '张伟', _updateTime: '2026-03-06 09:00:00' },
  { id: '12', repairNo: 'RO2026030602', originalTaskId: 'T030', originalBatchNo: 'B20260306-002', newBatchNo: 'B20260306-R02', repairType: '首检不合格返修', repairReason: '外圆尺寸偏小0.03mm', defectLevel: '轻微', quantity: 8, repairRouteId: 'R001', status: '已返修', startDate: '2026-03-06', endDate: '2026-03-07', actualCost: 200, remark: '补焊后车削', _createTime: '2026-03-06 11:00:00', createUser: '李明', _updateTime: '2026-03-07 14:00:00' },
  { id: '13', repairNo: 'RO2026030701', originalTaskId: 'T032', originalBatchNo: 'B20260307-001', newBatchNo: 'B20260307-R01', repairType: '终检不合格返修', repairReason: '同轴度超差0.02mm', defectLevel: '严重', quantity: 6, repairRouteId: 'R002', status: '报废', startDate: '2026-03-07', endDate: '2026-03-09', actualCost: 400, remark: '无法修复，报废处理', _createTime: '2026-03-07 08:00:00', createUser: '王强', _updateTime: '2026-03-09 10:00:00' },
  { id: '14', repairNo: 'RO2026030702', originalTaskId: 'T035', originalBatchNo: 'B20260307-002', newBatchNo: 'B20260307-R02', repairType: '首检不合格返修', repairReason: '倒角不均匀', defectLevel: '轻微', quantity: 25, repairRouteId: 'R004', status: '已返修', startDate: '2026-03-07', endDate: '2026-03-07', actualCost: 100, remark: '手工去毛刺', _createTime: '2026-03-07 13:30:00', createUser: '赵磊', _updateTime: '2026-03-07 17:00:00' },
  { id: '15', repairNo: 'RO2026030801', originalTaskId: 'T037', originalBatchNo: 'B20260308-001', newBatchNo: 'B20260308-R01', repairType: '外协返修', repairReason: '喷涂颜色色差', defectLevel: '轻微', quantity: 50, repairRouteId: 'R005', status: '返修中', startDate: '2026-03-08', endDate: '', actualCost: 0, remark: '已送外协厂重新喷涂', _createTime: '2026-03-08 09:00:00', createUser: '陈刚', _updateTime: '2026-03-09 08:00:00' },
  { id: '16', repairNo: 'RO2026030802', originalTaskId: 'T040', originalBatchNo: 'B20260308-002', newBatchNo: 'B20260308-R02', repairType: '终检不合格返修', repairReason: '硬度不达标HRC45', defectLevel: '严重', quantity: 18, repairRouteId: 'R003', status: '待返修', startDate: '', endDate: '', actualCost: 0, remark: '需重新热处理', _createTime: '2026-03-08 11:00:00', createUser: '张伟', _updateTime: '2026-03-08 11:00:00' },
  { id: '17', repairNo: 'RO2026030901', originalTaskId: 'T042', originalBatchNo: 'B20260309-001', newBatchNo: 'B20260309-R01', repairType: '首检不合格返修', repairReason: '中心孔偏斜', defectLevel: '严重', quantity: 4, repairRouteId: 'R001', status: '已返修', startDate: '2026-03-09', endDate: '2026-03-10', actualCost: 150, remark: '重打中心孔', _createTime: '2026-03-09 08:30:00', createUser: '李明', _updateTime: '2026-03-10 11:00:00' },
  { id: '18', repairNo: 'RO2026030902', originalTaskId: 'T044', originalBatchNo: 'B20260309-002', newBatchNo: 'B20260309-R02', repairType: '终检不合格返修', repairReason: '齿面有磕碰伤', defectLevel: '轻微', quantity: 2, repairRouteId: 'R002', status: '已返修', startDate: '2026-03-09', endDate: '2026-03-09', actualCost: 60, remark: '抛光修复', _createTime: '2026-03-09 14:00:00', createUser: '王强', _updateTime: '2026-03-09 17:00:00' },
  { id: '19', repairNo: 'RO2026031001', originalTaskId: 'T046', originalBatchNo: 'B20260310-001', newBatchNo: 'B20260310-R01', repairType: '外协返修', repairReason: '激光刻字不清', defectLevel: '轻微', quantity: 100, repairRouteId: 'R005', status: '待返修', startDate: '', endDate: '', actualCost: 0, remark: '', _createTime: '2026-03-10 09:00:00', createUser: '赵磊', _updateTime: '2026-03-10 09:00:00' },
  { id: '20', repairNo: 'RO2026031002', originalTaskId: 'T048', originalBatchNo: 'B20260310-002', newBatchNo: 'B20260310-R02', repairType: '首检不合格返修', repairReason: '锥度角度偏差', defectLevel: '严重', quantity: 9, repairRouteId: 'R001', status: '返修中', startDate: '2026-03-10', endDate: '', actualCost: 0, remark: '调整刀具角度重车', _createTime: '2026-03-10 10:30:00', createUser: '陈刚', _updateTime: '2026-03-11 08:00:00' },
  { id: '21', repairNo: 'RO2026031101', originalTaskId: 'T050', originalBatchNo: 'B20260311-001', newBatchNo: 'B20260311-R01', repairType: '终检不合格返修', repairReason: '密封面漏气', defectLevel: '严重', quantity: 5, repairRouteId: 'R002', status: '已返修', startDate: '2026-03-11', endDate: '2026-03-12', actualCost: 280, remark: '重新研磨密封面', _createTime: '2026-03-11 08:00:00', createUser: '张伟', _updateTime: '2026-03-12 15:00:00' },
  { id: '22', repairNo: 'RO2026031102', originalTaskId: 'T053', originalBatchNo: 'B20260311-002', newBatchNo: 'B20260311-R02', repairType: '首检不合格返修', repairReason: '毛刺未清理干净', defectLevel: '轻微', quantity: 35, repairRouteId: 'R004', status: '已返修', startDate: '2026-03-11', endDate: '2026-03-11', actualCost: 50, remark: '增加去毛刺工序', _createTime: '2026-03-11 13:00:00', createUser: '李明', _updateTime: '2026-03-11 17:00:00' },
  { id: '23', repairNo: 'RO2026031201', originalTaskId: 'T055', originalBatchNo: 'B20260312-001', newBatchNo: 'B20260312-R01', repairType: '外协返修', repairReason: '氧化膜色差严重', defectLevel: '严重', quantity: 40, repairRouteId: 'R005', status: '待返修', startDate: '', endDate: '', actualCost: 0, remark: '等待外协厂商确认', _createTime: '2026-03-12 09:00:00', createUser: '王强', _updateTime: '2026-03-12 09:00:00' },
  { id: '24', repairNo: 'RO2026031202', originalTaskId: 'T057', originalBatchNo: 'B20260312-002', newBatchNo: 'B20260312-R02', repairType: '终检不合格返修', repairReason: '装配干涉', defectLevel: '严重', quantity: 3, repairRouteId: 'R001', status: '返修中', startDate: '2026-03-12', endDate: '', actualCost: 0, remark: '配合面修配中', _createTime: '2026-03-12 14:00:00', createUser: '赵磊', _updateTime: '2026-03-13 08:00:00' },
  { id: '25', repairNo: 'RO2026031301', originalTaskId: 'T059', originalBatchNo: 'B20260313-001', newBatchNo: 'B20260313-R01', repairType: '首检不合格返修', repairReason: '螺纹烂牙', defectLevel: '严重', quantity: 2, repairRouteId: 'R004', status: '报废', startDate: '2026-03-13', endDate: '2026-03-14', actualCost: 150, remark: '无法修复报废', _createTime: '2026-03-13 08:30:00', createUser: '陈刚', _updateTime: '2026-03-14 10:00:00' },
]

/**
 * 获取返修单列表
 */
export async function getRepairOrderList(params: PageParams & {
  status?: string
  repairType?: string
  search?: string
}): Promise<PageResponse<RepairOrder>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = [...mockRepairOrders]

      // 状态筛选
      if (params.status && params.status !== 'all') {
        data = data.filter(item => item.status === params.status)
      }

      // 返修类型筛选
      if (params.repairType && params.repairType !== 'all') {
        data = data.filter(item => item.repairType === params.repairType)
      }

      // 搜索筛选
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        data = data.filter(item =>
          item.repairNo.toLowerCase().includes(searchLower) ||
          item.originalBatchNo.toLowerCase().includes(searchLower) ||
          item.newBatchNo.toLowerCase().includes(searchLower) ||
          item.repairReason.toLowerCase().includes(searchLower)
        )
      }

      const total = data.length
      const startIndex = (params.page - 1) * params.size
      const endIndex = startIndex + params.size
      const list = data.slice(startIndex, endIndex)

      resolve({
        list,
        total,
        page: params.page,
        size: params.size,
        totalPages: Math.ceil(total / params.size),
      })
    }, 300)
  })
}

/**
 * 创建返修单
 */
export async function createRepairOrder(data: Partial<RepairOrder>): Promise<RepairOrder> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString()
      const dateStr = now.split('T')[0].replace(/-/g, '')
      const newOrder: RepairOrder = {
        id: String(mockRepairOrders.length + 1),
        repairNo: 'RO' + Date.now(),
        originalTaskId: data.originalTaskId || '',
        originalBatchNo: data.originalBatchNo || '',
        newBatchNo: data.newBatchNo || `B${dateStr}-R${String(mockRepairOrders.length + 1).padStart(2, '0')}`,
        repairType: data.repairType || '首检不合格返修',
        repairReason: data.repairReason || '',
        defectLevel: data.defectLevel || '轻微',
        quantity: data.quantity || 0,
        repairRouteId: data.repairRouteId || '',
        status: '待返修',
        startDate: '',
        endDate: '',
        actualCost: 0,
        remark: data.remark || '',
        _createTime: now,
        createUser: data.createUser || '',
        _updateTime: now,
      }
      mockRepairOrders.unshift(newOrder)
      resolve(newOrder)
    }, 300)
  })
}

/**
 * 更新返修单
 */
export async function updateRepairOrder(id: string, data: Partial<RepairOrder>): Promise<RepairOrder> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockRepairOrders.findIndex(item => item.id === id)
      if (index === -1) {
        reject(new Error('返修单不存在'))
        return
      }
      const updated = { ...mockRepairOrders[index], ...data, _updateTime: new Date().toISOString() }
      mockRepairOrders[index] = updated
      resolve(updated)
    }, 300)
  })
}

/**
 * 删除返修单
 */
export async function deleteRepairOrder(id: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockRepairOrders.findIndex(item => item.id === id)
      if (index === -1) {
        reject(new Error('返修单不存在'))
        return
      }
      mockRepairOrders.splice(index, 1)
      resolve(true)
    }, 300)
  })
}
