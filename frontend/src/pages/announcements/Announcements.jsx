import { useState, useEffect, useCallback } from 'react'
import { announcementsAPI } from '../../api/index'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import Avatar from '../../components/common/Avatar'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Plus, Megaphone, Edit2, Trash2 } from 'lucide-react'
import { formatDateTime, getValidationErrors } from '../../utils/helpers'

const TARGET_ROLES = ['all', 'student', 'teacher', 'admin']

export default function Announcements() {
  const { hasRole } = useAuth()
  const { t }       = useTranslation()
  const [announcements, setAnnouncements] = useState([])
  const [meta, setMeta]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [modal, setModal]       = useState(null)
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving]     = useState(false)

  const canEdit = hasRole(['super_admin','admin','teacher'])
  const defaultForm = { title: '', content: '', target_role: 'all', is_active: true }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await announcementsAPI.list({ page, per_page: 10 })
      const res = data.announcements
      setAnnouncements(res.data)
      setMeta({ current_page: res.current_page, last_page: res.last_page, from: res.from, to: res.to, total: res.total })
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormErrors({})
    try {
      await announcementsAPI.create(formData)
      toast.success('Announcement published.')
      setModal(null)
      load()
    } catch (err) {
      setFormErrors(getValidationErrors(err))
    } finally { setSaving(false) }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await announcementsAPI.update(modal.announcement.id, formData)
      toast.success('Announcement updated.')
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await announcementsAPI.remove(modal.announcement.id)
      toast.success('Announcement deleted.')
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }))

  const AnnouncementForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">{t('announcements.titleLabel')}</label>
        <input className={`input ${formErrors.title ? 'border-red-400' : ''}`} placeholder={t('announcements.titlePlaceholder')} value={formData.title} onChange={e => set('title', e.target.value)} required />
        {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title[0]}</p>}
      </div>
      <div>
        <label className="label">{t('announcements.content')}</label>
        <textarea className="input resize-none" rows={5} placeholder={t('announcements.contentPlaceholder')} value={formData.content || ''} onChange={e => set('content', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t('announcements.targetAudience')}</label>
          <select className="input" value={formData.target_role} onChange={e => set('target_role', e.target.value)}>
            {TARGET_ROLES.map(r => <option key={r} value={r}>{r === 'all' ? t('announcements.everyone') : r}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input type="checkbox" id="is_active" className="w-4 h-4 text-primary-600 rounded" checked={formData.is_active} onChange={e => set('is_active', e.target.checked)} />
          <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">{t('announcements.active')}</label>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={() => setModal(null)}>{t('common.cancel')}</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('announcements.publishing') : modal?.type === 'create' ? t('announcements.publish') : t('announcements.update')}</button>
      </div>
    </form>
  )

  return (
    <div>
      <PageHeader
        title={t('announcements.title')}
        subtitle={t('announcements.subtitle')}
        actions={
          canEdit &&
          <button className="btn-primary" onClick={() => { setFormData(defaultForm); setFormErrors({}); setModal({ type: 'create' }) }}>
            <Plus className="w-4 h-4" /> {t('announcements.newBtn')}
          </button>
        }
      />

      {loading ? <LoadingSpinner /> : announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title={t('announcements.noAnnouncements')} />
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar name={a.author?.name} src={a.author?.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                      <span className="badge bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 capitalize">{a.target_role}</span>
                      {!a.is_active && <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{t('announcements.draft')}</span>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{a.content}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {t('announcements.by')} <span className="font-medium">{a.author?.name}</span> · {formatDateTime(a.published_at || a.created_at)}
                    </p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setFormData({ title: a.title, content: a.content, target_role: a.target_role, is_active: a.is_active }); setModal({ type: 'edit', announcement: a }) }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-primary-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setModal({ type: 'delete', announcement: a })} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="card px-4"><Pagination meta={meta} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal open={modal?.type === 'create'} onClose={() => setModal(null)} title={t('announcements.newTitle')} size="lg">
        <AnnouncementForm onSubmit={handleCreate} />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title={t('announcements.editTitle')} size="lg">
        <AnnouncementForm onSubmit={handleUpdate} />
      </Modal>
      <ConfirmModal open={modal?.type === 'delete'} onClose={() => setModal(null)} onConfirm={handleDelete} loading={saving} title={t('announcements.deleteTitle')} message={`Delete "${modal?.announcement?.title}"?`} />
    </div>
  )
}
