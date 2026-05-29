import React, { useState, useEffect, useRef } from 'react'
import { submitAsyncQuery, getQueryStatus } from '../api'
import { useToast } from '../components/ToastProvider'

const POLL_INTERVAL = 2500
const POLL_TIMEOUT = 90000

function AgentGraph({ status }) {
  const nodes = [
    { id: 'router',    icon: 'route',      label: 'Router' },
    { id: 'retriever', icon: 'database',   label: 'Retriever' },
    { id: 'generator', icon: 'smart_toy',  label: 'Generator' },
    { id: 'validator', icon: 'verified',   label: 'Validator' },
  ]

  const getNodeState = (idx) => {
    if (status === 'idle') return 'pending'
    if (status === 'running') {
      if (idx === 0) return 'completed'
      if (idx === 1) return 'completed'
      if (idx === 2) return 'active'
      return 'pending'
    }
    if (status === 'completed' || status === 'failed') return 'completed'
    return 'pending'
  }

  return (
    <div className="card" style={{ padding: '16px 24px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>Execution Trace</span>
        {status === 'running' && (
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--on-surface)', display: 'inline-block', animation: 'pulse-ring 2s ease-in-out infinite' }} />
            Active
          </span>
        )}
        {status === 'completed' && (
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)' }}>Completed</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {nodes.map((node, i) => {
          const state = getNodeState(i)
          const colors = {
            completed: { bg: 'var(--on-surface)', border: 'var(--on-surface)', color: 'var(--on-primary)' },
            active:    { bg: 'var(--surface)', border: 'var(--primary)', color: 'var(--primary)' },
            pending:   { bg: 'transparent', border: 'var(--outline)', color: 'var(--outline)' },
          }
          const c = colors[state]
          return (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: c.bg, border: `2px solid ${c.border}`, color: c.color,
                  ...(state === 'active' ? { animation: 'pulse-ring 2s ease-in-out infinite' } : {}),
                  opacity: state === 'pending' ? 0.5 : 1,
                  transition: 'all 0.3s'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{node.icon}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{node.label}</span>
              </div>
              {i < nodes.length - 1 && (
                <div style={{ flex: 1, height: 2, background: state === 'completed' ? 'var(--on-surface)' : 'var(--outline-variant)', margin: '0 12px', marginBottom: 24, opacity: state === 'pending' ? 0.3 : 1, transition: 'background 0.3s' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ConfidenceBadge({ score, flagged }) {
  const pct = Math.round((score || 0) * 100)
  const ok = !flagged && pct >= 75
  return (
    <span className={ok ? 'badge badge-success' : 'badge badge-error'}>
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{ok ? 'check_circle' : 'warning'}</span>
      {pct}% Confidence
    </span>
  )
}

function SourceCitations({ sources }) {
  if (!sources || sources.length === 0) return null
  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--outline-variant)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Sources · {sources.length}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sources.slice(0, 5).map((src, i) => (
          <div key={i} style={{
            background: 'var(--background)', border: '1px solid var(--outline-variant)',
            borderRadius: '4px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface)', background: 'rgba(209, 199, 183, 0.3)', padding: '2px 6px', borderRadius: '4px' }}>[{i + 1}]</span>
            <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatMessage({ msg, onRetry }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', gap: 16, flexDirection: isUser ? 'row-reverse' : 'row', marginBottom: 24, animation: 'fade-in-up 0.3s ease' }}>
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser ? 'var(--surface)' : 'var(--primary)',
        border: `1px solid ${isUser ? 'var(--outline)' : 'var(--primary)'}`,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: isUser ? 'var(--on-surface)' : 'var(--on-primary)' }}>
          {isUser ? 'person' : 'auto_awesome'}
        </span>
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '80%' }}>
        <div style={{
          padding: '16px 20px', borderRadius: '8px',
          background: 'var(--surface)',
          border: '1px solid var(--outline-variant)',
          boxShadow: 'var(--shadow-sm)',
          fontSize: 16, lineHeight: 1.6, color: 'var(--on-surface)'
        }}>
          {msg.content}

          {/* Loading indicator */}
          {msg.loading && (
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--on-surface)', display: 'inline-block',
                  animation: `pulse-ring 1.2s ease-in-out ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Metadata badges */}
        {msg.result && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <ConfidenceBadge score={msg.result.hallucinationScore} flagged={msg.result.flagged} />
            {msg.result.usedWebFallback && (
              <span className="badge badge-success">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>travel_explore</span>
                Web fallback used
              </span>
            )}
            {msg.result.flagged && (
              <span className="badge badge-error">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>gpp_bad</span>
                Hallucination risk
              </span>
            )}
          </div>
        )}

        {/* Sources */}
        {msg.result && <SourceCitations sources={msg.result.finalSources} />}

        {/* Retry Button */}
        {msg.failed && onRetry && (
          <button onClick={onRetry} className="btn" style={{ marginTop: 12, background: 'var(--surface-container-highest)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

export default function Chat() {
  const { addToast } = useToast()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [agentStatus, setAgentStatus] = useState('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => () => clearInterval(pollRef.current), [])

  const handleSend = async (retryQuery = null) => {
    const isRetryStr = typeof retryQuery === 'string';
    const q = isRetryStr ? retryQuery : input.trim();
    if (!q || isSubmitting) return;

    if (!isRetryStr) setInput('');
    setIsSubmitting(true)
    setAgentStatus('running')

    let mIdx = -1
    if (retryQuery) {
      // Find the last assistant message and mark it loading again
      setMessages(prev => {
        const next = [...prev]
        const lastIdx = next.length - 1
        if (next[lastIdx].role === 'assistant') {
          next[lastIdx] = { role: 'assistant', content: '', loading: true, failed: false }
          mIdx = lastIdx
        }
        setTimeout(() => pollRef.current, 0)
        return next
      })
    } else {
      const userMsg = { role: 'user', content: q }
      const aiMsg   = { role: 'assistant', content: '', loading: true, failed: false }
      setMessages(prev => {
        const next = [...prev, userMsg, aiMsg]
        mIdx = next.length - 1
        setTimeout(() => pollRef.current, 0)
        return next
      })
    }

    try {
      const res = await submitAsyncQuery(q)
      const { jobId } = res.data
      const startedAt = Date.now()
      const pId = setInterval(async () => {
        try {
          const sr = await getQueryStatus(jobId)
          const { status, answer, hallucinationScore, flagged, usedWebFallback, finalSources } = sr.data

          if (status === 'completed') {
            clearInterval(pId)
            setAgentStatus('completed')
            setIsSubmitting(false)
            addToast('Query completed successfully', 'success')
            setMessages(prev => {
              const updated = [...prev]
              const idx = mIdx !== -1 ? mIdx : updated.findIndex(m => m.loading)
              if (idx !== -1) {
                updated[idx] = {
                  ...updated[idx],
                  content: answer || '_No answer returned._',
                  loading: false,
                  failed: false,
                  result: { hallucinationScore, flagged, usedWebFallback, finalSources }
                }
              }
              return updated
            })
          } else if (status === 'failed') {
            clearInterval(pId)
            setAgentStatus('failed')
            setIsSubmitting(false)
            addToast('Agent pipeline failed', 'error')
            setMessages(prev => {
              const updated = [...prev]
              const idx = mIdx !== -1 ? mIdx : updated.findIndex(m => m.loading)
              if (idx !== -1) updated[idx] = { ...updated[idx], content: '⚠️ Agent pipeline failed.', loading: false, failed: true, queryToRetry: q }
              return updated
            })
          } else if (Date.now() - startedAt > POLL_TIMEOUT) {
            clearInterval(pId)
            setAgentStatus('failed')
            setIsSubmitting(false)
            addToast('Query timed out', 'error')
            setMessages(prev => {
              const updated = [...prev]
              const idx = mIdx !== -1 ? mIdx : updated.findIndex(m => m.loading)
              if (idx !== -1) updated[idx] = { ...updated[idx], content: '⏱️ Query timed out.', loading: false, failed: true, queryToRetry: q }
              return updated
            })
          }
        } catch { /* keep polling */ }
      }, POLL_INTERVAL)
    } catch (err) {
      setAgentStatus('failed')
      setIsSubmitting(false)
      addToast(`Error: ${err.response?.data?.error || err.message}`, 'error')
      setMessages(prev => {
        const updated = [...prev]
        const idx = mIdx !== -1 ? mIdx : updated.findIndex(m => m.loading)
        if (idx !== -1) updated[idx] = { ...updated[idx], content: `❌ Request failed.`, loading: false, failed: true, queryToRetry: q }
        return updated
      })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      {/* Agent graph */}
      <div style={{ padding: '32px 24px 0', flexShrink: 0 }}>
        <AgentGraph status={agentStatus} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--on-surface)' }}>auto_awesome</span>
            </div>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
              <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--on-surface)' }}>VeriRAG Chat</p>
              <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginTop: 8, lineHeight: 1.5 }}>Ask anything about your indexed documents. The agent will retrieve, generate, and validate.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
              {[
                'Summarize the architecture review',
                'What are the service changes?',
                'Find security advisories',
              ].map(s => (
                <button key={s} onClick={() => setInput(s)} style={{
                  fontSize: 14, padding: '8px 16px', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface-variant)', cursor: 'pointer', transition: 'all 0.15s', boxShadow: 'var(--shadow-sm)'
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--on-surface)'; e.currentTarget.style.borderColor = 'var(--outline)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--on-surface-variant)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
                >{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => <ChatMessage key={i} msg={msg} onRetry={msg.failed ? () => handleSend(msg.queryToRetry) : null} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0 24px 32px', flexShrink: 0 }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '8px', padding: 16,
          boxShadow: 'var(--shadow-md)', transition: 'border-color 0.15s'
        }}
          onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--outline)'; }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your indexed documents..."
            disabled={isSubmitting}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none',
              color: 'var(--on-surface)', fontSize: 16, fontFamily: 'Geist, sans-serif',
              minHeight: 64, padding: '0 4px', lineHeight: 1.5
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginTop: 8, borderTop: '1px solid var(--outline-variant)' }}>
            <span style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 500 }}>
              {isSubmitting ? 'Agent is processing...' : 'Async via BullMQ · LangGraph'}
            </span>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isSubmitting}
              className="btn btn-primary"
              style={{ padding: '8px 20px', opacity: (!input.trim() || isSubmitting) ? 0.5 : 1, cursor: (!input.trim() || isSubmitting) ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? <div className="spinner" style={{ width: 16, height: 16, borderTopColor: 'var(--on-primary)', borderColor: 'rgba(255,255,255,0.3)' }} /> : null}
              {isSubmitting ? 'Processing' : 'Send'}
              {!isSubmitting && <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
