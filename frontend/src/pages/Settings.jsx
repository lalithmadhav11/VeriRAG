import { useState } from 'react'
import { getHealth } from '../api'

function SettingRow({ label, description, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--outline-variant)', gap: 32 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--on-surface)', marginBottom: 4 }}>{label}</div>
        {description && <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0, width: 280 }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', padding: '10px 14px' }}
        />
      </div>
    </div>
  )
}

export default function Settings() {
  const [backendUrl, setBackendUrl] = useState('http://localhost:8080')
  const [pingResult, setPingResult] = useState(null)
  const [pinging, setPinging] = useState(false)

  const ping = async () => {
    setPinging(true)
    setPingResult(null)
    try {
      const res = await getHealth()
      setPingResult({ ok: true, data: res.data })
    } catch (err) {
      setPingResult({ ok: false, error: err.message })
    } finally {
      setPinging(false)
    }
  }

  return (
    <div style={{ padding: '48px', maxWidth: 880, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>Settings</h2>
        <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginTop: 8 }}>
          Frontend configuration and connection diagnostics.
        </p>
      </div>

      {/* Connection */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: 'var(--on-surface)' }}>Backend Connection</h3>
        </div>
        <div style={{ padding: '0 24px 12px' }}>
          <SettingRow
            label="API Base URL"
            description="The backend server URL. By default the Vite dev server proxies /api to localhost:8080."
            value={backendUrl}
            onChange={setBackendUrl}
            placeholder="http://localhost:8080"
          />
          <div style={{ paddingTop: 20, paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={ping} disabled={pinging} className="btn btn-primary" style={{ padding: '10px 20px' }}>
              {pinging ? <div className="spinner" style={{ width: 16, height: 16, borderTopColor: 'var(--on-primary)', borderColor: 'rgba(255,255,255,0.3)' }} /> : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>wifi</span>}
              {pinging ? 'Pinging...' : 'Test Connection'}
            </button>
            {pingResult && (
              <span style={{ fontSize: 14, fontWeight: 500, color: pingResult.ok ? 'var(--on-surface)' : 'var(--error)' }}>
                {pingResult.ok ? `✓ Connected · ${pingResult.data.ts}` : `✗ ${pingResult.error}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Architecture info */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: 'var(--on-surface)' }}>Stack Information</h3>
        </div>
        <div style={{ padding: '12px 24px' }}>
          {[
            ['Frontend', 'React 19 + Vite + Axios'],
            ['Backend', 'Express + Node.js (Port 8080)'],
            ['Agent', 'LangGraph StateGraph + gpt-4o-mini'],
            ['Vector Store', 'ChromaDB (text-embedding-3-small)'],
            ['Queue', 'BullMQ + Redis (exponential backoff)'],
            ['Database', 'MongoDB (QueryHistory + Document)'],

          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--outline-variant)', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--on-surface)' }}>{k}</span>
              <span style={{ fontSize: 15, color: 'var(--on-surface-variant)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* API endpoints reference */}
      <div className="card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: 'var(--on-surface)' }}>API Endpoints</h3>
        </div>
        <div style={{ padding: '12px 24px' }}>
          {[
            ['GET', '/api/health', 'Server health check'],
            ['POST', '/api/ingest/pdf', 'Upload and index a PDF'],
            ['POST', '/api/query', 'Synchronous vector search'],
            ['POST', '/api/query/async', 'Enqueue async agent query'],
            ['GET', '/api/query/status/:id', 'Poll job status'],
            ['GET', '/api/query/history', 'Paginated query history'],
          ].map(([method, path, desc]) => (
            <div key={path} style={{ display: 'grid', gridTemplateColumns: '64px 240px 1fr', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--outline-variant)', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: '4px', background: method === 'GET' ? 'rgba(209, 199, 183, 0.2)' : 'var(--on-surface)', color: method === 'GET' ? 'var(--on-surface)' : 'var(--on-primary)', textAlign: 'center' }}>
                {method}
              </span>
              <code style={{ fontSize: 14, color: 'var(--on-surface)' }}>{path}</code>
              <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
