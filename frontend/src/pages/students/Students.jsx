import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { studentsAPI, departmentsAPI } from '../../api/index'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Search, Eye, Trash2, UserCheck } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function Students() {
  const { t }               = useTranslation()
  const [students, setStudents] = useState([])
  const [meta, setMeta]         = useState(null)
  const [depts, setDepts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deptFilter, setDeptFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]         = useState(1)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await studentsAPI.list({ search, department_id: deptFilter, status: statusFilter, page, per_page: 15 })
      const res = data.students
      setStudents(res.data)
      setMeta({ current_page: res.current_page, last_page: res.last_page, from: res.from, to: res.to, total: res.total })
    } finally { setLoading(false) }
  }, [search, deptFilter, statusFilter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    departmentsAPI.list().then(({ data }) => setDepts(data.departments))
  }, [])

  const handleDelete = async () => {
    setSaving(true)
    try {
      await studentsAPI.remove(deleting.id)
      toast.success('Student removed.')
      setDeleting(null)
      load()
    } finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader title={t('students.title')} subtitle={`${meta?.total ?? 0} ${t('students.title').toLowerCase()}`} />

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder={t('students.searchPlaceholder')} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input w-auto" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1) }}>
          <option value="">{t('students.allDepts')}</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input w-auto" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">{t('students.allStatus')}</option>
          {['active','inactive','graduated','suspended'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <LoadingSpinner /> : students.length === 0 ? (
          <EmptyState icon={UserCheck} title={t('common.noData')} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <tr>
                    {[t('students.student'), t('students.id'), t('students.department'), t('students.enrolled'), t('students.gpa'), t('students.status'), t('common.actions')].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.user?.name} src={s.user?.avatar_url} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{s.user?.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{s.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{s.student_id}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.department?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(s.enrollment_date)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{s.gpa ?? '0.00'}</td>
                      <td className="px-4 py-3"><Badge status={s.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/students/${s.id}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-primary-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => setDeleting(s)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
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

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={saving}
        title={t('students.removeStudent')}
        message={`Remove "${deleting?.user?.name}"? ${t('students.removeConfirm')}`}
      />
    </div>
  )
}
