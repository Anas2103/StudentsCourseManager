import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirm Action'} size="sm">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{message || 'Are you sure you want to proceed? This action cannot be undone.'}</p>
        <div className="flex gap-3 w-full mt-2">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center" disabled={loading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 btn-danger justify-center" disabled={loading}>
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
