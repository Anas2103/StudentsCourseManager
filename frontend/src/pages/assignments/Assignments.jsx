import { useState, useEffect, useCallback } from 'react'
import { assignmentsAPI, coursesAPI, submissionsAPI } from '../../api/index'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import Avatar from '../../components/common/Avatar'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Plus, ClipboardList, Edit2, Trash2, Calendar, Send, Eye, CheckSquare } from 'lucide-react'
import { formatDateTime, getValidationErrors } from '../../utils/helpers'

const TYPES = ['homework', 'project', 'quiz', 'exam']

const STATUS_COLOR = {
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  graded:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  late:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export default function Assignments() {
  const { hasRole, user } = useAuth()
  const { t }             = useTranslation()
  const [assignments, setAssignments] = useState([])
  const [meta, setMeta]         = useState(null)
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [courseFilter, setCourseFilter] = useState('')
  const [typeFilter, setTypeFilter]     = useState('')
  const [page, setPage]         = useState(1)
  const [modal, setModal]       = useState(null)
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving]     = useState(false)

  // Submissions state
  const [mySubmissions, setMySubmissions]     = useState({})   // { assignmentId: submission }
  const [submissionsMap, setSubmissionsMap]   = useState({})   // teacher: { assignmentId: [submissions] }
  const [submitForm, setSubmitForm]           = useState({ content: '', file: null })
  const [gradeForm, setGradeForm]             = useState({ points_earned: 0, feedback: '' })
  const [subLoading, setSubLoading]           = useState(false)

  const isStudent = user?.role?.name === 'student'
  const isTeacher = user?.role?.name === 'teacher'
  const canEdit   = hasRole(['super_admin', 'admin', 'teacher'])
  const defaultForm = { course_id: '', title: '', description: '', due_date: '', max_points: 100, type: 'homework' }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await assignmentsAPI.list({ course_id: courseFilter, type: typeFilter, page, per_page: 15 })
      const res = data.assignments
      setAssignments(res.data)
      setMeta({ current_page: res.current_page, last_page: res.last_page, from: res.from, to: res.to, total: res.total })
    } finally { setLoading(false) }
  }, [courseFilter, typeFilter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    coursesAPI.list({ per_page: 100 }).then(({ data }) => setCourses(data.courses.data))
  }, [])

  // Load student's own submissions
  useEffect(() => {
    if (!isStudent) return
    submissionsAPI.list({ per_page: 100 }).then(({ data }) => {
      const map = {}
      const list = Array.isArray(data.submissions) ? data.submissions : (data.submissions?.data || [])
      list.forEach(s => { map[s.assignment?.id] = s })
      setMySubmissions(map)
    }).catch(() => {})
  }, [isStudent])

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setFormErrors({})
    try {
      await assignmentsAPI.create(formData)
      toast.success('Assignment created.')
      setModal(null); load()
    } catch (err) { setFormErrors(getValidationErrors(err)) }
    finally { setSaving(false) }
  }

  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await assignmentsAPI.update(modal.assignment.id, formData)
      toast.success('Assignment updated.')
      setModal(null); load()
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await assignmentsAPI.remove(modal.assignment.id)
      toast.success('Assignment deleted.')
      setModal(null); load()
    } finally { setSaving(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubLoading(true)
    try {
      const fd = new FormData()
      fd.append('assignment_id', modal.assignment.id)
      if (submitForm.content) fd.append('content', submitForm.content)
      if (submitForm.file)    fd.append('file', submitForm.file)
      await submissionsAPI.create(fd)
      toast.success('Assignment submitted!')
      setModal(null)
      // Refresh submissions map
      submissionsAPI.list({ per_page: 100 }).then(({ data }) => {
        const map = {}
        ;(data.submissions?.data || []).forEach(s => { map[s.assignment?.id] = s })
        setMySubmissions(map)
      })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Submission failed.'
      toast.error(msg)
    } finally { setSubLoading(false) }
  }

  const loadSubmissionsForAssignment = async (assignment) => {
    setSubLoading(true)
    try {
      const { data } = await assignmentsAPI.submissions(assignment.id)
      // submissions endpoint returns a flat array (not paginated)
      const list = Array.isArray(data.submissions) ? data.submissions : (data.submissions?.data || [])
      setSubmissionsMap(p => ({ ...p, [assignment.id]: list }))
      setGradeForm({ points_earned: 0, feedback: '' })
      setModal({ type: 'viewSubmissions', assignment, selectedSub: null })
    } catch { toast.error('Failed to load submissions.') }
    finally { setSubLoading(false) }
  }

  const handleGrade = async (e) => {
    e.preventDefault(); setSubLoading(true)
    try {
      await submissionsAPI.grade(modal.selectedSub.id, gradeForm)
      toast.success('Submission graded.')
      await loadSubmissionsForAssignment(modal.assignment)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Grading failed.')
    } finally { setSubLoading(false) }
  }

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }))

  const isDueSoon = (d) => { if (!d) return false; const diff = new Date(d) - new Date(); return diff > 0 && diff < 3 * 86400000 }
  const isOverdue = (d) => d && new Date(d) < new Date()

  const AssignmentForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">{t('assignments.course')}</label>
        <select className={`input ${formErrors.course_id ? 'border-red-400' : ''}`} value={formData.course_id} onChange={e => set('course_id', e.target.value)} required>
          <option value="">{t('assignments.selectCourse')}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
        </select>
      </div>
      <div>
        <label className="label">{t('assignments.titleLabel')}</label>
        <input className={`input ${formErrors.title ? 'border-red-400' : ''}`} placeholder={t('assignments.titlePlaceholder')} value={formData.title} onChange={e => set('title', e.target.value)} required />
        {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title[0]}</p>}
      </div>
      <div>
        <label className="label">{t('assignments.description')}</label>
        <textarea className="input resize-none" rows={3} value={formData.description || ''} onChange={e => set('description', e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">{t('assignments.type')}</label>
          <select className="input" value={formData.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('assignments.maxPointsLabel')}</label>
          <input type="number" min={1} className="input" value={formData.max_points} onChange={e => set('max_points', e.target.value)} required />
        </div>
        <div>
          <label className="label">{t('assignments.dueDateLabel')}</label>
          <input type="datetime-local" className="input" value={formData.due_date} onChange={e => set('due_date', e.target.value)} required />
          {formErrors.due_date && <p className="text-xs text-red-500 mt-1">{formErrors.due_date[0]}</p>}
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={() => setModal(null)}>{t('common.cancel')}</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('common.saving') : modal?.type === 'create' ? t('common.create') : t('common.update')}</button>
      </div>
    </form>
  )

  const HEADERS = [t('assignments.title_col'), t('assignments.course'), t('assignments.type'), t('assignments.dueDate'), t('assignments.maxPoints'), t('assignments.status'), t('common.actions')]

  return (
    <div>
      <PageHeader
        title={t('assignments.title')}
        subtitle={`${meta?.total ?? 0} ${t('assignments.title').toLowerCase()}`}
        actions={canEdit && (
          <button className="btn-primary" onClick={() => { setFormData(defaultForm); setFormErrors({}); setModal({ type: 'create' }) }}>
            <Plus className="w-4 h-4" /> {t('assignments.addBtn')}
          </button>
        )}
      />

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <select className="input w-auto" value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setPage(1) }}>
          <option value="">{t('assignments.allCourses')}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input w-auto" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
          <option value="">{t('assignments.allTypes')}</option>
          {TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <LoadingSpinner /> : assignments.length === 0 ? (
          <EmptyState icon={ClipboardList} title={t('assignments.noAssignments')} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <tr>
                    {HEADERS.map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {assignments.map(a => {
                    const mySub = mySubmissions[a.id]
                    return (
                      <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-xs">{a.description}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.course?.name}</td>
                        <td className="px-4 py-3">
                          <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 capitalize">{a.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar className={`w-3.5 h-3.5 ${isOverdue(a.due_date) ? 'text-red-500' : isDueSoon(a.due_date) ? 'text-orange-500' : 'text-gray-400'}`} />
                            <span className={`text-sm ${isOverdue(a.due_date) ? 'text-red-600 dark:text-red-400' : isDueSoon(a.due_date) ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300'}`}>
                              {formatDateTime(a.due_date)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.max_points} {t('assignments.pts')}</td>
                        <td className="px-4 py-3"><Badge status={a.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {/* Student: submit or show submission status */}
                            {isStudent && (
                              mySub ? (
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[mySub.status] || STATUS_COLOR.submitted}`}>
                                  <CheckSquare className="w-3 h-3" />
                                  {mySub.status === 'graded'
                                    ? `${mySub.points_earned}/${a.max_points} pts`
                                    : mySub.status}
                                </span>
                              ) : (
                                <button
                                  onClick={() => { setSubmitForm({ content: '', file: null }); setModal({ type: 'submit', assignment: a }) }}
                                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
                                >
                                  <Send className="w-3 h-3" /> Submit
                                </button>
                              )
                            )}
                            {/* Teacher / Admin: view submissions */}
                            {canEdit && (
                              <button
                                onClick={() => loadSubmissionsForAssignment(a)}
                                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-primary-600 transition-colors"
                                title="View submissions"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canEdit && (
                              <>
                                <button onClick={() => { setFormData({ course_id: a.course?.id, title: a.title, description: a.description || '', due_date: a.due_date?.slice(0,16), max_points: a.max_points, type: a.type }); setFormErrors({}); setModal({ type: 'edit', assignment: a }) }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 hover:text-primary-600 transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setModal({ type: 'delete', assignment: a })} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4"><Pagination meta={meta} onPageChange={setPage} /></div>
          </>
        )}
      </div>

      {/* Create / Edit */}
      <Modal open={modal?.type === 'create'} onClose={() => setModal(null)} title={t('assignments.createTitle')} size="lg">
        <AssignmentForm onSubmit={handleCreate} />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title={t('assignments.editTitle')} size="lg">
        <AssignmentForm onSubmit={handleUpdate} />
      </Modal>
      <ConfirmModal open={modal?.type === 'delete'} onClose={() => setModal(null)} onConfirm={handleDelete} loading={saving} title={t('assignments.deleteTitle')} message={`Delete "${modal?.assignment?.title}"? ${t('assignments.deleteConfirm')}`} />

      {/* Student Submit Modal */}
      <Modal open={modal?.type === 'submit'} onClose={() => setModal(null)} title={`Submit: ${modal?.assignment?.title}`} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">{modal?.assignment?.course?.name}</span>
            <span className="text-gray-500 dark:text-gray-400">Due: {formatDateTime(modal?.assignment?.due_date)}</span>
          </div>
          <div>
            <label className="label">Your Answer / Notes</label>
            <textarea
              className="input resize-none"
              rows={5}
              placeholder="Write your answer or notes here..."
              value={submitForm.content}
              onChange={e => setSubmitForm(p => ({ ...p, content: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Attach File <span className="text-gray-400 font-normal">(optional, max 20MB)</span></label>
            <input
              type="file"
              className="input py-1.5 text-sm"
              onChange={e => setSubmitForm(p => ({ ...p, file: e.target.files[0] || null }))}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={subLoading}>
              {subLoading ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Assignment</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Teacher: View & Grade Submissions Modal */}
      <Modal open={modal?.type === 'viewSubmissions'} onClose={() => setModal(null)} title={`Submissions: ${modal?.assignment?.title}`} size="xl">
        {subLoading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {(submissionsMap[modal?.assignment?.id] || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No submissions yet.</p>
            ) : (
              (submissionsMap[modal?.assignment?.id] || []).map(sub => (
                <div key={sub.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={sub.student?.user?.name} src={sub.student?.user?.avatar_url} size="sm" />
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{sub.student?.user?.name}</p>
                        <p className="text-xs text-gray-400">{sub.student?.student_id} · Submitted {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '—'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[sub.status] || STATUS_COLOR.submitted}`}>
                      {sub.status}
                    </span>
                  </div>

                  {sub.content && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{sub.content}</div>
                  )}
                  {sub.file_url && (
                    <a href={sub.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 hover:underline">
                      📎 Download attachment
                    </a>
                  )}
                  {sub.feedback && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300">
                      <strong>Feedback:</strong> {sub.feedback}
                    </div>
                  )}

                  {/* Grade form */}
                  {sub.status !== 'graded' ? (
                    modal.selectedSub?.id === sub.id ? (
                      <form onSubmit={handleGrade} className="mt-3 flex items-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                        <div>
                          <label className="label text-xs">Points (max {modal.assignment?.max_points})</label>
                          <input type="number" min={0} max={modal.assignment?.max_points} className="input w-24" value={gradeForm.points_earned} onChange={e => setGradeForm(p => ({ ...p, points_earned: e.target.value }))} required />
                        </div>
                        <div className="flex-1">
                          <label className="label text-xs">Feedback (optional)</label>
                          <input className="input" placeholder="Write feedback..." value={gradeForm.feedback} onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))} />
                        </div>
                        <button type="submit" className="btn-primary text-xs py-2" disabled={subLoading}>{subLoading ? 'Saving...' : 'Save Grade'}</button>
                        <button type="button" className="btn-secondary text-xs py-2" onClick={() => setModal(m => ({ ...m, selectedSub: null }))}>Cancel</button>
                      </form>
                    ) : (
                      <button onClick={() => setModal(m => ({ ...m, selectedSub: sub }))} className="mt-3 text-xs text-primary-600 hover:underline flex items-center gap-1 border-t border-gray-100 dark:border-gray-700 pt-3 w-full">
                        <CheckSquare className="w-3.5 h-3.5" /> Grade this submission
                      </button>
                    )
                  ) : (
                    <p className="mt-3 text-xs text-green-600 dark:text-green-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                      ✓ Graded: {sub.points_earned}/{modal.assignment?.max_points} pts
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
