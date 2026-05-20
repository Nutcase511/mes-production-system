/**
 * 报工单管理服务
 */
import type { WorkReport } from '@/types/work-report'
import type { PageParams, PageResponse } from '@/types/api'

// 报工单状态选项
export const WORK_REPORT_STATUS = [
  { value: '待检验', label: '待检验', color: '#f59e0b' },
  { value: '已检验', label: '已检验', color: '#3b82f6' },
  { value: '合格', label: '合格', color: '#22c55e' },
  { value: '不合格', label: '不合格', color: '#ef4444' },
]

// 模拟报工单数据
const mockWorkReports: WorkReport[] = [
  { id: '1', reportNo: 'WR2026031001', taskId: 'T001', taskNo: 'WO-20260301-001', assignmentId: 'A001', stepNo: 'OP10', stepName: '车削', equipmentId: 'EQ001', equipmentName: 'CNC车床-001', operator: '张伟', reportDate: '2026-03-10 08:30', qualifiedQuantity: 48, overproofQuantity: 1, scrapQuantity: 1, workTime: 4.5, status: '合格', isAuto: false, abnormalInfo: '', remark: '正常加工', _createTime: '2026-03-10 08:30:00', createUser: '张伟', _updateTime: '2026-03-10 08:30:00' },
  { id: '2', reportNo: 'WR2026031002', taskId: 'T002', taskNo: 'WO-20260301-002', assignmentId: 'A002', stepNo: 'OP20', stepName: '铣削', equipmentId: 'EQ002', equipmentName: '数控铣床-003', operator: '李明', reportDate: '2026-03-10 09:00', qualifiedQuantity: 30, overproofQuantity: 0, scrapQuantity: 2, workTime: 3.0, status: '合格', isAuto: false, abnormalInfo: '', remark: '', _createTime: '2026-03-10 09:00:00', createUser: '李明', _updateTime: '2026-03-10 09:00:00' },
  { id: '3', reportNo: 'WR2026031003', taskId: 'T003', taskNo: 'WO-20260301-003', assignmentId: 'A003', stepNo: 'OP30', stepName: '磨削', equipmentId: 'EQ003', equipmentName: '外圆磨床-002', operator: '王强', reportDate: '2026-03-10 10:15', qualifiedQuantity: 20, overproofQuantity: 3, scrapQuantity: 0, workTime: 5.0, status: '待检验', isAuto: true, abnormalInfo: '', remark: '自动报工', _createTime: '2026-03-10 10:15:00', createUser: '系统', _updateTime: '2026-03-10 10:15:00' },
  { id: '4', reportNo: 'WR2026031004', taskId: 'T004', taskNo: 'WO-20260302-001', assignmentId: 'A004', stepNo: 'OP10', stepName: '车削', equipmentId: 'EQ001', equipmentName: 'CNC车床-001', operator: '赵磊', reportDate: '2026-03-10 13:00', qualifiedQuantity: 50, overproofQuantity: 0, scrapQuantity: 0, workTime: 6.0, status: '已检验', isAuto: false, abnormalInfo: '', remark: '精度达标', _createTime: '2026-03-10 13:00:00', createUser: '赵磊', _updateTime: '2026-03-10 14:00:00' },
  { id: '5', reportNo: 'WR2026031005', taskId: 'T005', taskNo: 'WO-20260302-002', assignmentId: 'A005', stepNo: 'OP40', stepName: '钻孔', equipmentId: 'EQ004', equipmentName: '立式钻床-001', operator: '陈刚', reportDate: '2026-03-10 14:30', qualifiedQuantity: 45, overproofQuantity: 2, scrapQuantity: 3, workTime: 3.5, status: '不合格', isAuto: false, abnormalInfo: '孔径偏大，需返修', remark: '刀具磨损', _createTime: '2026-03-10 14:30:00', createUser: '陈刚', _updateTime: '2026-03-10 14:30:00' },
  { id: '6', reportNo: 'WR2026031101', taskId: 'T006', taskNo: 'WO-20260301-001', assignmentId: 'A006', stepNo: 'OP20', stepName: '铣削', equipmentId: 'EQ002', equipmentName: '数控铣床-003', operator: '张伟', reportDate: '2026-03-11 08:00', qualifiedQuantity: 47, overproofQuantity: 1, scrapQuantity: 2, workTime: 4.0, status: '合格', isAuto: false, abnormalInfo: '', remark: '', _createTime: '2026-03-11 08:00:00', createUser: '张伟', _updateTime: '2026-03-11 08:00:00' },
  { id: '7', reportNo: 'WR2026031102', taskId: 'T007', taskNo: 'WO-20260302-003', assignmentId: 'A007', stepNo: 'OP50', stepName: '热处理', equipmentId: 'EQ005', equipmentName: '箱式炉-001', operator: '李明', reportDate: '2026-03-11 09:30', qualifiedQuantity: 60, overproofQuantity: 0, scrapQuantity: 0, workTime: 8.0, status: '已检验', isAuto: true, abnormalInfo: '', remark: '淬火+回火', _createTime: '2026-03-11 09:30:00', createUser: '系统', _updateTime: '2026-03-11 09:30:00' },
  { id: '8', reportNo: 'WR2026031103', taskId: 'T008', taskNo: 'WO-20260303-001', assignmentId: 'A008', stepNo: 'OP30', stepName: '磨削', equipmentId: 'EQ003', equipmentName: '外圆磨床-002', operator: '王强', reportDate: '2026-03-11 10:00', qualifiedQuantity: 25, overproofQuantity: 2, scrapQuantity: 1, workTime: 4.5, status: '待检验', isAuto: false, abnormalInfo: '', remark: '', _createTime: '2026-03-11 10:00:00', createUser: '王强', _updateTime: '2026-03-11 10:00:00' },
  { id: '9', reportNo: 'WR2026031104', taskId: 'T009', taskNo: 'WO-20260303-002', assignmentId: 'A009', stepNo: 'OP10', stepName: '车削', equipmentId: 'EQ001', equipmentName: 'CNC车床-001', operator: '赵磊', reportDate: '2026-03-11 13:30', qualifiedQuantity: 35, overproofQuantity: 0, scrapQuantity: 1, workTime: 3.0, status: '合格', isAuto: false, abnormalInfo: '', remark: '螺纹加工', _createTime: '2026-03-11 13:30:00', createUser: '赵磊', _updateTime: '2026-03-11 13:30:00' },
  { id: '10', reportNo: 'WR2026031105', taskId: 'T010', taskNo: 'WO-20260303-003', assignmentId: 'A010', stepNo: 'OP60', stepName: '检验', equipmentId: 'EQ006', equipmentName: '三坐标测量仪-001', operator: '陈刚', reportDate: '2026-03-11 15:00', qualifiedQuantity: 100, overproofQuantity: 5, scrapQuantity: 3, workTime: 2.0, status: '合格', isAuto: true, abnormalInfo: '', remark: '全检', _createTime: '2026-03-11 15:00:00', createUser: '系统', _updateTime: '2026-03-11 15:00:00' },
  { id: '11', reportNo: 'WR2026031201', taskId: 'T011', taskNo: 'WO-20260304-001', assignmentId: 'A011', stepNo: 'OP10', stepName: '车削', equipmentId: 'EQ001', equipmentName: 'CNC车床-001', operator: '张伟', reportDate: '2026-03-12 08:00', qualifiedQuantity: 40, overproofQuantity: 2, scrapQuantity: 0, workTime: 4.0, status: '合格', isAuto: false, abnormalInfo: '', remark: '轴类加工', _createTime: '2026-03-12 08:00:00', createUser: '张伟', _updateTime: '2026-03-12 08:00:00' },
  { id: '12', reportNo: 'WR2026031202', taskId: 'T012', taskNo: 'WO-20260304-002', assignmentId: 'A012', stepNo: 'OP40', stepName: '钻孔', equipmentId: 'EQ004', equipmentName: '立式钻床-001', operator: '李明', reportDate: '2026-03-12 09:00', qualifiedQuantity: 28, overproofQuantity: 1, scrapQuantity: 1, workTime: 2.5, status: '待检验', isAuto: false, abnormalInfo: '', remark: '', _createTime: '2026-03-12 09:00:00', createUser: '李明', _updateTime: '2026-03-12 09:00:00' },
  { id: '13', reportNo: 'WR2026031203', taskId: 'T013', taskNo: 'WO-20260304-003', assignmentId: 'A013', stepNo: 'OP20', stepName: '铣削', equipmentId: 'EQ002', equipmentName: '数控铣床-003', operator: '王强', reportDate: '2026-03-12 10:30', qualifiedQuantity: 55, overproofQuantity: 0, scrapQuantity: 5, workTime: 5.5, status: '不合格', isAuto: false, abnormalInfo: '表面粗糙度不合格', remark: '需更换铣刀', _createTime: '2026-03-12 10:30:00', createUser: '王强', _updateTime: '2026-03-12 10:30:00' },
  { id: '14', reportNo: 'WR2026031204', taskId: 'T014', taskNo: 'WO-20260305-001', assignmentId: 'A014', stepNo: 'OP50', stepName: '热处理', equipmentId: 'EQ005', equipmentName: '箱式炉-001', operator: '赵磊', reportDate: '2026-03-12 13:00', qualifiedQuantity: 80, overproofQuantity: 0, scrapQuantity: 2, workTime: 7.5, status: '已检验', isAuto: true, abnormalInfo: '', remark: '渗碳处理', _createTime: '2026-03-12 13:00:00', createUser: '系统', _updateTime: '2026-03-12 13:00:00' },
  { id: '15', reportNo: 'WR2026031205', taskId: 'T015', taskNo: 'WO-20260305-002', assignmentId: 'A015', stepNo: 'OP30', stepName: '磨削', equipmentId: 'EQ003', equipmentName: '外圆磨床-002', operator: '陈刚', reportDate: '2026-03-12 14:30', qualifiedQuantity: 32, overproofQuantity: 1, scrapQuantity: 0, workTime: 3.0, status: '合格', isAuto: false, abnormalInfo: '', remark: '精磨', _createTime: '2026-03-12 14:30:00', createUser: '陈刚', _updateTime: '2026-03-12 14:30:00' },
  { id: '16', reportNo: 'WR2026031301', taskId: 'T016', taskNo: 'WO-20260305-003', assignmentId: 'A016', stepNo: 'OP10', stepName: '车削', equipmentId: 'EQ001', equipmentName: 'CNC车床-001', operator: '张伟', reportDate: '2026-03-13 08:00', qualifiedQuantity: 42, overproofQuantity: 0, scrapQuantity: 0, workTime: 3.5, status: '合格', isAuto: false, abnormalInfo: '', remark: '', _createTime: '2026-03-13 08:00:00', createUser: '张伟', _updateTime: '2026-03-13 08:00:00' },
  { id: '17', reportNo: 'WR2026031302', taskId: 'T017', taskNo: 'WO-20260306-001', assignmentId: 'A017', stepNo: 'OP60', stepName: '检验', equipmentId: 'EQ006', equipmentName: '三坐标测量仪-001', operator: '李明', reportDate: '2026-03-13 09:30', qualifiedQuantity: 70, overproofQuantity: 3, scrapQuantity: 1, workTime: 1.5, status: '合格', isAuto: true, abnormalInfo: '', remark: '抽检', _createTime: '2026-03-13 09:30:00', createUser: '系统', _updateTime: '2026-03-13 09:30:00' },
  { id: '18', reportNo: 'WR2026031303', taskId: 'T018', taskNo: 'WO-20260306-002', assignmentId: 'A018', stepNo: 'OP20', stepName: '铣削', equipmentId: 'EQ002', equipmentName: '数控铣床-003', operator: '王强', reportDate: '2026-03-13 11:00', qualifiedQuantity: 38, overproofQuantity: 2, scrapQuantity: 0, workTime: 4.0, status: '待检验', isAuto: false, abnormalInfo: '', remark: '键槽加工', _createTime: '2026-03-13 11:00:00', createUser: '王强', _updateTime: '2026-03-13 11:00:00' },
  { id: '19', reportNo: 'WR2026031304', taskId: 'T019', taskNo: 'WO-20260306-003', assignmentId: 'A019', stepNo: 'OP40', stepName: '钻孔', equipmentId: 'EQ004', equipmentName: '立式钻床-001', operator: '赵磊', reportDate: '2026-03-13 13:30', qualifiedQuantity: 22, overproofQuantity: 1, scrapQuantity: 2, workTime: 2.0, status: '已检验', isAuto: false, abnormalInfo: '', remark: '', _createTime: '2026-03-13 13:30:00', createUser: '赵磊', _updateTime: '2026-03-13 14:30:00' },
  { id: '20', reportNo: 'WR2026031305', taskId: 'T020', taskNo: 'WO-20260307-001', assignmentId: 'A020', stepNo: 'OP50', stepName: '热处理', equipmentId: 'EQ005', equipmentName: '箱式炉-001', operator: '陈刚', reportDate: '2026-03-13 15:00', qualifiedQuantity: 90, overproofQuantity: 0, scrapQuantity: 0, workTime: 8.0, status: '合格', isAuto: true, abnormalInfo: '', remark: '退火处理', _createTime: '2026-03-13 15:00:00', createUser: '系统', _updateTime: '2026-03-13 15:00:00' },
  { id: '21', reportNo: 'WR2026031401', taskId: 'T021', taskNo: 'WO-20260307-002', assignmentId: 'A021', stepNo: 'OP10', stepName: '车削', equipmentId: 'EQ001', equipmentName: 'CNC车床-001', operator: '张伟', reportDate: '2026-03-14 08:00', qualifiedQuantity: 33, overproofQuantity: 1, scrapQuantity: 1, workTime: 3.0, status: '合格', isAuto: false, abnormalInfo: '', remark: '', _createTime: '2026-03-14 08:00:00', createUser: '张伟', _updateTime: '2026-03-14 08:00:00' },
  { id: '22', reportNo: 'WR2026031402', taskId: 'T022', taskNo: 'WO-20260307-003', assignmentId: 'A022', stepNo: 'OP30', stepName: '磨削', equipmentId: 'EQ003', equipmentName: '外圆磨床-002', operator: '李明', reportDate: '2026-03-14 09:30', qualifiedQuantity: 18, overproofQuantity: 0, scrapQuantity: 0, workTime: 2.5, status: '待检验', isAuto: false, abnormalInfo: '', remark: '内孔磨削', _createTime: '2026-03-14 09:30:00', createUser: '李明', _updateTime: '2026-03-14 09:30:00' },
  { id: '23', reportNo: 'WR2026031403', taskId: 'T023', taskNo: 'WO-20260308-001', assignmentId: 'A023', stepNo: 'OP20', stepName: '铣削', equipmentId: 'EQ002', equipmentName: '数控铣床-003', operator: '王强', reportDate: '2026-03-14 11:00', qualifiedQuantity: 44, overproofQuantity: 3, scrapQuantity: 1, workTime: 4.5, status: '不合格', isAuto: false, abnormalInfo: '平面度超差', remark: '重新装夹', _createTime: '2026-03-14 11:00:00', createUser: '王强', _updateTime: '2026-03-14 11:00:00' },
  { id: '24', reportNo: 'WR2026031404', taskId: 'T024', taskNo: 'WO-20260308-002', assignmentId: 'A024', stepNo: 'OP40', stepName: '钻孔', equipmentId: 'EQ004', equipmentName: '立式钻床-001', operator: '赵磊', reportDate: '2026-03-14 13:30', qualifiedQuantity: 50, overproofQuantity: 0, scrapQuantity: 0, workTime: 3.0, status: '合格', isAuto: false, abnormalInfo: '', remark: '深孔钻', _createTime: '2026-03-14 13:30:00', createUser: '赵磊', _updateTime: '2026-03-14 13:30:00' },
  { id: '25', reportNo: 'WR2026031405', taskId: 'T025', taskNo: 'WO-20260308-003', assignmentId: 'A025', stepNo: 'OP60', stepName: '检验', equipmentId: 'EQ006', equipmentName: '三坐标测量仪-001', operator: '陈刚', reportDate: '2026-03-14 15:00', qualifiedQuantity: 65, overproofQuantity: 2, scrapQuantity: 0, workTime: 2.0, status: '已检验', isAuto: true, abnormalInfo: '', remark: '首检', _createTime: '2026-03-14 15:00:00', createUser: '系统', _updateTime: '2026-03-14 15:00:00' },
  { id: '26', reportNo: 'WR2026031501', taskId: 'T026', taskNo: 'WO-20260309-001', assignmentId: 'A026', stepNo: 'OP10', stepName: '车削', equipmentId: 'EQ001', equipmentName: 'CNC车床-001', operator: '张伟', reportDate: '2026-03-15 08:00', qualifiedQuantity: 46, overproofQuantity: 0, scrapQuantity: 2, workTime: 4.0, status: '合格', isAuto: false, abnormalInfo: '', remark: '法兰加工', _createTime: '2026-03-15 08:00:00', createUser: '张伟', _updateTime: '2026-03-15 08:00:00' },
  { id: '27', reportNo: 'WR2026031502', taskId: 'T027', taskNo: 'WO-20260309-002', assignmentId: 'A027', stepNo: 'OP50', stepName: '热处理', equipmentId: 'EQ005', equipmentName: '箱式炉-001', operator: '李明', reportDate: '2026-03-15 09:00', qualifiedQuantity: 75, overproofQuantity: 1, scrapQuantity: 3, workTime: 7.0, status: '待检验', isAuto: true, abnormalInfo: '', remark: '调质处理', _createTime: '2026-03-15 09:00:00', createUser: '系统', _updateTime: '2026-03-15 09:00:00' },
  { id: '28', reportNo: 'WR2026031503', taskId: 'T028', taskNo: 'WO-20260309-003', assignmentId: 'A028', stepNo: 'OP20', stepName: '铣削', equipmentId: 'EQ002', equipmentName: '数控铣床-003', operator: '王强', reportDate: '2026-03-15 10:30', qualifiedQuantity: 29, overproofQuantity: 1, scrapQuantity: 0, workTime: 3.5, status: '合格', isAuto: false, abnormalInfo: '', remark: '', _createTime: '2026-03-15 10:30:00', createUser: '王强', _updateTime: '2026-03-15 10:30:00' },
  { id: '29', reportNo: 'WR2026031504', taskId: 'T029', taskNo: 'WO-20260310-001', assignmentId: 'A029', stepNo: 'OP30', stepName: '磨削', equipmentId: 'EQ003', equipmentName: '外圆磨床-002', operator: '赵磊', reportDate: '2026-03-15 13:00', qualifiedQuantity: 21, overproofQuantity: 0, scrapQuantity: 1, workTime: 2.5, status: '已检验', isAuto: false, abnormalInfo: '', remark: '端面磨削', _createTime: '2026-03-15 13:00:00', createUser: '赵磊', _updateTime: '2026-03-15 14:00:00' },
  { id: '30', reportNo: 'WR2026031505', taskId: 'T030', taskNo: 'WO-20260310-002', assignmentId: 'A030', stepNo: 'OP40', stepName: '钻孔', equipmentId: 'EQ004', equipmentName: '立式钻床-001', operator: '陈刚', reportDate: '2026-03-15 14:30', qualifiedQuantity: 36, overproofQuantity: 2, scrapQuantity: 2, workTime: 2.0, status: '待检验', isAuto: false, abnormalInfo: '', remark: '多孔位加工', _createTime: '2026-03-15 14:30:00', createUser: '陈刚', _updateTime: '2026-03-15 14:30:00' },
]

