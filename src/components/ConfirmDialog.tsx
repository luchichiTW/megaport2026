import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmDialogProps {
  title: string
  message?: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const [closing, setClosing] = useState(false)
  const dismiss = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 220)
  }, [onClose])
  const handleConfirm = useCallback(() => {
    setClosing(true)
    setTimeout(() => { onClose(); onConfirm() }, 220)
  }, [onClose, onConfirm])
  return createPortal(
    <div className="confirm-backdrop"
      style={closing ? { animation: "fadeOut .22s ease-out forwards" } : {}}
      onClick={dismiss}
    >
      <div className="confirm-dialog"
        style={closing ? { animation: "dialogOut .22s var(--ease-out) forwards" } : {}}
        onClick={e => e.stopPropagation()}
      >
        <div className="confirm-body">
          <div className="confirm-title">{title}</div>
          {message && <div className="confirm-msg">{message}</div>}
        </div>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={dismiss}>取消</button>
          <button className="confirm-destructive" onClick={handleConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
