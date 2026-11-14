import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { coursesAPI, enrollmentsAPI } from '../../api/index'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Users, BookOpen, Clock, Award, LogIn, CheckCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CourseDetail() {
  const { id }   = useParams()
  const { t }    = useTranslation()
  const { user } = useAuth()
  const [course, setCourse]           = useState(null)
  const [students, setStudents]       = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState('students')
  const [enrollStatus, setEnrollStatus] = useState(null)  // null | 'pending' | 'approved' | 'rejected'
  const [enrolling, setEnrolling]     = useState(false)

  const isStudent = user?.role?.name === 'student'

  useEffect(() => {
    Promise.all([
      coursesAPI.show(id),
      coursesAPI.students(id),
      coursesAPI.assignments(id),
    ]).then(([c, s, a]) => {
      setCourse(c.data.course)
      setStudents(s.data.students)
      setAssignments(a.data.assignments)
    }).finally(() => setLoading(false))

    // Check if current student is already enrolled
    if (isStudent) {
      enrollmentsAPI.list({ per_page: 100 }).then(({ data }) => {
        const enrs = data.enrollments?.data || []
        const mine = enrs.find(e => String(e.course?.id) === String(id))
        if (mine) setEnrollStatus(mine.status)
      }).catch(() => {})
    }
  }, [id, isStudent])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await enrollmentsAPI.create({ course_id: parseInt(id) })
      setEnrollStatus('pending')
      toast.success('Enrollment request submitted! Waiting for approval.')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to enroll.'
      toast.error(msg)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!course)  return <p className="text-center py-16 text-gray-500 dark:text-gray-400">{t('courses.notFound')}</p>

  return (
    <div className="space-y-6">
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
        <ArrowLeft className="w-4 h-4" /> {t('courses.backToCourses')}
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-primary-600 font-mono bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">{course.code}</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{course.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{course.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={course.status} />
            {isStudent && (
              enrollStatus === 'approved' ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg">
                  <CheckCircle className="w-4 h-4" /> Enrolled
                </span>
              ) : enrollStatus === 'pending' ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" /> Pending Approval
                </span>
              ) : enrollStatus === 'rejected' ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-lg">
                  Enrollment Rejected
                </span>
              ) : course.status === 'active' ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="flex items-center gap-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 px-4 py-1.5 rounded-lg transition-colors"
                >
                  {enrolling ? <Loader className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {enrolling ? 'Enrolling...' : 'Enroll'}
                </button>
              ) : null
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Award className="w-4 h-4 text-gray-400" /> {course.credits} {t('courses.credits')}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Users className="w-4 h-4 text-gray-400" /> {course.enrolled_count}/{course.max_students} {t('courses.enrolled')}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><BookOpen className="w-4 h-4 text-gray-400" /> {course.department?.name ?? '—'}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Clock className="w-4 h-4 text-gray-400" /> {course.semester?.name ?? '—'}</div>
        </div>
        {course.teachers?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t('courses.instructors')}</p>
            <div className="flex flex-wrap gap-3">
              {course.teachers.map(teacher => (
                <div key={teacher.id} className="flex items-center gap-2">
                  <Avatar name={teacher.user?.name} src={teacher.user?.avatar_url} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{teacher.user?.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{teacher.specialization}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          {['students','assignments'].map(tab_name => (
            <button key={tab_name} onClick={() => setTab(tab_name)} className={`px-5 py-3 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab === tab_name ? 'text-primary-600 border-primary-600' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200'}`}>
              {t(`courses.${tab_name}`)} {tab_name === 'students' ? `(${students.length})` : `(${assignments.length})`}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === 'students' && (
            <div className="space-y-2">
              {students.length === 0
                ? <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">{t('courses.noStudents')}</p>
                : students.map(s => (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <Avatar name={s.user?.name} src={s.user?.avatar_url} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.user?.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{s.student_id}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
          {tab === 'assignments' && (
            <div className="space-y-2">
              {assignments.length === 0
                ? <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">{t('courses.noAssignments')}</p>
                : assignments.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Due: {new Date(a.due_date).toLocaleDateString()} · {a.max_points} pts</p>
                    </div>
                    <Badge status={a.status} />
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
