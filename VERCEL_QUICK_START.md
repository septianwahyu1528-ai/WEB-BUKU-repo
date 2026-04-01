# 🚀 QUICK START DEPLOYMENT - VERCEL + SUPABASE

## 5 Langkah Cepat

### 1️⃣ Siapkan Supabase (5 menit)
```
1. Buka https://supabase.com/dashboard
2. Buat project baru (Asia region)
3. Tunggu selesai
4. Pergi ke Settings → API
5. Copy 3 key: Project URL, Anon Key, Service Key
```

### 2️⃣ Update Environment (.env.local)
```bash
# Buat file .env.local di root project
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
SUPABASE_URL=https://xxxxx.supabase.co
JWT_SECRET=isidenganstringrandom32karakter
FRONTEND_URL=http://localhost:5173
```

### 3️⃣ Push ke GitHub
```bash
git add .
git commit -m "ReadyForDeployment"
git push origin main
```

### 4️⃣ Deploy ke Vercel
```
1. Buka https://vercel.com/dashboard
2. Klik "Add New" → "Project"
3. Pilih GitHub repository
4. Framework: Vite
5. Build: npm run build
6. Output: dist
7. Klik "Environment Variables"
8. + Add punya tiga Supabase key
9. + Add JWT_SECRET
10. + Add FRONTEND_URL=https://[yourproject].vercel.app
11. Klik "Deploy"
12. Tunggu ✅ (2-3 menit)
```

### 5️⃣ Test & Go Live ✓
```
Buka: https://[yourproject].vercel.app
Test: Login → Order → History
Selamat! Sudah live 🎉
```

---

## ⚠️ Critical Environment Variables

```env
# WAJIB - dari Supabase Settings → API
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SUPABASE_URL=

# WAJIB - Security
JWT_SECRET=minimal 32 karakter random

# WAJIB saat deploy - ganti dengan domain Vercel
FRONTEND_URL=https://yourproject.vercel.app

# Opsional
NODE_ENV=production
```

---

## Troubleshooting 

| Problem | Solution |
|---------|----------|
| Build gagal | `npm install`, check vite.config.js |
| API 500 error | Cek env variables di Vercel dashboard |
| Database error | Verifikasi Supabase credentials |
| CORS error | Update FRONTEND_URL di env |
| Halaman blank | Check browser console (F12) |

---

## Links

- Vercel: https://vercel.com/dashboard
- Supabase: https://supabase.com/dashboard  
- Docs: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Full Checklist: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

**Ready? Mulai dari Step 1! 🚀**
