import { getInitials } from '../../utils/helpers'

const COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
]

function colorForName(name = '') {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function Avatar({ name, src, size = 'md', className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' }
  const cls   = `${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${className}`

  if (src) {
    return <img src={src} alt={name} className={`${cls} object-cover`} />
  }

  return (
    <div className={`${cls} ${colorForName(name)}`}>
      {getInitials(name)}
    </div>
  )
}
