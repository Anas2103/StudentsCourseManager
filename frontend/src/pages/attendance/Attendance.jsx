import { useState, useEffect, useCallback } from 'react'
import { attendanceAPI, coursesAPI } from '../../api/index'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Avatar from '../../components/common/Avatar'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Plus, UserCheck, Edit2, Trash2, Download } from 'lucide-react'
import { formatDate } from '../../utils/helpers'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const STATUSES = ['present', 'absent', 'late', 'excused']

export default function Attendance() {
  const { hasRole } = useAuth()
  const { t }       = useTranslation()
  const [records, setRecords]   = useState([])
  const [meta, setMeta]         = useState(null)
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [courseFilter, setCourseFilter] = useState('')
  const [dateFilter, setDateFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]         = useState(1)
  const [modal, setModal]       = useState(null)
  const [formData, setFormData] = useState({ course_id: '', student_id: '', date: new Date().toISOString().slice(0,10), status: 'present', notes: '' })
  const [students, setStudents] = useState([])
  const [saving, setSaving]     = useState(false)

  const canEdit = hasRole(['super_admin', 'admin', 'teacher'])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await attendanceAPI.list({ course_id: courseFilter, date: dateFilter, status: statusFilter, page, per_page: 20 })
      const res = data.attendance
      setRecords(res.data)
      setMeta({ current_page: res.current_page, last_page: res.last_page, from: res.from, to: res.to, total: res.total })
    } finally { setLoading(false) }
  }, [courseFilter, dateFilter, statusFilter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    coursesAPI.list({ per_page: 100 }).then(({ data }) => setCourses(data.courses.data))
  }, [])

  const openCreate = () => {
    setFormData({ course_id: '', student_id: '', date: new Date().toISOString().slice(0,10), status: 'present', notes: '' })
    setStudents([])
    setModal({ type: 'create' })
  }

  const loadStudentsForCourse = async (courseId) => {
    if (!courseId) return setStudents([])
    const { data } = await coursesAPI.students(courseId)
    setStudents(data.students)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await attendanceAPI.create(formData)
      toast.success('Attendance recorded.')
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await attendanceAPI.update(modal.record.id, { status: formData.status, notes: formData.notes })
      toast.success('Attendance updated.')
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this attendance record?')) return
    await attendanceAPI.remove(id)
    toast.success('Record deleted.')
    load()
  }

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }))

  const exportCSV = () => {
    const rows = [['Student', 'Course', 'Date', 'Status', 'Notes']]
    records.forEach(r => rows.push([
      r.student?.user?.name ?? '',
      r.course?.name ?? '',
      r.date ?? '',
      r.status ?? '',
      r.notes ?? '',
    ]))
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `attendance_export_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  const exportPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(14)
    doc.text('Attendance Export', 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toISOString().slice(0, 10)}`, 14, 21)

    autoTable(doc, {
      startY: 26,
      head: [['Student', 'Course', 'Date', 'Status', 'Notes']],
      body: records.map(r => [
        r.student?.user?.name ?? '',
        r.course?.name ?? '',
        r.date ?? '',
        r.status ?? '',
        r.notes ?? '',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    doc.save(`attendance_export_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div>
      <PageHeader
        title={t('attendance.title')}
        subtitle={t('attendance.subtitle')}
        actions={
          <div className="flex gap-2">
            {records.length > 0 && (
              <>
                <button className="btn-secondary flex items-center gap-2" onClick={exportCSV}>
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button className="btn-secondary flex items-center gap-2" onClick={exportPDF}>
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </>
            )}
            {canEdit && <button className="btn-primary" onClick={openCreate}><Plus className="w-4 h-4" /> {t('attendance.recordBtn')}</button>}
          </div>
        }
      />

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <select className="input w-auto" value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setPage(1) }}>
          <option value="">{t('attendance.allCourses')}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
        </select>
        <input type="date" className="input w-auto" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1) }} />
        <select className="input w-auto" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">{t('attendance.allStatus')}</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <LoadingSpinner /> : records.length === 0 ? (
          <EmptyState icon={UserCheck} title={t('attendance.noRecords')} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('attendance.student')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('attendance.course')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('attendance.date')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('attendance.status')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('attendance.notes')}</th>
                    {canEdit && <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('common.actions')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {records.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={r.student?.user?.name} src={r.student?.user?.avatar_url} size="xs" />
                          <span className="font-medium text-gray-900 dark:text-white">{r.student?.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.course?.name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(r.date)}</td>
                      <td className="px-4 py-3"><Badge status={r.status} /></td>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{r.notes || '—'}</td>
                      {canEdit && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setFormData({ status: r.status, notes: r.notes || '' }); setModal({ type: 'edit', record: r }) }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-primary-600 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4"><Pagination meta={meta} onPageChange={setPage} /></div>
          </>
        )}
      </div>

      <Modal open={modal?.type === 'create'} onClose={() => setModal(null)} title={t('attendance.recordTitle')}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">{t('attendance.course')}</label>
            <select className="input" value={formData.course_id} onChange={e => { set('course_id', e.target.value); loadStudentsForCourse(e.target.value) }} required>
              <option value="">{t('attendance.selectCourse')}</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('attendance.student')}</label>
            <select className="input" value={formData.student_id} onChange={e => set('student_id', e.target.value)} required>
              <option value="">{t('attendance.selectStudent')}</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.user?.name} ({s.student_id})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('attendance.date')}</label>
              <input type="date" className="input" value={formData.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div>
              <label className="label">{t('attendance.status')}</label>
              <select className="input" value={formData.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">{t('attendance.notesOptional')}</label>
            <input className="input" value={formData.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>{t('common.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('common.saving') : t('common.create')}</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title={t('attendance.editTitle')}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="label">{t('attendance.status')}</label>
            <select className="input" value={formData.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('attendance.notes')}</label>
            <input className="input" value={formData.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>{t('common.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('common.saving') : t('common.update')}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
