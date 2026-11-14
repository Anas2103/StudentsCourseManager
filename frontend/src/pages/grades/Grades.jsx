import { useState, useEffect, useCallback } from 'react'
import { gradesAPI, coursesAPI } from '../../api/index'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import Avatar from '../../components/common/Avatar'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Edit2, BarChart3, Download } from 'lucide-react'
import { GRADE_COLORS } from '../../utils/constants'

export default function Grades() {
  const { hasRole } = useAuth()
  const { t }       = useTranslation()
  const [grades, setGrades]     = useState([])
  const [meta, setMeta]         = useState(null)
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [courseFilter, setCourseFilter] = useState('')
  const [page, setPage]         = useState(1)
  const [modal, setModal]       = useState(null)
  const [formData, setFormData] = useState({})
  const [saving, setSaving]     = useState(false)

  const canEdit = hasRole(['super_admin', 'admin', 'teacher'])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await gradesAPI.list({ course_id: courseFilter, page, per_page: 20 })
      const res = data.grades
      setGrades(res.data)
      setMeta({ current_page: res.current_page, last_page: res.last_page, from: res.from, to: res.to, total: res.total })
    } finally { setLoading(false) }
  }, [courseFilter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    coursesAPI.list({ per_page: 100 }).then(({ data }) => setCourses(data.courses.data))
  }, [])

  const openEdit = (g) => {
    setFormData({
      midterm_score:     g.midterm_score,
      final_score:       g.final_score,
      assignments_score: g.assignments_score,
      attendance_score:  g.attendance_score,
      remarks:           g.remarks || '',
    })
    setModal({ type: 'edit', grade: g })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await gradesAPI.update(modal.grade.id, formData)
      toast.success('Grade updated.')
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }))

  const exportCSV = () => {
    const rows = [['Student', 'Course', 'Midterm', 'Final', 'Assignments', 'Attendance', 'Total', 'Grade']]
    grades.forEach(g => rows.push([
      g.student?.user?.name ?? '',
      g.course?.name ?? '',
      g.midterm_score ?? '',
      g.final_score ?? '',
      g.assignments_score ?? '',
      g.attendance_score ?? '',
      g.total_score ?? '',
      g.grade_letter ?? '',
    ]))
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `grades_export_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  return (
    <div>
      <PageHeader title={t('grades.title')} subtitle={t('grades.subtitle')}
        actions={
          grades.length > 0 && (
            <button className="btn-secondary flex items-center gap-2" onClick={exportCSV}>
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )
        }
      />

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <select className="input w-auto" value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setPage(1) }}>
          <option value="">{t('grades.allCourses')}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <LoadingSpinner /> : grades.length === 0 ? (
          <EmptyState icon={BarChart3} title={t('common.noData')} description={t('grades.noGrades')} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('grades.student')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('grades.course')}</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('grades.midterm')}</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('grades.final')}</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('grades.assignments')}</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('grades.attendance')}</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('grades.total')}</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('grades.grade')}</th>
                    {canEdit && <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('common.actions')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {grades.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={g.student?.user?.name} src={g.student?.user?.avatar_url} size="xs" />
                          <span className="font-medium text-gray-900 dark:text-white">{g.student?.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.course?.name}</td>
                      <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{g.midterm_score ?? '—'}</td>
                      <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{g.final_score ?? '—'}</td>
                      <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{g.assignments_score ?? '—'}</td>
                      <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{g.attendance_score ?? '—'}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">{g.total_score ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold text-lg ${GRADE_COLORS[g.grade_letter] || 'text-gray-600'}`}>{g.grade_letter ?? '—'}</span>
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => openEdit(g)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-primary-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
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

      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title={t('grades.updateGrade')}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
            <p className="font-medium text-gray-900 dark:text-white">{modal?.grade?.student?.user?.name}</p>
            <p className="text-gray-500 dark:text-gray-400">{modal?.grade?.course?.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['midterm_score', t('grades.midtermPct')],
              ['final_score', t('grades.finalPct')],
              ['assignments_score', t('grades.assignmentsPct')],
              ['attendance_score', t('grades.attendancePct')],
            ].map(([k, label]) => (
              <div key={k}>
                <label className="label">{label}</label>
                <input type="number" min={0} max={100} step={0.5} className="input" value={formData[k] ?? 0} onChange={e => set(k, parseFloat(e.target.value))} />
              </div>
            ))}
          </div>
          <div>
            <label className="label">{t('grades.remarks')}</label>
            <textarea className="input resize-none" rows={2} value={formData.remarks} onChange={e => set('remarks', e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>{t('common.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('grades.saving') : t('grades.updateGradeBtn')}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
