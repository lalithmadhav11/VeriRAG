import { useState, useEffect } from 'react'

export function SidebarLink({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`sidebar-link${active ? ' active' : ''}`}
      style={{ 
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', 
        borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', 
        textAlign: 'left', fontSize: 14, fontFamily: 'Geist, sans-serif', 
        transition: 'all 0.15s ease', 
        background: active ? 'var(--primary-container)' : 'transparent', 
        color: active ? 'var(--on-primary-container)' : 'var(--on-surface-variant)', 
        fontWeight: active ? 600 : 400 
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(209, 199, 183, 0.2)'; e.currentTarget.style.color = 'var(--on-surface)'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--on-surface-variant)'; }}}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
      {label}
    </button>
  )
}

export function Sidebar({ page, setPage }) {
  const links = [
    { id: 'dashboard', icon: 'dashboard', label: 'Overview' },
    { id: 'chat',      icon: 'chat',      label: 'Chat Workspace' },
    { id: 'documents', icon: 'description', label: 'Documents' },
    { id: 'history',   icon: 'history',   label: 'Query History' },
  ]

  return (
    <nav style={{
      width: 256, flexShrink: 0, height: '100vh',
      backgroundColor: 'var(--surface)',
      borderRight: '1px solid var(--outline-variant)',
      display: 'flex', flexDirection: 'column',
      padding: 16, gap: 4,
      position: 'fixed', left: 0, top: 0, zIndex: 40
    }}>
      {/* Brand */}
      <div style={{ padding: '8px 12px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '4px',
            background: 'var(--primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, color: 'var(--on-primary)', fontSize: 16
          }}>V</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
              VeriRAG
            </h1>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginTop: 2 }}>
              AI Platform
            </p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {links.map(l => (
          <SidebarLink key={l.id} {...l} active={page === l.id} onClick={() => setPage(l.id)} />
        ))}
      </div>

      {/* Footer */}
      <div style={{ paddingTop: 12, borderTop: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SidebarLink icon="settings" label="Settings" active={page === 'settings'} onClick={() => setPage('settings')} />
      </div>
    </nav>
  )
}