/**
 * 获取报工单列表
 */
export async function getWorkReportList(params: PageParams & {
  status?: string
  search?: string
}): Promise<PageResponse<WorkReport>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = [...mockWorkReports]

      // 状态筛选
      if (params.status && params.status !== 'all') {
        data = data.filter(item => item.status === params.status)
      }

      // 搜索筛选
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        data = data.filter(item =>
          item.reportNo.toLowerCase().includes(searchLower) ||
          item.taskNo.toLowerCase().includes(searchLower) ||
          item.stepName.toLowerCase().includes(searchLower) ||
          item.equipmentName.toLowerCase().includes(searchLower) ||
          item.operator.toLowerCase().includes(searchLower)
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
 * 创建报工单
 */
export async function createWorkReport(data: Partial<WorkReport>): Promise<WorkReport> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString()
      const newReport: WorkReport = {
        id: String(mockWorkReports.length + 1),
        reportNo: 'WR' + Date.now(),
        taskId: data.taskId || '',
        taskNo: data.taskNo || '',
        assignmentId: data.assignmentId || '',
        stepNo: data.stepNo || '',
        stepName: data.stepName || '',
        equipmentId: data.equipmentId || '',
        equipmentName: data.equipmentName || '',
        operator: data.operator || '',
        reportDate: data.reportDate || now,
        qualifiedQuantity: data.qualifiedQuantity || 0,
        overproofQuantity: data.overproofQuantity || 0,
        scrapQuantity: data.scrapQuantity || 0,
        workTime: data.workTime || 0,
        status: '待检验',
        isAuto: false,
        abnormalInfo: data.abnormalInfo || '',
        remark: data.remark || '',
        _createTime: now,
        createUser: data.operator || '',
        _updateTime: now,
      }
      mockWorkReports.unshift(newReport)
      resolve(newReport)
    }, 300)
  })
}

/**
 * 更新报工单
 */
export async function updateWorkReport(id: string, data: Partial<WorkReport>): Promise<WorkReport> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockWorkReports.findIndex(item => item.id === id)
      if (index === -1) {
        reject(new Error('报工单不存在'))
        return
      }
      const updated = { ...mockWorkReports[index], ...data, _updateTime: new Date().toISOString() }
      mockWorkReports[index] = updated
      resolve(updated)
    }, 300)
  })
}

/**
 * 删除报工单
 */
export async function deleteWorkReport(id: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockWorkReports.findIndex(item => item.id === id)
      if (index === -1) {
        reject(new Error('报工单不存在'))
        return
      }
      mockWorkReports.splice(index, 1)
      resolve(true)
    }, 300)
  })
}
