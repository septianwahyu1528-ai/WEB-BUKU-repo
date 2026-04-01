# ✅ DEPLOYMENT CHECKLIST

## ✓ Pre-Deployment Setup

### 1. Supabase Setup
- [ ] Buat Supabase account di https://supabase.com
- [ ] Buat project baru di Supabase (pilih region Asia)
- [ ] Catat credentials:
  - [ ] Project URL
  - [ ] Anon Key
  - [ ] Service Role Key
- [ ] Setup database tables (jalankan SQL scripts jika diperlukan)
- [ ] Test koneksi database dari lokal

### 2. Project Preparation
- [ ] Review `.env.local` sudah terisi dengan Supabase credentials
- [ ] Update `JWT_SECRET` dengan nilai yang aman (minimal 32 karakter)
- [ ] Pastikan `FRONTEND_URL` sesuai dengan domain Vercel nanti
- [ ] Run `npm install` untuk memastikan semua dependencies
- [ ] Test `npm run build` berhasil tanpa error
- [ ] Test `npm run dev` berjalan dengan baik

### 3. Version Control
- [ ] Initialize git jika belum: `git init`
- [ ] Add semua file: `git add .`
- [ ] Commit: `git commit -m "Initial commit: Persiapan deployment"`
- [ ] Push ke GitHub: `git push origin main`
- [ ] Verify repository terlihat di GitHub

### 4. Security Checklist
- [ ] `.env` file TIDAK ada di git (check `.gitignore`)
- [ ] Jangan ada secret/key hardcoded di source code
- [ ] JWT_SECRET aman dan random
- [ ] Service Key tidak disimpan di frontend code

---

## ✓ Deployment to Vercel

### 1. Connect GitHub ke Vercel
- [ ] Signup/Login di https://vercel.com
- [ ] Authorize Vercel untuk akses GitHub
- [ ] Grant permission ke repository

### 2. Create New Project
- [ ] Dashboard → "Add New..." → "Project"
- [ ] Select repository dari GitHub
- [ ] Framework: **Vite**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Environment Variables sudah tercopy? **NO** → Lanjut ke step 3

### 3. Setup Environment Variables di Vercel
- [ ] Klik "Add" untuk Environment Variable
- [ ] Tambahkan:
  ```
  VITE_SUPABASE_URL = <paste dari Supabase>
  VITE_SUPABASE_ANON_KEY = <paste dari Supabase>
  SUPABASE_SERVICE_KEY = <paste dari Supabase>
  SUPABASE_URL = <sama dengan VITE_SUPABASE_URL>
  JWT_SECRET = <isi dengan secret yang aman>
  FRONTEND_URL = https://[PROJECT_NAME].vercel.app
  NODE_ENV = production
  ```
- [ ] Verify semua variable sudah tercopy dengan benar
- [ ] **Important**: Copy/paste dengan hati-hati, jangan ada space tambahan

### 4. Deploy
- [ ] Klik "Deploy" button
- [ ] Monitor build progress (biasanya 2-3 menit)
- [ ] Tunggu deploy complete (bisa dilihat di Vercel dashboard)

### 5. Verify Deployment
- [ ] Buka live URL: `https://[PROJECT_NAME].vercel.app`
- [ ] Halaman loading dengan benar?
- [ ] Coba click beberapa menu
- [ ] Check console untuk error (F12 → Console tab)

---

## ✓ Post-Deployment Testing

### 1. Health Check
- [ ] curl: `curl https://[YOUR_DOMAIN]/api/health`
- [ ] Response: `{"status":"ok","timestamp":"..."}`

### 2. Frontend Testing
- [ ] [ ] Homepage load dengan baik
- [ ] [ ] Responsive di mobile
- [ ] [ ] Semua images load (jika ada)
- [ ] [ ] Navigation bekerja

### 3. API Testing
- [ ] GET `/api/books` berhasil
- [ ] POST `/api/auth/register` bisa buat user baru
- [ ] POST `/api/auth/login` bisa login
- [ ] Protected routes perlu token

### 4. Database Connection
- [ ] [ ] Supabase credentials benar
- [ ] [ ] Database dapat diakses dari Vercel
- [ ] [ ] Queries berjalan normal

### 5. Error Monitoring
- [ ] Cek Vercel Logs untuk error
- [ ] Monitor `/api/health` berkala untuk uptime

---

## ✓ Domain Setup (Opsional)

### 1. Configure Custom Domain
- [ ] Vercel Dashboard → Project Settings → Domains
- [ ] Add custom domain
- [ ] Update DNS records di domain registrar (Namecheap, GoDaddy, dll)
- [ ] Wait 15-60 minutes untuk DNS propagation
- [ ] Verify domain terconnect

### 2. SSL Certificate
- [ ] Vercel otomatis setup SSL (HTTPS)
- [ ] Verify padlock di browser ✓

---

## ✓ Ongoing Maintenance

### Weekly
- [ ] Check Vercel analytics → Response times normal?
- [ ] Monitor error logs
- [ ] Cek bandwidth usage

### Monthly
- [ ] Run `npm audit` untuk security vulnerabilities
- [ ] Review logs untuk unusual activity
- [ ] Backup Supabase data

### As Needed
- [ ] Update dependencies: `npm update`
- [ ] Deploy fixes/updates

---

## Troubleshooting Guide

### Build Fails
❌ "Cannot find module"
→ Run `npm install` dan retry build

❌ "Vite build error"
→ Check vite.config.js syntax

### Deployment Fails
❌ "No build output"
→ Verify output directory is `dist`

❌ "Out of memory"
→ Optimize build atau upgrade Vercel plan

### Runtime Errors
❌ "Cannot connect to database"
→ Verify Supabase credentials di environment variables

❌ "API returns 500"
→ Check Vercel logs untuk error detail

❌ "CORS error"
→ Update `FRONTEND_URL` environment variable

---

## Rollback if Needed

### Revert to Previous Version
```bash
git log --oneline  # cari commit sebelumnya
git revert <commit-hash>
git push
# Vercel otomatis redeploy
```

### Or Redeploy Specific Version
- Di Vercel Dashboard → Deployments
- Pilih deployment sebelumnya
- Klik "Redeploy"

---

## Success Checklist
- [x] Project deployed ke Vercel
- [x] Database terkoneksi
- [x] Semua API endpoint berfungsi
- [x] Frontend load dengan benar
- [x] HTTPS/SSL working
- [x] Monitoring setup

**Selamat! Project sudah live di production! 🚀**

---

## Useful Commands

```bash
# Restart deployment
vercel --prod

# View logs
vercel logs

# Remove old deployments
vercel remove <deployment>

# Full reset
vercel projects rm <project>
```

---

## Support

- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Documentation: https://vercel.com/docs
