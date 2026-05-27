import { useState, useEffect } from 'react'
import { getHealth, getQueryHistory } from '../api'

function StatCard({ icon, label, value, sub, pulse }) {
  return (
    <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '4px',
          background: 'rgba(209, 199, 183, 0.2)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>{icon}</span>
        </div>
        {pulse && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'pulse-ring 2s ease-in-out infinite' }} />
            Live
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 600, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function ServiceStatus({ name, sub, icon, status, latency }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--outline-variant)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '4px', background: 'rgba(209, 199, 183, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--on-surface)' }}>{icon}</span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: status === 'online' ? 'var(--on-surface)' : status === 'checking' ? 'var(--on-surface-variant)' : 'var(--error)'
        }}>{latency}</div>
        <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>
          {status === 'online' ? 'Operational' : status === 'checking' ? 'Checking...' : 'Unreachable'}
        </div>
      </div>
    </div>
  )
}

function PipelineFlow() {
  const nodes = [
    { icon: 'upload_file', label: 'Ingest', sub: 'Raw Data' },
    { icon: 'cut', label: 'Chunk', sub: 'Semantic Split' },
    { icon: 'transform', label: 'Embed', sub: 'Vectorization', accent: true },
    { icon: 'dns', label: 'Store', sub: 'ChromaDB' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '32px 16px' }}>
      {nodes.map((node, i) => (
        <div key={node.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 2 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '8px',
              background: node.accent ? 'var(--primary)' : 'var(--surface)',
              border: `1px solid ${node.accent ? 'var(--primary)' : 'var(--outline)'}`,
              boxShadow: 'var(--shadow-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: node.accent ? 'var(--on-primary)' : 'var(--on-surface)' }}>{node.icon}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>{node.label}</div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{node.sub}</div>
            </div>
          </div>
          {i < nodes.length - 1 && (
            <div style={{ flex: 1, height: 1, background: 'var(--outline-variant)', margin: '0 12px', marginBottom: 32, position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 16, color: 'var(--outline)', background: 'var(--surface)', padding: '0 4px' }}>arrow_forward</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard({ setPage }) {
  const [health, setHealth] = useState('checking')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    getHealth()
      .then(() => setHealth('online'))
      .catch(() => setHealth('offline'))

    getQueryHistory(1, 5)
      .then(res => setHistory(res.data.records || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false))
  }, [])

  const completed = history.filter(r => r.status === 'completed').length
  const flagged = history.filter(r => r.flagged).length
  const webFallbacks = history.filter(r => r.usedWebFallback).length

  return (
    <div style={{ padding: '48px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Page header */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>System Overview</h2>
        <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginTop: 8 }}>
          Real-time telemetry and operational status for your RAG hallucination firewall.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        <StatCard icon="dataset" label="Total Queries" value={history.length || '—'} sub="All time" />
        <StatCard icon="check_circle" label="Completed" value={completed || '—'} sub="Successfully processed" />
        <StatCard icon="policy" label="Flagged" value={flagged || '—'} sub="Potential hallucinations" pulse />
        <StatCard icon="travel_explore" label="Web Fallbacks" value={webFallbacks || '—'} sub="Tavily searches used" />
      </div>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24, marginBottom: 32 }}>
        {/* System Health */}
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--on-surface)' }}>System Health</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px', borderRadius: '4px', background: health === 'online' ? 'rgba(209, 199, 183, 0.2)' : 'var(--error-container)', color: health === 'online' ? 'var(--on-surface)' : 'var(--error)', border: `1px solid ${health === 'online' ? 'var(--outline-variant)' : 'rgba(179, 71, 45, 0.3)'}` }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: health === 'online' ? 'var(--on-surface)' : 'var(--error)', display: 'inline-block', ...(health === 'online' ? { animation: 'pulse-ring 2s ease-in-out infinite' } : {}) }} />
              {health === 'online' ? 'All Systems OK' : health === 'checking' ? 'Checking...' : 'Backend Down'}
            </span>
          </div>
          <div style={{ padding: '8px 24px 24px' }}>
            <ServiceStatus name="Backend API" sub="Express + Node.js" icon="api" status={health} latency={health === 'online' ? '<10ms' : '—'} />
            <ServiceStatus name="ChromaDB" sub="Vector Store" icon="dns" status="checking" latency="~12ms" />
            <ServiceStatus name="MongoDB" sub="Document Metadata" icon="storage" status="checking" latency="~8ms" />
            <ServiceStatus name="Redis / BullMQ" sub="Ingestion Queue" icon="queue" status="checking" latency="~1ms" />
          </div>
        </div>

        {/* Pipeline architecture */}
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--outline-variant)' }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--on-surface)' }}>Pipeline Architecture</span>
          </div>
          <div style={{ background: 'var(--background)' }}>
            <PipelineFlow />
          </div>
        </div>
      </div>

      {/* Recent queries */}
      <div className="card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--on-surface)' }}>Recent Query Activity</span>
          <button onClick={() => setPage('history')} style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
            View All →
          </button>
        </div>

        {historyLoading ? (
          <div style={{ padding: '24px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div className="skeleton" style={{ width: '100%', height: 48, borderRadius: 8 }} />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '64px 24px', color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline)' }}>history</span>
            <p style={{ fontSize: 16 }}>No queries yet. Try the Chat Workspace to get started.</p>
            <button className="btn btn-primary" onClick={() => setPage('chat')}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat</span>
              Open Chat
            </button>
          </div>
        ) : (
          history.map((record, i) => (
            <div key={record.jobId || i} style={{
              padding: '16px 24px',
              borderBottom: i < history.length - 1 ? '1px solid var(--outline-variant)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
              transition: 'background 0.15s',
              ...(record.flagged ? { borderLeft: '4px solid var(--error)', background: 'var(--error-container)' } : {})
            }}
              onMouseEnter={e => e.currentTarget.style.background = record.flagged ? 'var(--error-container)' : 'rgba(209, 199, 183, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = record.flagged ? 'var(--error-container)' : 'transparent'}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  "{record.query}"
                </div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4, display: 'flex', gap: 12 }}>
                  <span>{new Date(record.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>Job: {record.jobId?.slice(0, 8)}…</span>
                </div>
              </div>
              <div style={{ display: 'flex', align: 'center', gap: 8, flexShrink: 0 }}>
                {record.flagged && (
                  <span className="badge badge-error">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                    Flagged
                  </span>
                )}
                {record.usedWebFallback && (
                  <span className="badge badge-success">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>travel_explore</span>
                    Web
                  </span>
                )}
                <span className="badge" style={{
                  background: record.status === 'completed' ? 'rgba(209, 199, 183, 0.2)' : 'var(--outline-variant)',
                  color: 'var(--on-surface)',
                  border: '1px solid var(--outline-variant)'
                }}>
                  {record.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
