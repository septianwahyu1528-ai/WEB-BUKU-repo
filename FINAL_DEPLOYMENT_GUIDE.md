# 🚀 DEPLOYMENT GUIDE - SPLIT FRONTEND & BACKEND

**Date**: April 1, 2026  
**Status**: Ready for GitHub & Production Deployment  
**Architecture**: Vercel (Frontend) + Render/Railway (Backend) + Supabase (Database)

---

## 📁 FOLDER STRUCTURE (Ready)

```
C:\Users\NEW EDHOCATION\Documents\
├ web-buku-frontend/          ✓ READY
│  ├ src/
│  ├ public/
│  ├ package.json
│  ├ vite.config.js
│  ├ vercel.json
│  ├ .env.example
│  ├ .gitignore
│  ├ README.md
│  └ .git/ (local repo)
│
├ web-buku-backend/           ✓ READY
│  ├ server/
│  ├ package.json
│  ├ .env.example
│  ├ .gitignore
│  ├ README.md
│  └ .git/ (local repo)
```

---

## 📋 STEP 1: CREATE GITHUB REPOSITORIES

### Frontend Repository

1. Pergi ke https://github.com/new
2. **Repository name**: `web-buku-frontend`
3. **Description**: Web-Buku Frontend - React + Vite
4. **Public/Private**: Public (untuk deployment lebih mudah)
5. **Don't initialize** (repo sudah ada locally)
6. Klik **Create repository**

7. Setelah created, copy SSH/HTTPS URL:
   ```
   https://github.com/YOUR-USERNAME/web-buku-frontend.git
   ```

8. Di terminal, push local repo:
   ```bash
   cd "c:\Users\NEW EDHOCATION\Documents\web-buku-frontend"
   git remote add origin https://github.com/YOUR-USERNAME/web-buku-frontend.git
   git push -u origin master
   ```

### Backend Repository

1. Pergi ke https://github.com/new
2. **Repository name**: `web-buku-backend`
3. **Description**: Web-Buku Backend - Express + Supabase
4. **Public/Private**: Public
5. Klik **Create repository**

6. Copy URL dan push:
   ```bash
   cd "c:\Users\NEW EDHOCATION\Documents\web-buku-backend"
   git remote add origin https://github.com/YOUR-USERNAME/web-buku-backend.git
   git push -u origin master
   ```

---

## 🌐 STEP 2: DEPLOY FRONTEND TO VERCEL

### Process

1. Buka https://vercel.com/dashboard
2. Klik **Add New** → **Project**
3. **Import Git Repository**
   - Search: `web-buku-frontend`
   - Select dan klik Import

4. **Configure Project**
   ```
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   Root Directory: ./
   ```

5. **Environment Variables** - IMPORTANT!
   ```
   VITE_API_URL = https://api-web-buku.render.com
   
   (Ganti dengan actual backend URL setelah backend deployed)
   ```

6. Klik **Deploy**

7. **Tunggu** sampai build complete (~2-3 menit)

8. **Get Frontend URL**:
   - Akan tampil seperti: `https://web-buku-frontend.vercel.app`
   - Update backend CORS dengan URL ini

---

## 🔌 STEP 3: DEPLOY BACKEND TO RENDER

### Process

1. Buka https://render.com/dashboard
2. Klik **New +** → **Web Service**
3. **Connect** GitHub account
4. Search dan select: `web-buku-backend`
5. Klik **Connect**

6. **Configure Service**
   ```
   Name: web-buku-backend
   Environment: Node
   Region: Singapore (atau pilih dekat Anda)
   Build Command: npm install
   Start Command: npm start
   ```

7. **Environment Variables** - ADD ALL:
   ```
   NODE_ENV = production
   PORT = 3000
   
   VITE_SUPABASE_URL = https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_KEY = eyJhbGc...
   SUPABASE_URL = https://xxxxx.supabase.co
   
   JWT_SECRET = your-secret-key-min-32-chars
   FRONTEND_URL = https://web-buku-frontend.vercel.app
   ```

8. Klik **Create Web Service**

9. **Tunggu** deploy complete (~5 menit)

10. **Get Backend URL**:
    - Di Render dashboard, copy service URL
    - Format: `https://web-buku-backend-xxxx.render.com`

