import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 48, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--error)' }}>warning</span>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--on-surface)', marginTop: 16 }}>UI Crashed</h2>
          <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 8 }}>
            An unexpected error occurred in the React rendering tree.
          </p>
          <pre style={{ background: 'var(--error-container)', color: 'var(--error)', padding: 16, borderRadius: '4px', marginTop: 24, fontSize: 12, textAlign: 'left', overflowX: 'auto', border: '1px solid rgba(179, 71, 45, 0.3)' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: 24 }}>
            Reload Application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
