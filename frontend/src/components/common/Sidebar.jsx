import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import {
  GraduationCap, LayoutDashboard, Users, UserCheck, BookOpen,
  ClipboardList, BarChart3, Calendar, Megaphone, LogOut,
  ChevronRight, UserCircle, School
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',    key: 'dashboard',    icon: LayoutDashboard, roles: ['super_admin','admin','teacher','student'] },
  { to: '/users',        key: 'users',        icon: Users,           roles: ['super_admin','admin'] },
  { to: '/students',     key: 'students',     icon: UserCheck,       roles: ['super_admin','admin','teacher'] },
  { to: '/teachers',     key: 'teachers',     icon: School,          roles: ['super_admin','admin'] },
  { to: '/courses',      key: 'courses',      icon: BookOpen,        roles: ['super_admin','admin','teacher','student'] },
  { to: '/assignments',  key: 'assignments',  icon: ClipboardList,   roles: ['super_admin','admin','teacher','student'] },
  { to: '/grades',       key: 'grades',       icon: BarChart3,       roles: ['super_admin','admin','teacher','student'] },
  { to: '/attendance',   key: 'attendance',   icon: UserCheck,       roles: ['super_admin','admin','teacher','student'] },
  { to: '/schedules',    key: 'schedules',    icon: Calendar,        roles: ['super_admin','admin','teacher','student'] },
  { to: '/announcements',key: 'announcements',icon: Megaphone,       roles: ['super_admin','admin','teacher','student'] },
]

export default function Sidebar({ open }) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const roleName = user?.role?.name

  const filteredNav = NAV.filter(item => item.roles.includes(roleName))

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-30 flex flex-col
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm
        transition-all duration-200 ease-in-out
        ${open ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-16'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-700">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {open && <span className="font-bold text-gray-900 dark:text-white text-base">SCMS</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {filteredNav.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}
            `}
            title={!open ? t(`nav.${key}`) : undefined}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {open && <span className="flex-1">{t(`nav.${key}`)}</span>}
            {open && <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-2 space-y-0.5">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${isActive
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`
          }
        >
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
            : <UserCircle className="w-5 h-5 shrink-0" />
          }
          {open && (
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate capitalize">{user?.role?.display_name}</p>
            </div>
          )}
        </NavLink>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title={!open ? t('nav.logout') : undefined}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {open && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}
