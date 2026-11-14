import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { coursesAPI, departmentsAPI, semestersAPI } from '../../api/index'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Search, Plus, Eye, Edit2, Trash2, BookOpen, Users } from 'lucide-react'
import { getValidationErrors } from '../../utils/helpers'

export default function Courses() {
  const { hasRole } = useAuth()
  const { t }       = useTranslation()
  const [courses, setCourses]   = useState([])
  const [meta, setMeta]         = useState(null)
  const [depts, setDepts]       = useState([])
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deptFilter, setDeptFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]         = useState(1)
  const [modal, setModal]       = useState(null)
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving]     = useState(false)

  const defaultForm = { code: '', name: '', description: '', credits: 3, department_id: '', semester_id: '', max_students: 40, status: 'active' }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await coursesAPI.list({ search, department_id: deptFilter, status: statusFilter, page, per_page: 15 })
      const res = data.courses
      setCourses(res.data)
      setMeta({ current_page: res.current_page, last_page: res.last_page, from: res.from, to: res.to, total: res.total })
    } finally { setLoading(false) }
  }, [search, deptFilter, statusFilter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    departmentsAPI.list().then(({ data }) => setDepts(data.departments))
    semestersAPI.list().then(({ data }) => setSemesters(data.semesters))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormErrors({})
    try {
      await coursesAPI.create(formData)
      toast.success('Course created.')
      setModal(null)
      load()
    } catch (err) {
      setFormErrors(getValidationErrors(err))
    } finally { setSaving(false) }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormErrors({})
    try {
      await coursesAPI.update(modal.course.id, formData)
      toast.success('Course updated.')
      setModal(null)
      load()
    } catch (err) {
      setFormErrors(getValidationErrors(err))
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await coursesAPI.remove(modal.course.id)
      toast.success('Course deleted.')
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }))

  const CourseForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t('courses.courseCode')}</label>
          <input className={`input ${formErrors.code ? 'border-red-400' : ''}`} placeholder="CS101" value={formData.code} onChange={e => set('code', e.target.value)} required />
          {formErrors.code && <p className="text-xs text-red-500 mt-1">{formErrors.code[0]}</p>}
        </div>
        <div>
          <label className="label">{t('courses.courseName')}</label>
          <input className={`input ${formErrors.name ? 'border-red-400' : ''}`} placeholder="Introduction to Programming" value={formData.name} onChange={e => set('name', e.target.value)} required />
          {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name[0]}</p>}
        </div>
      </div>
      <div>
        <label className="label">{t('courses.description')}</label>
        <textarea className="input resize-none" rows={3} value={formData.description || ''} onChange={e => set('description', e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">{t('courses.credits')}</label>
          <input type="number" min={1} max={6} className="input" value={formData.credits} onChange={e => set('credits', e.target.value)} required />
        </div>
        <div>
          <label className="label">{t('courses.maxStudents')}</label>
          <input type="number" min={1} className="input" value={formData.max_students} onChange={e => set('max_students', e.target.value)} required />
        </div>
        <div>
          <label className="label">{t('courses.status')}</label>
          <select className="input" value={formData.status} onChange={e => set('status', e.target.value)}>
            <option value="active">{t('common.status.active')}</option>
            <option value="inactive">{t('common.status.inactive')}</option>
            <option value="completed">{t('common.status.completed')}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t('courses.department')}</label>
          <select className="input" value={formData.department_id} onChange={e => set('department_id', e.target.value)}>
            <option value="">{t('schedules.none')}</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('courses.semester')}</label>
          <select className="input" value={formData.semester_id} onChange={e => set('semester_id', e.target.value)}>
            <option value="">{t('schedules.none')}</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={() => setModal(null)}>{t('common.cancel')}</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('common.saving') : modal?.type === 'create' ? t('common.create') : t('common.update')}</button>
      </div>
    </form>
  )

  const HEADERS = [t('courses.code'), t('courses.course'), t('courses.department'), t('courses.credits'), t('courses.enrolled'), t('courses.status'), t('common.actions')]

  return (
    <div>
      <PageHeader
        title={t('courses.title')}
        subtitle={`${meta?.total ?? 0} ${t('courses.title').toLowerCase()}`}
        actions={
          hasRole(['super_admin','admin']) &&
          <button className="btn-primary" onClick={() => { setFormData(defaultForm); setFormErrors({}); setModal({ type: 'create' }) }}>
            <Plus className="w-4 h-4" /> {t('courses.addCourse')}
          </button>
        }
      />

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder={t('courses.searchPlaceholder')} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input w-auto" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1) }}>
          <option value="">{t('courses.allDepts')}</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input w-auto" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">{t('courses.allStatus')}</option>
          {['active','inactive','completed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <LoadingSpinner /> : courses.length === 0 ? (
          <EmptyState icon={BookOpen} title={t('common.noData')} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <tr>
                    {HEADERS.map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {courses.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary-600">{c.code}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">{c.description}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.department?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.credits}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <Users className="w-3.5 h-3.5" /> {c.enrolled_count ?? 0}/{c.max_students}
                        </span>
                      </td>
                      <td className="px-4 py-3"><Badge status={c.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/courses/${c.id}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-primary-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {hasRole(['super_admin','admin']) && (
                            <>
                              <button onClick={() => { setFormData({ code: c.code, name: c.name, description: c.description || '', credits: c.credits, department_id: c.department?.id || '', semester_id: '', max_students: c.max_students, status: c.status }); setFormErrors({}); setModal({ type: 'edit', course: c }) }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-primary-600 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setModal({ type: 'delete', course: c })} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4"><Pagination meta={meta} onPageChange={setPage} /></div>
          </>
        )}
      </div>

      <Modal open={modal?.type === 'create'} onClose={() => setModal(null)} title={t('courses.addNew')} size="lg">
        <CourseForm onSubmit={handleCreate} />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title={t('courses.editCourse')} size="lg">
        <CourseForm onSubmit={handleUpdate} />
      </Modal>
      <ConfirmModal open={modal?.type === 'delete'} onClose={() => setModal(null)} onConfirm={handleDelete} loading={saving} title={t('courses.deleteCourse')} message={`Delete "${modal?.course?.name}"? ${t('courses.deleteConfirm')}`} />
    </div>
  )
}
