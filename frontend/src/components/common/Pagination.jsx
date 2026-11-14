import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Pagination({ meta, onPageChange }) {
  const { t } = useTranslation()
  if (!meta || meta.last_page <= 1) return null

  const { current_page, last_page, from, to, total } = meta

  return (
    <div className="flex items-center justify-between px-1 py-3 border-t border-gray-100 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('common.showing')} <span className="font-medium text-gray-900 dark:text-white">{from}</span>–<span className="font-medium text-gray-900 dark:text-white">{to}</span>{' '}
        {t('common.of')} <span className="font-medium text-gray-900 dark:text-white">{total}</span> {t('common.results')}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: Math.min(last_page, 7) }, (_, i) => {
          let page
          if (last_page <= 7)              page = i + 1
          else if (current_page <= 4)      page = i + 1
          else if (current_page >= last_page - 3) page = last_page - 6 + i
          else                             page = current_page - 3 + i

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                page === current_page
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          )
        })}

        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
