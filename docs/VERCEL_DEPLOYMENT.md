# TaskFlow Backend — Vercel Deployment Guide

This guide walks you through deploying the **TaskFlow Backend REST API** to [Vercel](https://vercel.com/) as a high-performance, serverless Node.js application.

---

## 🏗️ Architecture Overview

On Vercel, the Express application runs as a **Serverless Function**:
- **Entry Handler**: [`backend/api/index.ts`](../backend/api/index.ts)
- **Routing & Rewrites**: [`backend/vercel.json`](../backend/vercel.json) routes all incoming requests to the serverless function.
- **Connection Caching**: [`backend/src/config/db.ts`](../backend/src/config/db.ts) caches MongoDB connections across serverless warm starts to prevent connection spikes.

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up for free at [vercel.com](https://vercel.com).
2. **MongoDB Atlas Database** (Required for Cloud):
   - Local `mongodb://localhost:27017` cannot be reached from Vercel's cloud servers.
   - Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
   - In Network Access, allow IP address `0.0.0.0/0` (Vercel serverless IPs change dynamically).
   - Copy your connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
     ```

---

## 🚀 Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your latest changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: configure backend for Vercel serverless deployment"
   git push origin main
   ```
2. Open your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** > **"Project"**.
3. Import your GitHub repository: **`TaskFlow`** (or `LokeshwarMenati/TaskFlow`).
4. In the **Configure Project** screen:
   - **Project Name**: `taskflow-backend` (or your choice)
   - **Framework Preset**: `Other`
   - **Root Directory**: Click **Edit** and choose `backend` (⚠️ **Crucial Step**)
5. Expand **Environment Variables** and add the following keys:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production mode |
   | `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/taskflow?retryWrites=true&w=majority` | Your cloud MongoDB Atlas URI |
   | `JWT_SECRET` | `your_super_secret_jwt_key_at_least_32_characters_long` | Secure signing key |
   | `JWT_EXPIRES_IN` | `7d` | Token expiry time |
   | `CORS_ORIGIN` | `*` | Allows mobile & web clients |
6. Click **Deploy**.
7. In ~60 seconds, your deployment will be live!

---

## ⚡ Option 2: Deploy via Vercel CLI (Command Line)

If you prefer deploying directly from your terminal:

1. Open PowerShell and navigate to the `backend` folder:
   ```powershell
   cd e:\Assignment\backend
   ```
2. Run the Vercel deployment command:
   ```powershell
   npx vercel
   ```
3. Follow the interactive CLI prompts:
   - **Set up and deploy?**: `y`
   - **Which scope?**: Choose your personal Vercel account
   - **Link to existing project?**: `N`
   - **What's your project's name?**: `taskflow-backend`
   - **In which directory is your code located?**: `./`
   - **Want to modify build settings?**: `N`
4. Set your production environment variables via CLI or Vercel Project Settings:
   ```powershell
   npx vercel env add MONGODB_URI production
   npx vercel env add JWT_SECRET production
   npx vercel env add NODE_ENV production
   ```
5. Deploy to production:
   ```powershell
   npx vercel --prod
   ```

---

## 🔍 Verification & Health Check

Once deployed, Vercel will provide your public deployment URL (e.g. `https://taskflow-backend.vercel.app`).

Test the following endpoints in your browser or Postman:

1. **Root Status Check**:
   ```
   GET https://<your-project>.vercel.app/
   ```
   **Expected Response:**
   ```json
   {
     "name": "TaskFlow REST API",
     "status": "online",
     "version": "1.0.0",
     "documentation": "/health",
     "endpoints": {
       "health": "/health",
       "auth": "/auth",
       "tasks": "/tasks"
     }
   }
   ```

2. **System Health Check**:
   ```
   GET https://<your-project>.vercel.app/health
   ```
   **Expected Response:**
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-10-05T...",
     "uptime": 12.34
   }
   ```

---

## 📱 Connecting TaskFlow Android Mobile App

To connect your Android mobile app to the live Vercel backend:

1. Launch the TaskFlow Android app on your phone or emulator.
2. On the Login screen, tap the **Server Settings** (⚙️) icon.
3. Enter your live Vercel domain URL:
   ```
   https://<your-project>.vercel.app
   ```
4. Tap **Save & Reconnect**.
5. You can now register, log in, create tasks, and manage data from anywhere in the world!
