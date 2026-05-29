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

### ChromaDB (Vector Store) via Railway
We utilize Railway's native Docker deployment to host ChromaDB. A custom Dockerfile is *not* required.

1. Log in to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from Docker image**.
3. Enter `chromadb/chroma:latest` as the image name.
4. Once the service appears, click it, go to the **Variables** tab, and add:
   - `PORT` = `8000` (Crucial: Overrides Railway's dynamic routing to hit the container's internal 8000 port).
   - `IS_PERSISTENT` = `TRUE` (Enables data persistence).
5. To persist your data: Right-click on the project canvas (or press `Ctrl+K`) and select **New Volume**.
6. Select your ChromaDB service to attach it, and set the **Mount Path** exactly to `/chroma/chroma`.
7. Go to the **Networking** tab, find the **Public Networking** section, and click **Generate Domain**.
8. Wait for deployment to finish. Your Vector DB URL will look like `https://chroma-production-xxxx.up.railway.app`.

---

## 2. Backend Deployment (Render)

The backend is configured via Infrastructure-as-Code in `render.yaml`. It combines both the Express API and the BullMQ worker into a single web service for simplicity.

1. Connect your GitHub repository to [Render](https://render.com/).
2. Go to **Blueprints** -> **New Blueprint Instance**.
3. Select the repository. Render will automatically read `backend/render.yaml`.
4. In the Render Dashboard, fill in the required Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gemini API Key from AI Studio.
   - `EMBEDDING_MODEL`: `text-embedding-004`
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
