import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ─── Health ───────────────────────────────────────────────────────────────────
export const getHealth = () => api.get('/health')

// ─── Ingestion ─────────────────────────────────────────────────────────────────
export const ingestPdf = (file, sourceName = 'default-source') => {
  const form = new FormData()
  form.append('file', file)
  form.append('sourceName', sourceName)
  return api.post('/ingest/pdf', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}

// ─── Synchronous Query ─────────────────────────────────────────────────────────
export const querySync = (query, topK = 5) =>
  api.post('/query', { query, topK })

// ─── Async Agent Query ─────────────────────────────────────────────────────────
export const submitAsyncQuery = (query) =>
  api.post('/query/async', { query })

export const getQueryStatus = (jobId) =>
  api.get(`/query/status/${jobId}`)

export const getQueryHistory = (page = 1, limit = 20) =>
  api.get('/query/history', { params: { page, limit } })

export default api
