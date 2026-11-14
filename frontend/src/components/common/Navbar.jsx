import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu, Bell, Search, ChevronDown, LogOut, UserCircle, Sun, Moon, Languages,
  Clock, CheckCircle, XCircle, Award, ClipboardList, Megaphone, UserPlus,
  Calendar, Info, AlertCircle, GraduationCap, BookOpen, X,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { notificationsAPI } from '../../api/index'
import api from '../../api/axios'

const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ar', label: 'ع',  name: 'العربية' },
]

const ICON_MAP = {
  'clock':          Clock,
  'check-circle':   CheckCircle,
  'x-circle':       XCircle,
  'award':          Award,
  'clipboard-list': ClipboardList,
  'clipboard':      ClipboardList,
  'megaphone':      Megaphone,
  'user-plus':      UserPlus,
  'calendar':       Calendar,
  'info':           Info,
}

const COLOR_MAP = {
  green:  'text-green-500  bg-green-50  dark:bg-green-900/30',
  red:    'text-red-500    bg-red-50    dark:bg-red-900/30',
  orange: 'text-orange-500 bg-orange-50 dark:bg-orange-900/30',
  blue:   'text-blue-500   bg-blue-50   dark:bg-blue-900/30',
  purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/30',
  gray:   'text-gray-500   bg-gray-100  dark:bg-gray-700',
}

const TYPE_ICON  = { student: UserCircle, teacher: GraduationCap, course: BookOpen }
const TYPE_COLOR = { student: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30', teacher: 'text-green-500 bg-green-50 dark:bg-green-900/30', course: 'text-purple-500 bg-purple-50 dark:bg-purple-900/30' }
const TYPE_LABEL = { student: 'Student', teacher: 'Teacher', course: 'Course' }

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function Navbar({ onToggleSidebar }) {
  const { user, logout }  = useAuth()
  const { dark, toggle }  = useTheme()
  const { t, i18n }       = useTranslation()
  const navigate          = useNavigate()

  const [userDrop, setUserDrop]     = useState(false)
  const [langDrop, setLangDrop]     = useState(false)
  const [notifOpen, setNotifOpen]   = useState(false)
  const [notifs, setNotifs]         = useState([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)

  const [searchOpen, setSearchOpen]       = useState(false)
  const [searchQuery, setSearchQuery]     = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchInputRef = useRef(null)
  const searchRef      = useRef(null)

  const userRef  = useRef(null)
  const langRef  = useRef(null)
  const notifRef = useRef(null)

  const LAST_SEEN_KEY = 'scms_notif_last_seen'
  const getLastSeen = () => parseInt(localStorage.getItem(LAST_SEEN_KEY) || '0', 10)
  const unreadCount = notifs.filter(n => new Date(n.created_at).getTime() > getLastSeen()).length

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true)
    try {
      const { data } = await notificationsAPI.list()
      setNotifs(data.notifications || [])
    } catch { /* silently fail */ }
    finally { setLoadingNotifs(false) }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current  && !userRef.current.contains(e.target))  setUserDrop(false)
      if (langRef.current  && !langRef.current.contains(e.target))  setLangDrop(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => searchInputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const debouncedQuery = useDebounce(searchQuery, 280)

  useEffect(() => {
    if (debouncedQuery.length < 2) { setSearchResults([]); return }
    setSearchLoading(true)
    api.get('/search', { params: { q: debouncedQuery } })
      .then(({ data }) => setSearchResults(data.results || []))
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false))
  }, [debouncedQuery])

  const openSearch = () => {
    setSearchOpen(true)
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }

  const handleSearchSelect = (link) => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
    navigate(link)
  }

  const openNotifications = () => {
    setNotifOpen(p => !p)
    if (!notifOpen) localStorage.setItem(LAST_SEEN_KEY, Date.now().toString())
  }

  const handleNotifClick = (link) => {
    setNotifOpen(false)
    navigate(link)
  }

  const currentLang = LANGS.find(l => l.code === i18n.language) || LANGS[0]

  const grouped = searchResults.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 px-6 sticky top-0 z-10 transition-colors duration-200">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md relative" ref={searchRef}>
        <button
          onClick={openSearch}
          className="relative w-full flex items-center gap-2 pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-400 dark:text-gray-500 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {t('common.search')}
          <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-mono">Ctrl K</span>
        </button>

        {searchOpen && (
          <div className="absolute top-full mt-1 left-0 w-full min-w-[420px] z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search students, teachers, courses..."
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchResults([]) }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No results for "{searchQuery}"</p>
                ) : searchQuery.length < 2 ? (
                  <p className="text-xs text-gray-400 text-center py-6">Type at least 2 characters to search</p>
                ) : (
                  Object.entries(grouped).map(([type, items]) => {
                    const Icon = TYPE_ICON[type] || AlertCircle
                    return (
                      <div key={type}>
                        <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-700/50">
                          {TYPE_LABEL[type]}s
                        </p>
                        {items.map(r => (
                          <button
                            key={`${r.type}-${r.id}`}
                            onClick={() => handleSearchSelect(r.link)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${TYPE_COLOR[type]}`}>
                              {r.avatar
                                ? <img src={r.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                : <Icon className="w-4 h-4" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.label}</p>
                              <p className="text-xs text-gray-400 truncate">{r.sub}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Dark mode toggle */}
        <button onClick={toggle} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors" aria-label="Toggle dark mode">
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Language switcher */}
        <div className="relative" ref={langRef}>
          <button onClick={() => setLangDrop(p => !p)} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors text-sm font-medium">
            <Languages className="w-4 h-4" />
            <span>{currentLang.label}</span>
          </button>
          {langDrop && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              {LANGS.map(lang => (
                <button key={lang.code} onClick={() => { i18n.changeLanguage(lang.code); setLangDrop(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${i18n.language === lang.code ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <span className="font-mono font-bold w-5 text-center">{lang.label}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button onClick={openNotifications} className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-1 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {notifs.length > 0 && (
                  <button onClick={() => { localStorage.setItem(LAST_SEEN_KEY, Date.now().toString()); setNotifs([...notifs]) }} className="text-xs text-primary-600 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loadingNotifs ? (
                  <div className="flex items-center justify-center py-8"><div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : notifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                    <Bell className="w-8 h-8 mb-2 opacity-40" /><p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifs.map(n => {
                    const IconComp = ICON_MAP[n.icon] || AlertCircle
                    const colorCls = COLOR_MAP[n.color] || COLOR_MAP.gray
                    const isUnread = new Date(n.created_at).getTime() > getLastSeen()
                    return (
                      <button key={n.id} onClick={() => handleNotifClick(n.link)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${isUnread ? 'bg-primary-50/40 dark:bg-primary-900/10' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colorCls}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{n.title}</p>
                            {isUnread && <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{n.message}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
              {notifs.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <button onClick={() => { setNotifOpen(false); fetchNotifications() }} className="w-full text-xs text-center text-primary-600 hover:underline">Refresh</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button onClick={() => setUserDrop(p => !p)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              : <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">{user?.name?.[0]?.toUpperCase()}</div>
            }
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.display_name}</p>
            </div>
            <ChevronDown className="hidden md:block w-4 h-4 text-gray-400" />
          </button>

          {userDrop && (
            <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <Link to="/profile" onClick={() => setUserDrop(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <UserCircle className="w-4 h-4" /> {t('nav.profile')}
              </Link>
              <hr className="my-1 border-gray-100 dark:border-gray-700" />
              <button onClick={() => { setUserDrop(false); logout() }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut className="w-4 h-4" /> {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
