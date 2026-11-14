import { STATUS_COLORS } from '../../utils/constants'
import { capitalize } from '../../utils/helpers'

export default function Badge({ status, label, className = '' }) {
  const text  = label || capitalize(status)
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'

  return (
    <span className={`badge ${color} ${className}`}>
      {text}
    </span>
  )
}
