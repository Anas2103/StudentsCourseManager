export default function StatsCard({ title, value, icon: Icon, color = 'blue', subtitle, trend }) {
  const colors = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',   text: 'text-blue-600 dark:text-blue-400' },
    green:  { bg: 'bg-green-50 dark:bg-green-900/20',  icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',  text: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400', text: 'text-purple-600 dark:text-purple-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400', text: 'text-orange-600 dark:text-orange-400' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/20',    icon: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',      text: 'text-red-600 dark:text-red-400' },
    teal:   { bg: 'bg-teal-50 dark:bg-teal-900/20',   icon: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400',    text: 'text-teal-600 dark:text-teal-400' },
  }
  const c = colors[color] || colors.blue

  return (
    <div className={`card p-5 ${c.bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )
}
