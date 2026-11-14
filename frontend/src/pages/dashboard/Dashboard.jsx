import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { dashboardAPI } from '../../api/index'
import StatsCard from '../../components/common/StatsCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import {
  Users, BookOpen, GraduationCap, TrendingUp, Clock,
  UserCheck, BarChart3, Activity, Award, CalendarCheck,
  ClipboardList, AlertCircle,
} from 'lucide-react'
import { formatDateTime, formatNumber } from '../../utils/helpers'
import { capitalize } from '../../utils/helpers'
import Badge from '../../components/common/Badge'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
// Fixed colours per attendance status so "present" is always green, "absent" always red
const ATTENDANCE_COLORS = { present: '#10b981', late: '#f59e0b', excused: '#3b82f6', absent: '#ef4444' }

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

function EmptyChart({ message }) {
  return (
    <div className="flex items-center justify-center h-40 text-sm text-gray-400 dark:text-gray-500">
      {message}
    </div>
  )
}

// ── Admin / Super Admin dashboard ──────────────────────────────────────────
function AdminDashboard({ stats, charts, activity }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title={t('dashboard.totalStudents')} value={formatNumber(stats?.total_students)}    icon={GraduationCap} color="blue"   />
        <StatsCard title={t('dashboard.totalTeachers')} value={formatNumber(stats?.total_teachers)}    icon={Users}         color="purple" />
        <StatsCard title={t('dashboard.activeCourses')} value={formatNumber(stats?.total_courses)}     icon={BookOpen}      color="green"  />
        <StatsCard title={t('dashboard.enrollments')}   value={formatNumber(stats?.total_enrollments)} icon={TrendingUp}    color="orange" />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title={t('dashboard.pendingApprovals')} value={formatNumber(stats?.pending_enrollments)}  icon={Clock}     color="red"    subtitle={t('dashboard.needAction')} />
        <StatsCard title={t('dashboard.avgAttendance')}    value={`${stats?.average_attendance_pct ?? 0}%`}  icon={UserCheck} color="teal"   />
        <StatsCard title={t('dashboard.averageGpa')}       value={stats?.average_gpa ?? '0.00'}               icon={BarChart3} color="green"  />
        <StatsCard title={t('dashboard.activeCourses')}    value={formatNumber(stats?.total_courses)}         icon={BookOpen}  color="blue"   />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollments over time */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('dashboard.monthlyEnrollments')}</h2>
          {charts?.enrollments_by_month?.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={charts.enrollments_by_month} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradEnroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:[stroke:#374151]" strokeOpacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fill="url(#gradEnroll)" name="Enrollments" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart message={t('dashboard.noData')} />}
        </div>

        {/* Grade distribution */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('dashboard.gradeDistribution')}</h2>
          {charts?.grade_distribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={charts.grade_distribution} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
                <XAxis dataKey="grade_letter" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="total" name="Students" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {charts.grade_distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message={t('dashboard.noData')} />}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance pie */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('dashboard.attendanceOverview')}</h2>
          {charts?.attendance_distribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie data={charts.attendance_distribution} dataKey="total" nameKey="status"
                  cx="50%" cy="50%" outerRadius={72} innerRadius={36}
                  paddingAngle={2}
                  label={({ name, percent }) => `${capitalize(name)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {charts.attendance_distribution.map((d, i) => (
                    <Cell key={i} fill={ATTENDANCE_COLORS[d.status] ?? COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart message={t('dashboard.noData')} />}
        </div>

        {/* Top courses */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('dashboard.topCourses')}</h2>
          {charts?.top_courses?.length > 0 ? (
            <div className="space-y-3">
              {charts.top_courses.map((course, i) => (
                <div key={course.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{course.code}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{course.approved_count}</span>
                </div>
              ))}
            </div>
          ) : <EmptyChart message={t('dashboard.noData')} />}
        </div>

        {/* Recent activity */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-500" /> {t('dashboard.recentActivity')}
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-52">
            {activity.length === 0
              ? <p className="text-sm text-gray-400 dark:text-gray-500">{t('dashboard.noActivity')}</p>
              : activity.map(log => (
                <div key={log.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary-700 dark:text-primary-300">{log.user?.name?.[0] ?? '?'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug line-clamp-2">{log.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(log.created_at)}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Teacher dashboard ──────────────────────────────────────────────────────
function TeacherDashboard({ stats, charts }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title={t('dashboard.myCourses')}         value={formatNumber(stats?.my_courses)}           icon={BookOpen}     color="blue"   />
        <StatsCard title={t('dashboard.myStudents')}        value={formatNumber(stats?.my_students)}          icon={Users}        color="purple" />
        <StatsCard title={t('dashboard.pendingGrades')}     value={formatNumber(stats?.pending_grades)}       icon={AlertCircle}  color="red"    subtitle={t('dashboard.needAction')} />
        <StatsCard title={t('dashboard.upcomingAssignments')} value={formatNumber(stats?.upcoming_assignments)} icon={ClipboardList} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment per course */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('dashboard.enrollmentByCourse')}</h2>
          {charts?.enrollment_by_course?.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={charts.enrollment_by_course} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
                <XAxis dataKey="code" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="approved_count" name="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message={t('dashboard.noData')} />}
        </div>

        {/* Grade distribution for my courses */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('dashboard.gradeDistribution')}</h2>
          {charts?.grade_distribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={charts.grade_distribution} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
                <XAxis dataKey="grade_letter" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="total" name="Students" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {charts.grade_distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message={t('dashboard.noData')} />}
        </div>
      </div>

      {/* Attendance by course */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('dashboard.attendanceByCourse')}</h2>
        {charts?.attendance_by_course?.length > 0 ? (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={charts.attendance_by_course} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
              <XAxis dataKey="code" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="present_count" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="absent_count"  name="Absent"  fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChart message={t('dashboard.noData')} />}
      </div>
    </div>
  )
}

// ── Student dashboard ──────────────────────────────────────────────────────
function StudentDashboard({ stats, charts, announcements }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title={t('dashboard.myCourses')}          value={formatNumber(stats?.my_courses)}       icon={BookOpen}    color="blue"   />
        <StatsCard title={t('dashboard.myGpa')}              value={stats?.my_gpa ?? '0.00'}               icon={Award}       color="green"  />
        <StatsCard title={t('dashboard.myAttendance')}       value={`${stats?.my_attendance ?? 0}%`}       icon={CalendarCheck} color="teal" />
        <StatsCard title={t('dashboard.pendingAssignments')} value={formatNumber(stats?.pending_assignments)} icon={ClipboardList} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grades by course */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('dashboard.myGrades')}</h2>
          {charts?.grades_by_course?.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={charts.grades_by_course} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
                <XAxis dataKey="course" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  formatter={(val, _, props) => [`${val} (${props.payload.letter})`, 'Score']} />
                <Bar dataKey="score" name="Score" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {charts.grades_by_course.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message={t('dashboard.noData')} />}
        </div>

        {/* Attendance breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('dashboard.attendanceOverview')}</h2>
          {charts?.attendance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie data={charts.attendance} dataKey="total" nameKey="status"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                  paddingAngle={3}
                  label={({ name, percent }) => `${capitalize(name)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {charts.attendance.map((d, i) => (
                    <Cell key={i} fill={ATTENDANCE_COLORS[d.status] ?? COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart message={t('dashboard.noData')} />}
        </div>
      </div>

      {/* Announcements */}
      {announcements?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-500" /> {t('nav.announcements')}
          </h2>
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{a.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard component ───────────────────────────────────────────────
export default function Dashboard() {
  const { user }  = useAuth()
  const { t }     = useTranslation()
  const [stats, setStats]             = useState(null)
  const [charts, setCharts]           = useState(null)
  const [activity, setActivity]       = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardAPI.stats(),
      dashboardAPI.charts(),
      dashboardAPI.recentActivity(),
    ]).then(([s, c, a]) => {
      setStats(s.data.stats)
      setCharts(c.data)
      setActivity(a.data.activity ?? [])
      setAnnouncements(a.data.announcements ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const role     = user?.role?.name
  const greeting = getGreeting()

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          {t(`dashboard.greeting.${greeting}`)}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-blue-100 mt-1 text-sm">
          {capitalize(role?.replace('_', ' '))} — {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {(role === 'super_admin' || role === 'admin') && (
        <AdminDashboard stats={stats} charts={charts} activity={activity} />
      )}
      {role === 'teacher' && (
        <TeacherDashboard stats={stats} charts={charts} />
      )}
      {role === 'student' && (
        <StudentDashboard stats={stats} charts={charts} announcements={announcements} />
      )}
    </div>
  )
}
