import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 12
      }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} style={{
            background: t.type === 'error' ? 'var(--error-container)' : 'var(--surface)',
            border: `1px solid ${t.type === 'error' ? 'rgba(179, 71, 45, 0.3)' : 'var(--outline-variant)'}`,
            borderLeft: `4px solid ${t.type === 'error' ? 'var(--error)' : 'var(--primary)'}`,
            padding: '12px 20px', borderRadius: '4px',
            boxShadow: 'var(--shadow-md)',
            color: t.type === 'error' ? 'var(--error)' : 'var(--on-surface)',
            fontSize: 14, fontWeight: 500,
            animation: 'fade-in-up 0.3s ease forwards',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {t.type === 'error' ? 'error' : 'info'}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
