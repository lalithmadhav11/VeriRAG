import { useState } from 'react'
import './index.css'
import { Sidebar } from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Documents from './pages/Documents'
import History from './pages/History'
import Settings from './pages/Settings'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/ToastProvider'

export default function App() {
  const [page, setPage] = useState('dashboard')

  const pages = {
    dashboard: Dashboard,
    chat:      Chat,
    documents: Documents,
    history:   History,
    settings:  Settings,
  }

  const PageComponent = pages[page] || Dashboard

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
          <Sidebar page={page} setPage={setPage} />

          {/* Page content */}
          <div style={{ flex: 1, marginLeft: 256, height: '100vh', overflowY: page === 'chat' ? 'hidden' : 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <PageComponent setPage={setPage} />
          </div>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  )
}
