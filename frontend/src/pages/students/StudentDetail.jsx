import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { studentsAPI } from '../../api/index'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Mail, Phone, BookOpen, BarChart3, UserCheck, Printer } from 'lucide-react'
import { formatDate, formatNumber } from '../../utils/helpers'
import { GRADE_COLORS } from '../../utils/constants'

export default function StudentDetail() {
  const { id }   = useParams()
  const { t }    = useTranslation()
  const [student, setStudent]     = useState(null)
  const [grades, setGrades]       = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('courses')
  const [showTranscript, setShowTranscript] = useState(false)
  const printRef = useRef(null)

  useEffect(() => {
    Promise.all([
      studentsAPI.show(id),
      studentsAPI.grades(id),
      studentsAPI.attendance(id),
    ]).then(([s, g, a]) => {
      setStudent(s.data.student)
      setGrades(g.data.grades)
      setAttendance(a.data.attendance)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!student) return <p className="text-center py-16 text-gray-500 dark:text-gray-400">{t('students.notFound')}</p>

  const attendancePct = attendance.length
    ? Math.round((attendance.filter(a => ['present','late'].includes(a.status)).length / attendance.length) * 100)
    : 0

  const TABS = ['courses', 'grades', 'attendance']

  const handlePrint = () => {
    const content = printRef.current?.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>Academic Transcript — ${student.user?.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          h2 { font-size: 15px; color: #444; margin: 20px 0 10px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #f5f5f5; text-align: left; padding: 8px 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
          td { padding: 8px 10px; border-bottom: 1px solid #eee; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #333; }
          .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
          .info-item { background: #f9f9f9; padding: 10px; border-radius: 6px; }
          .info-item .label { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 3px; }
          .info-item .value { font-size: 15px; font-weight: bold; }
          .grade-A { color: #16a34a; } .grade-B { color: #2563eb; } .grade-C { color: #d97706; } .grade-D, .grade-F { color: #dc2626; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 11px; color: #888; display: flex; justify-content: space-between; }
        </style>
      </head><body>${content}</body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  const absences = attendance.filter(a => a.status === 'absent').length

  return (
    <div className="space-y-6">
      <Link to="/students" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
        <ArrowLeft className="w-4 h-4" /> {t('students.backToList')}
      </Link>

      {/* Profile card */}
      <div className="card p-6 flex flex-col sm:flex-row gap-6">
        <Avatar name={student.user?.name} src={student.user?.avatar_url} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{student.user?.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{student.student_id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge status={student.status} />
              <button
                onClick={() => setShowTranscript(true)}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Printer className="w-4 h-4" /> Transcript
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Mail className="w-4 h-4 text-gray-400" />{student.user?.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Phone className="w-4 h-4 text-gray-400" />{student.user?.phone || '—'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">{t('students.dept')}:</span> {student.department?.name ?? '—'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">{t('students.enrolled')}:</span> {formatDate(student.enrollment_date)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <BookOpen className="w-7 h-7 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.enrollments?.length ?? 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('students.coursesEnrolled')}</p>
        </div>
        <div className="card p-5 text-center">
          <BarChart3 className="w-7 h-7 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.gpa}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('students.currentGpa')}</p>
        </div>
        <div className="card p-5 text-center">
          <UserCheck className="w-7 h-7 text-teal-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendancePct}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('students.attendanceRate')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          {TABS.map(tab_name => (
            <button
              key={tab_name}
              onClick={() => setTab(tab_name)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === tab_name
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t(`students.${tab_name}`)}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'courses' && (
            <div className="space-y-3">
              {!student.enrollments?.length
                ? <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">{t('students.noEnrollments')}</p>
                : student.enrollments.map(e => (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{e.course?.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{e.course?.code}</p>
                    </div>
                    <Badge status={e.status} />
                  </div>
                ))
              }
            </div>
          )}

          {tab === 'grades' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {[t('grades.course'), t('grades.midterm'), t('grades.final'), t('grades.assignments'), t('grades.attendance'), t('grades.total'), t('grades.grade')].map(h => (
                      <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 dark:text-gray-300">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {grades.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{g.course?.name}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{g.midterm_score}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{g.final_score}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{g.assignments_score}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{g.attendance_score}</td>
                      <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{g.total_score}</td>
                      <td className="px-3 py-2">
                        <span className={`font-bold ${GRADE_COLORS[g.grade_letter] || 'text-gray-600'}`}>{g.grade_letter}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'attendance' && (
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    {[t('attendance.course'), t('attendance.date'), t('attendance.status'), t('attendance.notes')].map(h => (
                      <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 dark:text-gray-300">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {attendance.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{a.course?.name}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{formatDate(a.date)}</td>
                      <td className="px-3 py-2"><Badge status={a.status} /></td>
                      <td className="px-3 py-2 text-gray-400 dark:text-gray-500">{a.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transcript Modal */}
      <Modal open={showTranscript} onClose={() => setShowTranscript(false)} title="Academic Transcript" size="xl">
        <div className="flex justify-end mb-4">
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>

        {/* Printable content */}
        <div ref={printRef} className="bg-white text-gray-900 p-6 rounded-lg border border-gray-200 text-sm">
          {/* Header */}
          <div className="header flex justify-between items-start pb-4 mb-6 border-b-2 border-gray-800">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Student Academic Transcript</h1>
              <p className="text-gray-500 mt-1">SCMS — Student Course Management System</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>Issued: {new Date().toLocaleDateString()}</p>
              <p>Ref: {student.student_id}</p>
            </div>
          </div>

          {/* Student info */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Full Name',    value: student.user?.name },
              { label: 'Student ID',   value: student.student_id },
              { label: 'Department',   value: student.department?.name ?? '—' },
              { label: 'Email',        value: student.user?.email },
              { label: 'Enrolled',     value: formatDate(student.enrollment_date) },
              { label: 'Status',       value: student.status?.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                <p className="font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Academic summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-extrabold text-blue-700">{student.gpa}</p>
              <p className="text-xs text-blue-500 uppercase mt-1">Cumulative GPA</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-extrabold text-green-700">{attendancePct}%</p>
              <p className="text-xs text-green-500 uppercase mt-1">Attendance Rate</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-extrabold text-purple-700">{grades.length}</p>
              <p className="text-xs text-purple-500 uppercase mt-1">Courses Completed</p>
            </div>
          </div>

          {/* Grades table */}
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b border-gray-200">Course Grades</h2>
          {grades.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No grades recorded.</p>
          ) : (
            <table className="w-full text-sm border-collapse mb-6">
              <thead>
                <tr className="bg-gray-100">
                  {['Course', 'Code', 'Midterm', 'Final', 'Assignments', 'Attendance', 'Total', 'Grade'].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-gray-600 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={g.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 font-medium text-gray-900">{g.course?.name}</td>
                    <td className="px-3 py-2 text-gray-500 font-mono text-xs">{g.course?.code}</td>
                    <td className="px-3 py-2 text-center">{g.midterm_score}</td>
                    <td className="px-3 py-2 text-center">{g.final_score}</td>
                    <td className="px-3 py-2 text-center">{g.assignments_score}</td>
                    <td className="px-3 py-2 text-center">{g.attendance_score}</td>
                    <td className="px-3 py-2 text-center font-bold">{g.total_score}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-extrabold text-base ${GRADE_COLORS[g.grade_letter] || 'text-gray-600'}`}>{g.grade_letter}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Attendance summary */}
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b border-gray-200">Attendance Summary</h2>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {['present','late','absent','excused'].map(s => {
              const count = attendance.filter(a => a.status === s).length
              const colors = { present: 'bg-green-50 text-green-700', late: 'bg-orange-50 text-orange-700', absent: 'bg-red-50 text-red-700', excused: 'bg-blue-50 text-blue-700' }
              return (
                <div key={s} className={`p-3 rounded-lg text-center ${colors[s]}`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs capitalize mt-1">{s}</p>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-400">
            <span>This transcript is computer-generated and valid without a signature.</span>
            <span>SCMS · {new Date().getFullYear()}</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}
