# VeriRAG Deployment Guide

This guide outlines how to deploy the VeriRAG project to production using Render, Vercel, and managed database services.

## 1. Managed Databases Setup

Before deploying the application code, you need to provision the external state.

### MongoDB Atlas (Primary Database)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Whitelist `0.0.0.0/0` in Network Access so Render can connect.
3. Get your connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/verirag`.

### Redis Cloud (BullMQ Queue)
1. Create a free database on [Redis Enterprise Cloud](https://redis.com/try-free/) or Upstash.
2. Get the public endpoint and password.

### ChromaDB (Vector Store)
For a simple portfolio deployment, ChromaDB can be deployed as a Docker container on Render or Railway.
- **Render Web Service**: Deploy a Docker service using `chromadb/chroma:latest`. Expose port `8000`. Use a persistent disk mapped to `/chroma/chroma`.

---

## 2. Backend Deployment (Render)

The backend is configured via Infrastructure-as-Code in `render.yaml`. It combines both the Express API and the BullMQ worker into a single web service for simplicity.

1. Connect your GitHub repository to [Render](https://render.com/).
2. Go to **Blueprints** -> **New Blueprint Instance**.
3. Select the repository. Render will automatically read `backend/render.yaml`.
4. In the Render Dashboard, fill in the required Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI API key.
   - `MONGODB_URI`: The MongoDB Atlas connection string.
   - `REDIS_HOST`: e.g., `redis-12345.c12.us-east-1-4.ec2.cloud.redislabs.com`
   - `REDIS_PORT`: e.g., `12345`
   - `REDIS_PASSWORD`: Your Redis password.
   - `CHROMA_URL`: The URL of your deployed Chroma instance.
   - `FRONTEND_URL`: Leave blank for now, you will update this after Vercel deployment.
5. Deploy the service. Wait for the green "Live" status. Note the API URL (e.g., `https://verirag-api.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

The frontend is a Vite + React SPA.

1. Connect your repository to [Vercel](https://vercel.com/).
2. Create a new Project and select the `frontend` directory as the Root Directory.
3. Vercel will automatically detect Vite and set the build command to `npm run build`.
4. Add the following Environment Variable in Vercel settings:
   - `VITE_API_URL`: The URL of your Render backend (e.g., `https://verirag-api.onrender.com/api`).
5. Click **Deploy**. Note the public URL (e.g., `https://verirag.vercel.app`).

---

## 4. Final Security Check

Go back to your **Render** dashboard for the Backend service:
1. Update the `FRONTEND_URL` environment variable to match your Vercel URL exactly (e.g., `https://verirag.vercel.app`).
2. This strictly configures CORS to reject requests from any other domains.

Your VeriRAG system is now live and fully operational!
