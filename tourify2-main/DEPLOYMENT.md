# Deployment Guide - Frontend (Netlify) + Backend (Railway/Vercel)

## ✅ Configuration Status
- ✅ Backend configured as pure API server
- ✅ Frontend configured for external API
- ✅ CORS enabled for cross-origin requests
- ✅ Health check endpoint available
- ✅ All deployment files created

## Backend Deployment

### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub account
3. Create new project from GitHub repo
4. Select this repository
5. Railway will auto-detect Node.js and deploy
6. Copy the generated URL (e.g., `https://your-app.railway.app`)

**Build Settings:**
- Start Command: `npm run build:backend && npm run start:backend`
- Health Check: `/api/health`

### Option B: Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import project from GitHub
3. Build settings:
   - Framework: Other
   - Build Command: `npm run build:backend`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Frontend Deployment (Netlify)

1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub or drag/drop the `tourify2-main` folder
3. Build settings:
   - Build command: `npm run build:client`
   - Publish directory: `client/dist`
   - Base directory: `tourify2-main`

4. **Environment variables** (required):
   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app
   ```

## Local Development
```bash
# Start backend
npm run dev

# In another terminal, start frontend (if needed)
cd client && npm run dev
```

## File Structure
```
tourify2-main/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   └── dist/           # Built frontend
├── server/             # Backend (Express API)
├── shared/             # Shared schemas
├── dist/               # Built backend
├── netlify.toml        # Netlify config
├── railway.json        # Railway config
├── vercel.json         # Vercel alternative
├── backend-package.json # Backend-only package.json
├── .env.local          # Local development
└── .env.production     # Production env template
```

## API Endpoints (Available)
- ✅ Health check: `GET /api/health`
- ✅ Tours list: `GET /api/tours`
- ✅ Single tour: `GET /api/tours/:id`
- ✅ Create tour: `POST /api/tours`
- ✅ Tour scenes: `GET /api/tours/:tourId/scenes`
- ✅ Create scene: `POST /api/tours/:tourId/scenes`
- ✅ Update scene: `PUT /api/scenes/:id`
- ✅ Delete scene: `DELETE /api/scenes/:id`

## Deployment Checklist
1. **Backend to Railway/Vercel:**
   - [ ] Deploy backend code
   - [ ] Note the generated URL
   - [ ] Test `/api/health` endpoint

2. **Frontend to Netlify:**
   - [ ] Set `VITE_API_BASE_URL` environment variable
   - [ ] Deploy frontend code
   - [ ] Test that frontend connects to backend API

## Notes
- Backend serves pure API (no static files in production)
- Frontend is completely static and CDN-optimized
- CORS configured for any origin (secure for public APIs)
- Both services scale independently