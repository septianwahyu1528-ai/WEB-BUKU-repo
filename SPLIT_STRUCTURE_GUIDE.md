# 📁 SPLIT FRONTEND & BACKEND - IMPLEMENTATION GUIDE

Date: April 1, 2026
Status: PREPARATION IN PROGRESS

---

## 🎯 STRUKTUR BARU (TERPISAH)

Dari struktur lama:
```
web-buku-repo/ (1 repo untuk semuanya)
├ src/ (frontend)
├ server/ (backend)
├ api/
├ public/
└ package.json (gabungan)
```

Menjadi struktur baru:
```
web-buku-frontend/ (Repository terpisah #1)
├ src/
├ public/
├ index.html
├ vite.config.js/ts
├ tsconfig.json
├ package.json (FRONTEND ONLY)
└ .env.example

web-buku-backend/ (Repository terpisah #2)
├ server/
├ package.json (BACKEND ONLY)
├ vercel.json (atau config untuk Render/Railway)
├ .env.example
└ README.md
```

---

## 📊 BENEFITS SPLIT STRUCTURE

✅ **Development**
- Lebih clean, simpler dependency management
- Frontend dev tidak perlu install backend deps
- Faster install: `npm install` lebih cepat

✅ **Deployment**
- Frontend & backend bisa deploy independently
- Bisa update frontend tanpa redeploy backend (vice versa)
- Scalability: backend bisa scale terpisah
- CI/CD lebih simple untuk masing-masing

✅ **Team Collaboration**
- Frontend dev fokus di `/frontend` folder
- Backend dev fokus di `/backend` folder
- Tidak ada conflict git yang kompleks

✅ **Performance**
- Frontend build artifacts tidak tercampur
- Backend API lebih lean without frontend code
- CDN serving frontend separately

---

## 🚀 PHASE 1: CREATE FOLDER STRUCTURE LOCALLY

### Step 1: Buat Folder Frontend

```bash
cd "c:\Users\NEW EDHOCATION\Documents"
mkdir web-buku-frontend
cd web-buku-frontend

# Copy files dari existing project
copy ..\WEB-BUKU\src src
copy ..\WEB-BUKU\public public
copy ..\WEB-BUKU\index.html .
copy ..\WEB-BUKU\vite.config.js .
copy ..\WEB-BUKU\vite.config.ts .
copy ..\WEB-BUKU\tsconfig.json .
copy ..\WEB-BUKU\tsconfig.node.json .
copy ..\WEB-BUKU\FRONTEND_package.json package.json
```

**Frontend Structure:**
```
web-buku-frontend/
├ src/
│  ├ components/
│  ├ pages/
│  ├ styles/
│  ├ utils/
│  ├ App.jsx
│  ├ main.jsx
│  └ index.css
├ public/
│  └ images/
├ index.html
├ vite.config.js
├ tsconfig.json
├ tsconfig.node.json
├ package.json
├ .env.example
└ .gitignore
```

### Step 2: Buat Folder Backend

```bash
cd "c:\Users\NEW EDHOCATION\Documents"
mkdir web-buku-backend
cd web-buku-backend

# Copy files dari existing project
copy ..\WEB-BUKU\server server
copy ..\WEB-BUKU\BACKEND_package.json package.json
copy ..\WEB-BUKU\vercel.json .
copy ..\WEB-BUKU\.env.example .env.example
```

**Backend Structure:**
```
web-buku-backend/
├ server/
│  ├ index.js (main server)
│  ├ supabase.js (Supabase client)
│  ├ database/
│  └ routes/
├ package.json
├ vercel.json (atau railway.json, render.json)
├ .env.example
└ README.md
```

---

## 🔗 PHASE 2: UPDATE API ENDPOINTS

### Frontend: Setup API Base URL

**File:** `web-buku-frontend/.env.example`

```env
VITE_API_URL=http://localhost:5000                    # Development
# VITE_API_URL=https://api.web-buku.com               # Production
```

**File:** `web-buku-frontend/src/utils/api.js` (create or update)

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
```

**Update all API calls in components:**

```javascript
// BEFORE:
fetch('/api/books')

