import { useState, useEffect, useCallback } from 'react'
import { teachersAPI, departmentsAPI } from '../../api/index'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Search, Edit2, Trash2, School } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function Teachers() {
  const { t }               = useTranslation()
  const [teachers, setTeachers] = useState([])
  const [meta, setMeta]         = useState(null)
  const [depts, setDepts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [page, setPage]         = useState(1)
  const [editing, setEditing]   = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [formData, setFormData] = useState({})
  const [saving, setSaving]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await teachersAPI.list({ search, department_id: deptFilter, page, per_page: 15 })
      const res = data.teachers
      setTeachers(res.data)
      setMeta({ current_page: res.current_page, last_page: res.last_page, from: res.from, to: res.to, total: res.total })
    } finally { setLoading(false) }
  }, [search, deptFilter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { departmentsAPI.list().then(({ data }) => setDepts(data.departments)) }, [])

  const openEdit = (teacher) => {
    setFormData({ department_id: teacher.department?.id || '', qualification: teacher.qualification || '', specialization: teacher.specialization || '', experience_years: teacher.experience_years || 0, status: teacher.status })
    setEditing(teacher)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await teachersAPI.update(editing.id, formData)
      toast.success('Teacher updated.')
      setEditing(null)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await teachersAPI.remove(deleting.id)
      toast.success('Teacher removed.')
      setDeleting(null)
      load()
    } finally { setSaving(false) }
  }

  const HEADERS = [t('teachers.teacher'), t('teachers.id'), t('teachers.department'), t('teachers.qualification'), t('teachers.specialization'), t('teachers.experience'), t('teachers.status'), t('common.actions')]

  return (
    <div>
      <PageHeader title={t('teachers.title')} subtitle={`${meta?.total ?? 0} ${t('teachers.title').toLowerCase()}`} />

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder={t('teachers.searchPlaceholder')} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input w-auto" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1) }}>
          <option value="">{t('teachers.allDepts')}</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <LoadingSpinner /> : teachers.length === 0 ? (
          <EmptyState icon={School} title={t('common.noData')} />
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
                  {teachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={teacher.user?.name} src={teacher.user?.avatar_url} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{teacher.user?.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{teacher.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{teacher.teacher_id}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{teacher.department?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-36 truncate">{teacher.qualification ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-36 truncate">{teacher.specialization ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{teacher.experience_years} {t('teachers.yrs')}</td>
                      <td className="px-4 py-3"><Badge status={teacher.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(teacher)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-primary-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleting(teacher)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      <Modal open={!!editing} onClose={() => setEditing(null)} title={t('teachers.editProfile')}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="label">{t('teachers.department')}</label>
            <select className="input" value={formData.department_id} onChange={e => setFormData(p => ({ ...p, department_id: e.target.value }))}>
              <option value="">{t('schedules.none')}</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('teachers.qualification')}</label>
              <input className="input" value={formData.qualification} onChange={e => setFormData(p => ({ ...p, qualification: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('teachers.specialization')}</label>
              <input className="input" value={formData.specialization} onChange={e => setFormData(p => ({ ...p, specialization: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('teachers.expYears')}</label>
              <input type="number" min="0" className="input" value={formData.experience_years} onChange={e => setFormData(p => ({ ...p, experience_years: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('teachers.status')}</label>
              <select className="input" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                <option value="active">{t('common.status.active')}</option>
                <option value="inactive">{t('common.status.inactive')}</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>{t('common.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('common.saving') : t('common.update')}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={saving}
        title={t('teachers.removeTeacher')}
        message={`Remove "${deleting?.user?.name}"? ${t('teachers.removeConfirm')}`}
      />
    </div>
  )
}
