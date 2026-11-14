import { useState, useEffect, useCallback } from 'react'
import { usersAPI } from '../../api/index'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Plus, Search, Edit2, Trash2, Power, Users as UsersIcon } from 'lucide-react'
import { formatDate, getValidationErrors } from '../../utils/helpers'

const ROLES = ['student', 'teacher', 'admin', 'super_admin']

export default function Users() {
  const { hasRole } = useAuth()
  const { t }       = useTranslation()
  const [users, setUsers]       = useState([])
  const [meta, setMeta]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]         = useState(1)
  const [modal, setModal]       = useState(null)
  const [formData, setFormData] = useState({})
  const [saving, setSaving]     = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await usersAPI.list({ search, role: roleFilter, status: statusFilter, page, per_page: 15 })
      const res = data.users
      setUsers(res.data)
      setMeta({ current_page: res.current_page, last_page: res.last_page, from: res.from, to: res.to, total: res.total })
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter, page])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setFormData({ name: '', email: '', password: '', password_confirmation: '', role: 'student', phone: '', status: 'active' })
    setFormErrors({})
    setModal({ type: 'create' })
  }

  const openEdit = (user) => {
    setFormData({ name: user.name, email: user.email, phone: user.phone || '', status: user.status, role: user.role?.name })
    setFormErrors({})
    setModal({ type: 'edit', user })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormErrors({})
    try {
      await usersAPI.create(formData)
      toast.success('User created.')
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
      await usersAPI.update(modal.user.id, formData)
      toast.success('User updated.')
      setModal(null)
      load()
    } catch (err) {
      setFormErrors(getValidationErrors(err))
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await usersAPI.remove(modal.user.id)
      toast.success('User deleted.')
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const handleToggle = async (user) => {
    try {
      await usersAPI.toggleStatus(user.id)
      toast.success(`Account ${user.status === 'active' ? 'deactivated' : 'activated'}.`)
      load()
    } catch {}
  }

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }))

  const UserForm = ({ onSubmit, isEdit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t('users.fullName')}</label>
          <input className={`input ${formErrors.name ? 'border-red-400' : ''}`} value={formData.name} onChange={e => set('name', e.target.value)} required />
          {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name[0]}</p>}
        </div>
        <div>
          <label className="label">{t('users.email')}</label>
          <input type="email" className={`input ${formErrors.email ? 'border-red-400' : ''}`} value={formData.email} onChange={e => set('email', e.target.value)} required />
          {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email[0]}</p>}
        </div>
      </div>
      <div>
        <label className="label">{t('users.phone')}</label>
        <input className="input" value={formData.phone || ''} onChange={e => set('phone', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t('users.role')}</label>
          <select className="input" value={formData.role} onChange={e => set('role', e.target.value)} disabled={isEdit}>
            {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('users.status')}</label>
          <select className="input" value={formData.status} onChange={e => set('status', e.target.value)}>
            <option value="active">{t('users.active')}</option>
            <option value="inactive">{t('users.inactive')}</option>
          </select>
        </div>
      </div>
      {!isEdit && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t('users.password')}</label>
            <input type="password" className={`input ${formErrors.password ? 'border-red-400' : ''}`} value={formData.password || ''} onChange={e => set('password', e.target.value)} required />
            {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password[0]}</p>}
          </div>
          <div>
            <label className="label">{t('users.confirm')}</label>
            <input type="password" className="input" value={formData.password_confirmation || ''} onChange={e => set('password_confirmation', e.target.value)} required />
          </div>
        </div>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={() => setModal(null)}>{t('common.cancel')}</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('users.saving') : isEdit ? t('common.update') : t('common.create')}</button>
      </div>
    </form>
  )

  return (
    <div>
      <PageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        actions={
          hasRole(['super_admin', 'admin']) &&
          <button className="btn-primary" onClick={openCreate}><Plus className="w-4 h-4" /> {t('users.addUser')}</button>
        }
      />

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder={t('users.searchPlaceholder')} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input w-auto" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
          <option value="">{t('users.allRoles')}</option>
          {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
        </select>
        <select className="input w-auto" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">{t('users.allStatus')}</option>
          <option value="active">{t('users.active')}</option>
          <option value="inactive">{t('users.inactive')}</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <LoadingSpinner /> : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title={t('common.noData')} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('users.user')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('users.role')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('users.status')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('users.joined')}</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} src={u.avatar_url} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={u.role?.name} label={u.role?.display_name} className="bg-blue-50 text-blue-700" />
                      </td>
                      <td className="px-4 py-3"><Badge status={u.status} /></td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-primary-600 transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleToggle(u)} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${u.status === 'active' ? 'text-orange-500' : 'text-green-500'}`} title="Toggle status">
                            <Power className="w-4 h-4" />
                          </button>
                          <button onClick={() => setModal({ type: 'delete', user: u })} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
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

      <Modal open={modal?.type === 'create'} onClose={() => setModal(null)} title={t('users.addNew')}>
        <UserForm onSubmit={handleCreate} isEdit={false} />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title={t('users.editUser')}>
        <UserForm onSubmit={handleUpdate} isEdit={true} />
      </Modal>
      <ConfirmModal
        open={modal?.type === 'delete'}
        onClose={() => setModal(null)}
        onConfirm={handleDelete}
        loading={saving}
        title={t('users.deleteUser')}
        message={`${t('users.deleteConfirm')} "${modal?.user?.name}"? ${t('users.cannotUndo')}`}
      />
    </div>
  )
}