// AFTER:
fetch(`${import.meta.env.VITE_API_URL}/api/books`)
// or use:
api.get('/books')
```

### Backend: Setup CORS for Frontend Domain

**File:** `web-buku-backend/server/index.js`

```javascript
const corsOptions = {
    origin: [
        'http://localhost:5173',           // Dev frontend
        'http://localhost:3000',           // Alternative dev
        process.env.FRONTEND_URL || '',    // Production frontend
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

---

## 📦 PHASE 3: SETUP ENVIRONMENT VARIABLES

### Frontend `.env.local` (Development)

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Backend `.env.local` (Development)

```env
NODE_ENV=development
PORT=5000

VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
SUPABASE_URL=https://xxxxx.supabase.co
JWT_SECRET=your-secret-key-min-32-char
FRONTEND_URL=http://localhost:5173
```

---

## 🧪 PHASE 4: TEST LOCALLY

### Terminal 1: Run Backend

```bash
cd web-buku-backend
npm install
npm run dev
# Backend running di http://localhost:5000
```

### Terminal 2: Run Frontend

```bash
cd web-buku-frontend
npm install
npm run dev
# Frontend running di http://localhost:5173
```

### Test API Communication

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test from browser
# Visit http://localhost:5173
# Open DevTools → Network tab
# Try login/register - check API calls
```

---

## 🌐 PHASE 5: GITHUB REPOSITORIES

### Create 2 New Repositories

**Repository 1: web-buku-frontend**
- Add: `/web-buku-frontend` folder contents
- `npm install`
- `git init`
- `git add .`
- `git commit -m "Initial frontend commit"`
- `git remote add origin https://github.com/YOUR-USERNAME/web-buku-frontend.git`
- `git push -u origin main`

**Repository 2: web-buku-backend**
- Add: `/web-buku-backend` folder contents
- `npm install`
- `git init`
- `git add .`
- `git commit -m "Initial backend commit"`
- `git remote add origin https://github.com/YOUR-USERNAME/web-buku-backend.git`
- `git push -u origin main`

---

## 🚀 PHASE 6: DEPLOYMENT

### Frontend Deployment (Vercel)

1. **Vercel Dashboard** → Add New Project
2. **Select:** `web-buku-frontend` repository
3. **Framework:** Vite
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Environment Variables:**
   - `VITE_API_URL = https://api-web-buku.render.com` (backend URL)
7. **Deploy** ✓

### Backend Deployment (Render or Railway)

#### Option A: Render.com

1. **Render Dashboard** → New → Web Service
2. **Connect:** `web-buku-backend` GitHub repo
3. **Runtime:** Node
4. **Build Command:** ` npm install`
5. **Start Command:** `npm start`
6. **Environment Variables:**
   - All 8 variables from `.env`
7. **Deploy** ✓
8. **Copy Render URL** (e.g., `https://api-web-buku.render.com`)

#### Option B: Railway.app

1. **Railway Dashboard** → New Project
2. **Deploy from GitHub**
3. **Select:** `web-buku-backend`
4. **Add Variables** from `.env`
5. **Deploy** ✓

---

## ✅ DEPLOYMENT CHECKLIST

### Frontend
- [ ] Frontend repo di GitHub
- [ ] Deployed to Vercel
- [ ] **Get Vercel URL** (e.g., `https://web-buku-frontend.vercel.app`)
- [ ] Update `FRONTEND_URL` di backend

### Backend
- [ ] Backend repo di GitHub
- [ ] Deployed to Render/Railway
- [ ] **Get Backend URL** (e.g., `https://api-web-buku.render.com`)
- [ ] Update `VITE_API_URL` di frontend to this URL

### Cross-Domain Testing
- [ ] Test API calls from production frontend to backend
- [ ] CORS errors fixed
- [ ] Login/Register works
- [ ] Orders/History works

---

## 📝 Files to Copy/Update

### Frontend package.json
- Location: `web-buku-frontend/`
- Use: `FRONTEND_package.json` as template

### Backend package.json
- Location: `web-buku-backend/`
- Use: `BACKEND_package.json` as template

### Environment Files

**Frontend .env.example:**
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Backend .env.example:**
```env
NODE_ENV=development
PORT=5000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SUPABASE_URL=
JWT_SECRET=
FRONTEND_URL=
```

---

## 🎯 NEXT STEPS

1. ✅ Create `web-buku-frontend/` folder structure
2. ✅ Create `web-buku-backend/` folder structure
3. ✅ Update API endpoints in both
4. ✅ Test locally
5. ✅ Push to GitHub (2 repos)
6. ✅ Deploy frontend to Vercel
7. ✅ Deploy backend to Render/Railway
8. ✅ Test production deployment

---

**Status**: Ready to execute!
**Estimated Time**: 1-2 hours (first time setup)
**Complexity**: Medium

Ready to proceed? 🚀
