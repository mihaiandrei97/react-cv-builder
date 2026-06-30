import { useEffect } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(34,34,34,0.35)',
  backdropFilter: 'blur(2px)',
}

const dialog: React.CSSProperties = {
  background: '#fffdf7',
  borderRadius: '0.6rem',
  boxShadow: '0 20px 50px rgba(34,34,34,0.25)',
  border: '1px solid var(--line)',
  padding: '1.5rem 1.75rem',
  maxWidth: 420,
  width: 'calc(100% - 2rem)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.1rem',
  fontWeight: 700,
  color: 'var(--ink)',
}

const messageStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9rem',
  lineHeight: 1.55,
  color: 'var(--muted)',
}

const actions: React.CSSProperties = {
  display: 'flex',
  gap: '0.6rem',
  justifyContent: 'flex-end',
}

const btnBase: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.88rem',
  fontWeight: 600,
  borderRadius: '0.3rem',
  padding: '0.5rem 1.1rem',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const btnCancel: React.CSSProperties = {
  ...btnBase,
  color: 'var(--muted)',
  background: 'transparent',
  border: '1px solid var(--line)',
}

const btnDanger: React.CSSProperties = {
  ...btnBase,
  color: '#fff',
  background: '#9c2f1f',
  border: 'none',
}

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  color: '#fff',
  background: 'var(--green)',
  border: 'none',
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel, onConfirm])

  if (!open) return null

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={dialog} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>{title}</h2>
        <p style={messageStyle}>{message}</p>
        <div style={actions}>
          <button type="button" style={btnCancel} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            style={danger ? btnDanger : btnPrimary}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}