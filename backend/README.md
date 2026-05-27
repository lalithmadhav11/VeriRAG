# VeriRAG Backend

Production-style backend for the **RAG Hallucination Firewall — Agentic Edition**.

## What this service does

- Ingests PDF documents and indexes chunks into ChromaDB.
- Runs synchronous vector search for quick retrieval checks.
- Runs asynchronous agentic RAG queries through BullMQ workers.
- Exposes Slack bot entrypoints via Slack Bolt and threaded replies.
- Tracks query lifecycle and outputs in MongoDB.

## Architecture overview

- `src/config/` - Environment and infrastructure clients (Mongo, Chroma).
- `src/ingestion/` - PDF extraction + chunking + embedding + indexing pipeline.
- `src/services/` - Embedding and vector-store service abstractions.
- `src/agent/` - LangGraph state, tools, and execution graph.
- `src/queue/` - BullMQ producer/worker and Redis connection.
- `src/api/` - Express routes/controllers for ingestion + query APIs.
- `src/slack/` - Slack event wiring and response orchestration.
- `src/models/` - MongoDB schemas for documents and query history.

## API endpoints

- `GET /api/health`
- `POST /api/ingest/pdf`
- `POST /api/query` (synchronous retrieval)
- `POST /api/query/async` (enqueue agent query)
- `GET /api/query/status/:jobId`
- `GET /api/query/history`

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill required keys (`OPENAI_API_KEY`, optional `TAVILY_API_KEY`, Slack keys if used).
3. Start stack:

```bash
docker compose up --build
```

## Async query flow

1. Client submits `POST /api/query/async`.
2. API stores initial `QueryHistory` record and enqueues BullMQ job.
3. Worker runs `runAgent(query)` LangGraph pipeline.
4. Worker persists completion/failure state back to MongoDB.
5. Client polls status endpoint until terminal state.

## Notes

- Exponential backoff and retry behavior are controlled by `JOB_MAX_ATTEMPTS`.
- Worker parallelism is controlled by `WORKER_CONCURRENCY`.
- Slack app mentions are handled asynchronously and answered in thread context.
