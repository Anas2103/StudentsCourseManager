import { useState, useEffect, useCallback } from 'react'
import { schedulesAPI, coursesAPI, teachersAPI, classroomsAPI, semestersAPI } from '../../api/index'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Plus, Calendar } from 'lucide-react'
import { DAY_ORDER } from '../../utils/constants'
import { formatTime } from '../../utils/helpers'

export default function Schedules() {
  const { hasRole } = useAuth()
  const { t }       = useTranslation()
  const [schedules, setSchedules]   = useState([])
  const [courses, setCourses]       = useState([])
  const [teachers, setTeachers]     = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [semesters, setSemesters]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null)
  const [formData, setFormData]     = useState({})
  const [saving, setSaving]         = useState(false)

  const canEdit = hasRole(['super_admin','admin'])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await schedulesAPI.list({ per_page: 100 })
      setSchedules(data.schedules.data || data.schedules)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    Promise.all([
      coursesAPI.list({ per_page: 100 }),
      teachersAPI.list({ per_page: 100 }),
      classroomsAPI.list(),
      semestersAPI.list(),
    ]).then(([c, teacher, cl, s]) => {
      setCourses(c.data.courses.data)
      setTeachers(teacher.data.teachers.data)
      setClassrooms(cl.data.classrooms)
      setSemesters(s.data.semesters)
    })
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await schedulesAPI.create(formData)
      toast.success('Schedule created.')
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await schedulesAPI.remove(modal.schedule.id)
      toast.success('Schedule deleted.')
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }))

  const byDay = DAY_ORDER.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.day_of_week === day)
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title={t('schedules.title')}
        subtitle={t('schedules.subtitle')}
        actions={
          canEdit &&
          <button className="btn-primary" onClick={() => { setFormData({ course_id: '', teacher_id: '', classroom_id: '', semester_id: '', day_of_week: 'monday', start_time: '08:00', end_time: '09:30' }); setModal({ type: 'create' }) }}>
            <Plus className="w-4 h-4" /> {t('schedules.addBtn')}
          </button>
        }
      />

      {loading ? <LoadingSpinner /> : schedules.length === 0 ? (
        <EmptyState icon={Calendar} title={t('schedules.noSchedules')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {DAY_ORDER.slice(0, 5).map(day => (
            <div key={day} className="card overflow-hidden">
              <div className="px-4 py-3 bg-primary-50 dark:bg-primary-900/30 border-b border-primary-100 dark:border-primary-800">
                <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 capitalize">{day}</h3>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {byDay[day].length === 0 ? (
                  <p className="px-4 py-6 text-xs text-gray-400 dark:text-gray-500 text-center">{t('schedules.noClasses')}</p>
                ) : byDay[day].map(s => (
                  <div key={s.id} className="px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{formatTime(s.start_time)} — {formatTime(s.end_time)}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5 truncate">{s.course?.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{s.teacher?.user?.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{s.classroom?.name}</p>
                    {canEdit && (
                      <button onClick={() => setModal({ type: 'delete', schedule: s })} className="mt-1 text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300">
                        {t('common.delete')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal?.type === 'create'} onClose={() => setModal(null)} title={t('schedules.addTitle')} size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('schedules.course')}</label>
              <select className="input" value={formData.course_id} onChange={e => set('course_id', e.target.value)} required>
                <option value="">{t('schedules.selectCourse')}</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('schedules.teacher')}</label>
              <select className="input" value={formData.teacher_id} onChange={e => set('teacher_id', e.target.value)} required>
                <option value="">{t('schedules.selectTeacher')}</option>
                {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.user?.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('schedules.classroom')}</label>
              <select className="input" value={formData.classroom_id} onChange={e => set('classroom_id', e.target.value)}>
                <option value="">{t('schedules.none')}</option>
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('schedules.semester')}</label>
              <select className="input" value={formData.semester_id} onChange={e => set('semester_id', e.target.value)}>
                <option value="">{t('schedules.none')}</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">{t('schedules.dayOfWeek')}</label>
            <select className="input" value={formData.day_of_week} onChange={e => set('day_of_week', e.target.value)}>
              {DAY_ORDER.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('schedules.startTime')}</label>
              <input type="time" className="input" value={formData.start_time} onChange={e => set('start_time', e.target.value)} required />
            </div>
            <div>
              <label className="label">{t('schedules.endTime')}</label>
              <input type="time" className="input" value={formData.end_time} onChange={e => set('end_time', e.target.value)} required />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>{t('common.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('common.saving') : t('common.create')}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={modal?.type === 'delete'} onClose={() => setModal(null)} onConfirm={handleDelete} loading={saving} title={t('schedules.deleteTitle')} message={t('schedules.deleteConfirm')} />
    </div>
  )
}