11. **Update Frontend Environment**:
    - Vercel Dashboard → Project Settings → Environment Variables
    - Edit `VITE_API_URL` = `https://web-buku-backend-xxxx.render.com`
    - Redeploy frontend

---

## ✅ VERIFICATION CHECKLIST

### Frontend
- [ ] Vercel deployment successful
- [ ] Frontend loads correctly
- [ ] Is responsive on mobile
- [ ] Frontend URL: `https://web-buku-frontend.vercel.app`

### Backend
- [ ] Render deployment successful
- [ ] Test health endpoint:
  ```
  curl https://web-buku-backend-xxxx.render.com/api/health
  ```
- [ ] Returns: `{"status":"ok","backend":"running"}`
- [ ] Backend URL: `https://web-buku-backend-xxxx.render.com`

### Database
- [ ] Supabase credentials configured
- [ ] Supabase project accessible
- [ ] Database tables exist (customers, books, orders, etc.)

### Integration
- [ ] Frontend can communicate with backend
- [ ] CORS errors fixed
- [ ] Test login/register functionality
- [ ] Test orders and history

---

## 🆘 TROUBLESHOOTING

### Frontend Won't Build
- Check Node version: `node --version` (should be 18+)
- Clear cache: `npm cache clean --force`
- Reinstall: `rm node_modules && npm install`

### Backend Deploy Error
- Check `.env.example` has all required variables
- Verify Supabase credentials
- Check logs in Render dashboard

### API CORS Errors
- Update `FRONTEND_URL` in backend env vars
- Make sure it matches exact Vercel domain
- Redeploy backend

### Database Connection Issues
- Verify Supabase credentials in env vars
- Check Supabase project is active
- Test Supabase connection locally first

---

## 📚 USEFUL COMMANDS

### Local Development

**Frontend**:
```bash
cd web-buku-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**Backend**:
```bash
cd web-buku-backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Testing Production

```bash
# Test frontend
https://web-buku-frontend.vercel.app

# Test backend health
curl https://web-buku-backend-xxxx.render.com/api/health

# Test API call from frontend
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://web-buku-backend-xxxx.render.com/api/books
```

---

## 📊 ARCHITECTURE DIAGRAM

```
┌──────────────────────────────────────────────┐
│              Vercel CDN (Global)             │
│     React SPA (web-buku-frontend)            │
│     https://web-buku-frontend.vercel.app     │
└────────────────────┬─────────────────────────┘
                     │
                API Requests
                     │
         ┌───────────▼──────────┐
         │  Render.com           │
         │  Express API          │
         │  web-buku-backend     │
         │  :3000/api/*         │
         └───────────┬──────────┘
                     │
            Database Queries
                     │
         ┌───────────▼──────────┐
         │  Supabase PostgreSQL  │
         │  Cloud Database       │
         │  Auto-scaling         │
         └───────────────────────┘
```

---

## 💰 COST BREAKDOWN (Monthly Estimate)

| Service | Plan | Cost |
|---------|------|------|
| **Vercel** | Hobby | FREE |
| **Render** | Starter | $5-10 |
| **Supabase** | Free | FREE* |
| **Total** | - | **~$5-10/month** |

*Supabase free tier: 500MB DB, unlimited API calls

---

## 📞 DEPLOYMENT SUPPORT

| Issue | Solution |
|-------|----------|
| Build fails | Check Node version, clear cache |
| Deploy timeout | Increase RAM on Render (paid) |
| API 502 error | Backend crashed, check logs |
| CORS error | Update FRONTEND_URL env var |
| Database error | Verify Supabase credentials |

---

## 🎯 NEXT STEPS

1. ✅ Create GitHub repos for frontend & backend
2. ✅ Deploy frontend to Vercel
3. ✅ Deploy backend to Render
4. ✅ Verify all systems communicate
5. ⏭️ Setup monitoring/logging
6. ⏭️ Setup custom domain (optional)

---

**STATUS**: READY FOR PRODUCTION DEPLOYMENT  
**CREATED**: April 1, 2026  
**MAINTAINER**: Your Team

---

## 📖 REFERENCE DOCS

- **Frontend README**: [web-buku-frontend/README.md](../web-buku-frontend/README.md)
- **Backend README**: [web-buku-backend/README.md](../web-buku-backend/README.md)
- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

Ready to deploy? Let's go! 🚀
