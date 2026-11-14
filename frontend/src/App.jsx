import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'
import ErrorBoundary from './components/common/ErrorBoundary'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import NotFound from './pages/NotFound'

// Dashboard
import Dashboard from './pages/dashboard/Dashboard'

// Management pages
import Users from './pages/users/Users'
import Students from './pages/students/Students'
import StudentDetail from './pages/students/StudentDetail'
import Teachers from './pages/teachers/Teachers'
import Courses from './pages/courses/Courses'
import CourseDetail from './pages/courses/CourseDetail'
import Assignments from './pages/assignments/Assignments'
import Grades from './pages/grades/Grades'
import Attendance from './pages/attendance/Attendance'
import Schedules from './pages/schedules/Schedules'
import Announcements from './pages/announcements/Announcements'
import Profile from './pages/profile/Profile'
import Landing from './pages/landing/Landing'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login"           element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register"        element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
      </Route>

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"              element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="/profile"                element={<ErrorBoundary><Profile /></ErrorBoundary>} />
          <Route path="/users"                  element={<ErrorBoundary><Users /></ErrorBoundary>} />
          <Route path="/students"               element={<ErrorBoundary><Students /></ErrorBoundary>} />
          <Route path="/students/:id"           element={<ErrorBoundary><StudentDetail /></ErrorBoundary>} />
          <Route path="/teachers"               element={<ErrorBoundary><Teachers /></ErrorBoundary>} />
          <Route path="/courses"                element={<ErrorBoundary><Courses /></ErrorBoundary>} />
          <Route path="/courses/:id"            element={<ErrorBoundary><CourseDetail /></ErrorBoundary>} />
          <Route path="/assignments"            element={<ErrorBoundary><Assignments /></ErrorBoundary>} />
          <Route path="/grades"                 element={<ErrorBoundary><Grades /></ErrorBoundary>} />
          <Route path="/attendance"             element={<ErrorBoundary><Attendance /></ErrorBoundary>} />
          <Route path="/schedules"              element={<ErrorBoundary><Schedules /></ErrorBoundary>} />
          <Route path="/announcements"          element={<ErrorBoundary><Announcements /></ErrorBoundary>} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
