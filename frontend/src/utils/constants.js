export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN:       'admin',
  TEACHER:     'teacher',
  STUDENT:     'student',
}

export const STATUS_COLORS = {
  active:     'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  inactive:   'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  pending:    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  approved:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  rejected:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  dropped:    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  graduated:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  suspended:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  submitted:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  graded:     'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  late:       'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  present:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  absent:     'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  excused:    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  completed:  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
}

export const GRADE_COLORS = {
  'A+': 'text-green-600', 'A': 'text-green-600', 'A-': 'text-green-500',
  'B+': 'text-blue-600',  'B': 'text-blue-600',  'B-': 'text-blue-500',
  'C+': 'text-yellow-600','C': 'text-yellow-600','C-': 'text-yellow-500',
  'D':  'text-orange-600',
  'F':  'text-red-600',
}

export const DAY_ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
export const DAY_LABELS = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' }

export const PER_PAGE_OPTIONS = [10, 15, 25, 50]
