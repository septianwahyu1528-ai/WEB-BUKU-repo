# 🚀 PANDUAN DEPLOYMENT KE VERCEL

## Prasyarat
1. Project sudah di repository GitHub
2. Supabase account & project sudah dibuat
3. Node.js v18+ terinstal di lokal
4. Vercel CLI atau account di vercel.com

---

## STEP 1: Setup Supabase (Cloud Database)

### 1. Buat Project Supabase
- Kunjungi [supabase.com](https://supabase.com)
- Klik "New Project"
- Isi nama project dan region (pilih Asia untuk latensi rendah)
- Tunggu project selesai dibuat

### 2. Dapatkan Credentials
Masuk ke Supabase → Settings → API
Salin:
- **Project URL** → `VITE_SUPABASE_URL`
- **Anon Key** → `VITE_SUPABASE_ANON_KEY`
- **Service Role Key** → `SUPABASE_SERVICE_KEY`

### 3. Setup Database Tables
1. Di Supabase Dashboard → SQL Editor
2. Jalankan SQL script dari `server/database/init.sql` (jika ada)
3. Atau import schema secara manual

---

## STEP 2: Persiapkan Project Lokal

### 1. Update Environment Variables
Buat file `.env.local` di root project:
```
NODE_ENV=development
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
JWT_SECRET=your_jwt_secret_key_at_least_32_chars_long
FRONTEND_URL=http://localhost:5173
```

### 2. Install & Test Lokal
```bash
npm install
npm run build
npm run dev
```

### 3. Push ke GitHub
```bash
git add .
git commit -m "Persiapan untuk deployment Vercel"
git push
```

---

## STEP 3: Deploy ke Vercel

### Opsi A: Via Dashboard Vercel (Rekomendasi)

1. **Kunjungi** [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Klik "Add New..."** → "Project"

3. **Import Git Repository**
   - Pilih repository GitHub Anda
   - Klik "Import"

4. **Configure Project**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Jangan ubah yang lain

5. **Tambah Environment Variables**
   - Klik "Add" di section Environment Variables
   - Masukkan:
     ```
     VITE_SUPABASE_URL = https://YOUR_PROJECT_ID.supabase.co
     VITE_SUPABASE_ANON_KEY = YOUR_ANON_KEY...
     SUPABASE_SERVICE_KEY = YOUR_SERVICE_KEY...
     SUPABASE_URL = https://YOUR_PROJECT_ID.supabase.co
     JWT_SECRET = your_jwt_secret_key
     FRONTEND_URL = https://your-project.vercel.app
     NODE_ENV = production
     ```
   - ⚠️ JANGAN commit .env ke GitHub!

6. **Deploy**
   - Klik "Deploy"
   - Tunggu proses selesai (~2-3 menit)
   - Setelah selesai, klik URL untuk akses live

### Opsi B: Via Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Follow prompts dan setup environment variables
```

---

## STEP 4: Konfigurasi Domain (Opsional)

### Gunakan Domain Custom
1. Di Vercel Dashboard → Project Settings
2. Domains → Add Domain
3. Masukkan domain Anda
4. Update DNS records sesuai instruksi Vercel

### Auto-generated Domain
Vercel otomatis memberikan domain: `your-project-name.vercel.app`

---

## STEP 5: Testing & Monitoring

### Test Deployment
- Kunjungi URL live Anda
- Test login/register
- Test API endpoints

### Monitor Logs
- Di Vercel Dashboard → Deployment
- Klik deployment terbaru
- Tab "Logs" untuk error debugging

### Troubleshooting
- **Build Error?** → Check `vercel.json` config
- **Runtime Error?** → View logs di Vercel dashboard
- **Database Error?** → Verify Supabase credentials
- **CORS Error?** → Update `FRONTEND_URL` environment variable

---

## STEP 6: Update Lokal Repository

Setelah deployment berhasil, update git:
```bash
git tag v1.0.0 -m "Deployed to production"
git push origin v1.0.0
```

---

## ⚠️ PENTING: Security Best Practices

1. **Jangan commit .env** → Selalu gunakan `.env.local` atau `.env.default`
2. **Jangan expose Service Key** → Hanya gunakan di backend
3. **Enable Supabase RLS** → Row Level Security untuk database
4. **Setup CORS di Supabase** → Restrict origin ke domain Anda
5. **Rotate JWT Secret periodik** → Untuk security maksimal

---

## Monitoring & Maintenance

### Cek Health Endpoint
```bash
curl https://your-domain.vercel.app/api/health
```

### Monitor Performance
- Vercel Dashboard → Analytics
- Response time & bandwidth usage

### Update Dependencies
```bash
npm outdated
npm update
npm audit
```

---

## Upgrade (Paid Plans)

Jika traffic tinggi, upgrade di Vercel:
- **Hobby** (Gratis): Untuk development/testing
- **Pro** ($20/mo): Untuk production kecil
- **Enterprise**: Untuk scale besar

Billing di dashboard Vercel secara otomatis.

---

## Resources

- 📚 [Vercel Docs](https://vercel.com/docs)
- 📚 [Supabase Docs](https://supabase.com/docs)
- 📚 [React Deployment](https://react.dev/learn/deployment)

---

**Butuh bantuan?** Hubungi Vercel Support atau check documentation mereka.
