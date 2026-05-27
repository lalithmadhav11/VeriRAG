import { useState, useRef } from 'react'
import { ingestPdf } from '../api'

function IngestionStep({ label, status }) {
  const colors = {
    done:    { bg: 'rgba(209, 199, 183, 0.2)', border: 'var(--outline-variant)', color: 'var(--on-surface)', icon: 'check' },
    active:  { bg: 'var(--surface)', border: 'var(--primary)', color: 'var(--primary)', icon: 'sync' },
    pending: { bg: 'transparent', border: 'var(--outline-variant)', color: 'var(--outline)', icon: 'radio_button_unchecked' },
  }
  const c = colors[status]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        background: c.bg, border: `2px solid ${c.border}`, color: c.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...(status === 'active' ? { animation: 'pulse-ring 2s ease-in-out infinite' } : {})
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, ...(status === 'active' ? { animation: 'spin 1s linear infinite' } : {}) }}>{c.icon}</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: status === 'active' ? 600 : 400, color: status === 'active' ? 'var(--primary)' : status === 'done' ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
        {label}
      </span>
    </div>
  )
}

function DocumentCard({ doc }) {
  const isOk = doc.status === 'indexed'
  return (
    <div className="card" style={{
      border: `1px solid ${isOk ? 'var(--outline-variant)' : 'rgba(179, 71, 45, 0.4)'}`,
      padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16,
      ...(isOk ? {} : { backgroundColor: 'var(--error-container)' })
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '8px', background: isOk ? 'var(--background)' : 'rgba(179, 71, 45, 0.1)', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: isOk ? 'var(--on-surface-variant)' : 'var(--error)' }}>
              {doc.mimeType === 'application/pdf' ? 'picture_as_pdf' : 'description'}
            </span>
          </div>
          <span className={isOk ? "badge badge-success" : "badge badge-error"}>
            {doc.status}
          </span>
        </div>
        <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {doc.originalFilename}
        </h4>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--on-surface-variant)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
            {new Date(doc.createdAt).toLocaleDateString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>segment</span>
            {doc.chunkCount} chunks
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Documents() {
  const [uploadState, setUploadState] = useState('idle')
  const [uploadProgress, setUploadProgress] = useState({ step: '' })
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [recentDocs, setRecentDocs] = useState([])
  const fileInput = useRef(null)

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported.')
      return
    }
    setUploadError('')
    setUploadState('uploading')
    setUploadProgress({ step: 'Uploading PDF...' })

    try {
      setUploadProgress({ step: 'Chunking & embedding...' })
      const name = sourceName.trim() || file.name.replace('.pdf', '')
      const res = await ingestPdf(file, name)
      setUploadResult(res.data)
      setUploadState('done')
      setRecentDocs(prev => [{
        originalFilename: file.name, sourceName: name, mimeType: 'application/pdf',
        chunkCount: res.data.data?.chunkCount || '?', status: 'indexed',
        createdAt: new Date().toISOString()
      }, ...prev])
    } catch (err) {
      setUploadError(err.response?.data?.error || err.message)
      setUploadState('error')
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onFileChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div style={{ padding: '48px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>Document Intelligence</h2>
        <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginTop: 8 }}>
          Upload PDF documents to index them into ChromaDB for semantic retrieval.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 32 }}>
        {/* Left — Upload & Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Source name */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 8 }}>
              Source Name (optional)
            </label>
            <input
              type="text"
              value={sourceName}
              onChange={e => setSourceName(e.target.value)}
              placeholder="e.g. Q3-Engineering-Reports"
              style={{ width: '100%', padding: '12px 16px' }}
            />
          </div>

          {/* Upload zone */}
          <div
            onClick={() => fileInput.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--outline)'}`,
              borderRadius: '8px', padding: 48, textAlign: 'center', cursor: 'pointer',
              background: dragging ? 'var(--surface-container-highest)' : 'var(--surface)',
              transition: 'all 0.2s ease',
              boxShadow: dragging ? 'var(--shadow-md)' : 'var(--shadow-sm)'
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--background)', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', transition: 'transform 0.2s', ...(dragging ? { transform: 'scale(1.1)' } : {}) }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--on-surface)' }}>upload_file</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>
              {dragging ? 'Drop to index' : 'Drop PDF to Index'}
            </p>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>or click to browse</p>
            <p style={{ fontSize: 12, color: 'var(--outline)', marginTop: 12, fontWeight: 500 }}>PDF only · Max 30MB</p>
            <input ref={fileInput} type="file" accept=".pdf" onChange={onFileChange} style={{ display: 'none' }} />
          </div>

          {/* Upload progress/status */}
          {uploadState !== 'idle' && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)' }}>
                  {uploadState === 'uploading' ? 'Processing...' : uploadState === 'done' ? 'Indexed ✓' : 'Failed'}
                </span>
                {uploadState === 'uploading' && <div className="spinner" style={{ width: 18, height: 18 }} />}
                {uploadState === 'done' && <span className="badge badge-success">{uploadResult?.data?.chunkCount} chunks</span>}
              </div>
              <IngestionStep label="PDF Extraction" status={uploadState === 'idle' ? 'pending' : 'done'} />
              <IngestionStep label="Recursive Chunking" status={uploadState === 'uploading' ? 'active' : uploadState === 'idle' ? 'pending' : 'done'} />
              <IngestionStep label="OpenAI Embeddings" status={uploadState === 'uploading' ? 'pending' : uploadState === 'done' ? 'done' : 'pending'} />
              <IngestionStep label="ChromaDB Indexing" status={uploadState === 'done' ? 'done' : 'pending'} />
              {uploadError && (
                <div style={{ marginTop: 16, padding: 12, borderRadius: '4px', background: 'var(--error-container)', borderLeft: '4px solid var(--error)', color: 'var(--error)', fontSize: 14 }}>
                  {uploadError}
                </div>
              )}
              {uploadState === 'done' && (
                <button onClick={() => { setUploadState('idle'); setUploadResult(null) }} style={{ marginTop: 20, fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', background: 'none', border: '1px solid var(--outline-variant)', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer' }}>
                  Upload another
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right — Knowledge Base */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>library_books</span>
              Knowledge Base
            </h3>
            <span style={{ fontSize: 14, color: 'var(--on-surface-variant)', fontWeight: 500 }}>{recentDocs.length} documents this session</span>
          </div>

          {recentDocs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '80px 24px', opacity: 0.6, textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline)' }}>description</span>
              <p style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>No documents uploaded this session. Upload a PDF to index it.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {recentDocs.map((doc, i) => <DocumentCard key={i} doc={doc} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
