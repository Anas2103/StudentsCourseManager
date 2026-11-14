import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authAPI } from '../../api/index'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import Avatar from '../../components/common/Avatar'
import { Camera, Save, Lock, User } from 'lucide-react'

export default function Profile() {
  const { user, updateUser, fetchUser } = useAuth()
  const { t }  = useTranslation()
  const fileRef = useRef(null)

  const [profileForm, setProfileForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
  })

  const [pwdForm, setPwdForm] = useState({
    current_password:      '',
    password:              '',
    password_confirmation: '',
  })

  const [savingProfile, setSavingProfile]       = useState(false)
  const [savingPwd, setSavingPwd]               = useState(false)
  const [uploadingAvatar, setUploadingAvatar]   = useState(false)
  const [profileErrors, setProfileErrors]       = useState({})
  const [pwdErrors, setPwdErrors]               = useState({})

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileErrors({})
    try {
      const { data } = await authAPI.updateProfile(profileForm)
      updateUser(data.user)
      toast.success('Profile updated.')
    } catch (err) {
      setProfileErrors(err?.response?.data?.errors || {})
    } finally { setSavingProfile(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setSavingPwd(true)
    setPwdErrors({})
    try {
      await authAPI.changePassword(pwdForm)
      toast.success('Password changed.')
      setPwdForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      setPwdErrors(err?.response?.data?.errors || {})
      if (err?.response?.data?.message) toast.error(err.response.data.message)
    } finally { setSavingPwd(false) }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const form = new FormData()
      form.append('avatar', file)
      await authAPI.uploadAvatar(form)
      await fetchUser()
      toast.success('Avatar updated.')
    } catch { toast.error('Failed to upload avatar.') }
    finally { setUploadingAvatar(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile.title')}</h1>

      {/* Avatar */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={user?.name} src={user?.avatar_url} size="lg" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mt-1">{user?.role?.display_name}</span>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-primary-600" /> {t('profile.personalInfo')}
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">{t('profile.fullName')}</label>
            <input className={`input ${profileErrors.name ? 'border-red-400' : ''}`} value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
            {profileErrors.name && <p className="text-xs text-red-500 mt-1">{profileErrors.name[0]}</p>}
          </div>
          <div>
            <label className="label">{t('profile.emailAddress')}</label>
            <input type="email" className="input bg-gray-50 dark:bg-gray-700 cursor-not-allowed" value={user?.email} disabled />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('profile.emailNote')}</p>
          </div>
          <div>
            <label className="label">{t('profile.phoneNumber')}</label>
            <input className="input" placeholder="+1 234 567 890" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">{t('profile.address')}</label>
            <textarea className="input resize-none" rows={2} value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={savingProfile}>
              <Save className="w-4 h-4" /> {savingProfile ? t('profile.saving') : t('profile.saveChanges')}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary-600" /> {t('profile.changePassword')}
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">{t('profile.currentPassword')}</label>
            <input type="password" className={`input ${pwdErrors.current_password ? 'border-red-400' : ''}`} value={pwdForm.current_password} onChange={e => setPwdForm(p => ({ ...p, current_password: e.target.value }))} required />
            {pwdErrors.current_password && <p className="text-xs text-red-500 mt-1">{pwdErrors.current_password[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('profile.newPassword')}</label>
              <input type="password" className={`input ${pwdErrors.password ? 'border-red-400' : ''}`} value={pwdForm.password} onChange={e => setPwdForm(p => ({ ...p, password: e.target.value }))} required />
              {pwdErrors.password && <p className="text-xs text-red-500 mt-1">{pwdErrors.password[0]}</p>}
            </div>
            <div>
              <label className="label">{t('profile.confirmNew')}</label>
              <input type="password" className="input" value={pwdForm.password_confirmation} onChange={e => setPwdForm(p => ({ ...p, password_confirmation: e.target.value }))} required />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={savingPwd}>
              <Lock className="w-4 h-4" /> {savingPwd ? t('profile.updating') : t('profile.updatePassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
