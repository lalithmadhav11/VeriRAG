import { useState, useEffect } from 'react'
import { getQueryHistory } from '../api'

function StatusBadge({ status }) {
  const cfg = {
    completed: { bg: 'rgba(209, 199, 183, 0.2)', color: 'var(--on-surface)', border: 'var(--outline-variant)' },
    failed:    { bg: 'var(--error-container)', color: 'var(--error)', border: 'rgba(179, 71, 45, 0.3)' },
    pending:   { bg: 'transparent', color: 'var(--on-surface-variant)', border: 'var(--outline-variant)' },
    processing:{ bg: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: 'var(--outline)' },
  }
  const c = cfg[status] || cfg.pending
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: '4px', background: c.bg, color: c.color, border: `1px solid ${c.border}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {status}
    </span>
  )
}

function QueryDetail({ record, onClose }) {
  const score = record.hallucinationScore
  const pct = score != null ? Math.round(score * 100) : null
  const good = !record.flagged && pct >= 75

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(27, 27, 27, 0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--outline-variant)',
        borderRadius: '8px', width: '100%', maxWidth: 720, maxHeight: '85vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-md)'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--background)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <StatusBadge status={record.status} />
              {record.flagged && (
                <span className="badge badge-error">⚠ HALLUCINATION RISK</span>
              )}
              {record.usedWebFallback && (
                <span className="badge badge-success">WEB FALLBACK</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
              Job: {record.jobId} · {new Date(record.createdAt).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: '4px', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Query */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 12 }}>Query</div>
            <div style={{ background: 'var(--background)', border: '1px solid var(--outline-variant)', borderRadius: '4px', padding: '16px 20px', fontSize: 16, color: 'var(--on-surface)', lineHeight: 1.6 }}>
              {record.query}
            </div>
          </div>

          {/* Confidence */}
          {pct != null && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 12 }}>
                Grounding Confidence
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--outline-variant)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: good ? 'var(--on-surface)' : 'var(--error)', transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: good ? 'var(--on-surface)' : 'var(--error)', minWidth: 48 }}>
                  {pct}%
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 8 }}>
                Score: (maxSim × 0.7) + (avgSim × 0.3) = <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{score?.toFixed(3)}</span>
              </p>
            </div>
          )}

          {/* Answer */}
          {record.answer && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 12 }}>Answer</div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '4px', padding: '20px 24px', fontSize: 16, color: 'var(--on-surface)', lineHeight: 1.7, whiteSpace: 'pre-wrap', boxShadow: 'var(--shadow-sm)' }}>
                {record.answer}
              </div>
            </div>
          )}

          {/* Sources */}
          {record.finalSources?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 12 }}>
                Sources · {record.finalSources.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {record.finalSources.map((src, i) => (
                  <div key={i} style={{ background: 'var(--background)', border: '1px solid var(--outline-variant)', borderRadius: '4px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface)', background: 'rgba(209, 199, 183, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>[{i + 1}]</span>
                    <span style={{ fontSize: 14, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {record.errorMessage && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--error)', marginBottom: 12 }}>Error</div>
              <div style={{ background: 'var(--error-container)', border: '1px solid rgba(179, 71, 45, 0.3)', borderLeft: '4px solid var(--error)', borderRadius: '4px', padding: '16px 20px', fontSize: 14, color: 'var(--error)' }}>
                {record.errorMessage}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function History() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)
  const limit = 20

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const res = await getQueryHistory(p, limit)
      setRecords(res.data.records || [])
      setTotal(res.data.total || 0)
      setPage(p)
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [])

  const flaggedCount = records.filter(r => r.flagged).length
  const completedCount = records.filter(r => r.status === 'completed').length
  const webCount = records.filter(r => r.usedWebFallback).length

  return (
    <div style={{ padding: '48px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {selected && <QueryDetail record={selected} onClose={() => setSelected(null)} />}

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>Query History</h2>
            <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginTop: 8 }}>
              Paginated log of all agentic RAG queries with hallucination scoring.
            </p>
          </div>
          <button onClick={() => load(page)} className="btn btn-ghost" style={{ background: 'var(--surface)', border: '1px solid var(--outline-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total', value: total, color: 'var(--on-surface)' },
          { label: 'Completed', value: completedCount, color: 'var(--on-surface)' },
          { label: 'Flagged', value: flaggedCount, color: 'var(--error)' },
          { label: 'Web Fallback', value: webCount, color: 'var(--on-surface)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: s.color, marginTop: 8, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 110px 100px 120px', gap: 16, padding: '16px 24px', borderBottom: '1px solid var(--outline-variant)', background: 'var(--background)' }}>
          {['Query', 'Job ID', 'Status', 'Confidence', 'Flags'].map(h => (
            <div key={h} style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '24px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 8 }} />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline)' }}>history</span>
            <p style={{ marginTop: 16, fontSize: 16 }}>No query history yet.</p>
          </div>
        ) : (
          records.map((record, i) => {
            const score = record.hallucinationScore
            const pct = score != null ? Math.round(score * 100) : null
            const good = !record.flagged && (pct == null || pct >= 75)

            return (
              <div key={record.jobId || i}
                onClick={() => setSelected(record)}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 130px 110px 100px 120px',
                  gap: 16, padding: '16px 24px', cursor: 'pointer',
                  borderBottom: i < records.length - 1 ? '1px solid var(--outline-variant)' : 'none',
                  transition: 'background 0.15s',
                  ...(record.flagged ? { borderLeft: '4px solid var(--error)', background: 'var(--error-container)' } : {}),
                  alignItems: 'center'
                }}
                onMouseEnter={e => e.currentTarget.style.background = record.flagged ? 'var(--error-container)' : 'var(--background)'}
                onMouseLeave={e => e.currentTarget.style.background = record.flagged ? 'var(--error-container)' : 'transparent'}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    "{record.query}"
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                    {new Date(record.createdAt).toLocaleString()}
                  </div>
                </div>
                <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {record.jobId?.slice(0, 8)}…
                </span>
                <StatusBadge status={record.status} />
                <div>
                  {pct != null ? (
                    <span style={{ fontSize: 14, fontWeight: 600, color: good ? 'var(--on-surface)' : 'var(--error)' }}>
                      {pct}%
                    </span>
                  ) : (
                    <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>—</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {record.flagged && <span className="badge badge-error" style={{ padding: '2px 6px' }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span></span>}
                  {record.usedWebFallback && <span className="badge badge-success" style={{ padding: '2px 6px' }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>travel_explore</span></span>}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32 }}>
          <button onClick={() => load(page - 1)} disabled={page === 1} className="btn btn-ghost" style={{ background: 'var(--surface)', opacity: page === 1 ? 0.5 : 1 }}>
            ← Prev
          </button>
          <span style={{ padding: '8px 16px', fontSize: 14, fontWeight: 500, color: 'var(--on-surface)' }}>
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button onClick={() => load(page + 1)} disabled={page >= Math.ceil(total / limit)} className="btn btn-ghost" style={{ background: 'var(--surface)', opacity: page >= Math.ceil(total / limit) ? 0.5 : 1 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
