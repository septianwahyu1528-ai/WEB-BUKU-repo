# 🚨 TROUBLESHOOTING: Backend Offline di Vercel

**Symptom**: Backend berjalan di mode OFFLINE - tidak bisa connect ke database
**Root Cause**: Environment variables untuk Supabase tidak ter-set di Vercel dashboard

---

## 🔧 DIAGNOSIS & FIX

### STEP 1: Check Environment Variables di Vercel

1. Buka https://vercel.com/dashboard
2. Pilih project "WEB-BUKU"
3. **Settings** → **Environment Variables**
4. Verifikasi 8 variables sudah ada:

```
✓ VITE_SUPABASE_URL
✓ VITE_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_KEY
✓ SUPABASE_URL
✓ JWT_SECRET
✓ FRONTEND_URL
✓ NODE_ENV = production
✓ PORT = 3000
```

❌ **Jika ada yang hilang?** → Lanjut ke STEP 2

---

### STEP 2: Setup Environment Variables di Vercel

#### **Cara 1: Via Dashboard (Recommended)**

1. Di **Environment Variables** page
2. Klik **"Add New Variable"** untuk setiap yang hilang
3. Inputkan:

```env
# 1. Supabase URL
Name: VITE_SUPABASE_URL
Value: https://xxxxx.supabase.co
✓ Production  ✓ Preview  ✓ Development

# 2. Supabase Anon Key
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✓ Production  ✓ Preview  ✓ Development

# 3. Supabase Service Key (BACKEND ONLY!)
Name: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✓ Production  ✓ Preview  ✓ Development

# 4. Supabase URL (sama dengan #1)
Name: SUPABASE_URL
Value: https://xxxxx.supabase.co
✓ Production  ✓ Preview  ✓ Development

# 5. JWT Secret
Name: JWT_SECRET
Value: [random 32 karakter string]
✓ Production  ✓ Preview  ✓ Development

# 6. Frontend URL
Name: FRONTEND_URL
Value: https://your-project.vercel.app
✓ Production  ✓ Preview  ✓ Development

# 7. Node Environment
Name: NODE_ENV
Value: production
✓ Production

# 8. Port
Name: PORT
Value: 3000
✓ Production
```

4. **PENTING**: Klik tombol **[Save]** untuk setiap variable
5. Tunggu sebentar hingga tersimpan

---

### STEP 3: Redeploy di Vercel

1. **Deployments** tab
2. Pilih deployment terakhir (yang offline)
3. Klik **"Redeploy"**
4. Tunggu build ulang (~2-3 menit)

---

### STEP 4: Test Health Endpoint

Setelah redeploy berhasil, cek kesehatan backend:

```bash
curl https://your-project.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "backend": "running",
  "supabase": {
    "url": "✓ Connected",
    "credentials": "✓ Found",
    "message": "Supabase ready"
  },
  "jwt": "✓ Configured",
  "environment": "production"
}
```

**Jika masih error?** → Lihat section DEBUG TRACES di bawah

---

## 🔍 DEBUG: Vercel Build Logs

### Cara Melihat Logs

1. https://vercel.com/dashboard
2. Pilih project
3. **Deployments** → pilih deployment yang error
4. **Logs** tab → scroll untuk lihat error message

### Common Error Messages

#### ❌ Error: "Cannot connect to database"
```
Reason: SUPABASE_SERVICE_KEY or VITE_SUPABASE_URL tidak di-set
Fix: Cek env variables di Vercel, pastikan sudah tersave
```

#### ❌ Error: "VITE_SUPABASE_URL is undefined"
```
Reason: Environment variable tidak ter-pass ke serverless function
Fix: Redeploy setelah menambah env variables
```

#### ❌ Error: "jwt malformed"
```
Reason: JWT_SECRET tidak match atau tidak ter-set
Fix: Generate JWT_SECRET baru atau pastikan sama di semua tempat
```

---

## ✓ Verification Checklist

Sebelum declare berhasil:

- [ ] Vercel build status: ✅ SUCCESS (bukan error)
- [ ] Health endpoint returns: "supabase": "✓ Connected"
- [ ] Frontend loads: https://your-project.vercel.app
- [ ] Login page bisa di-akses
- [ ] Try register account → berhasil
- [ ] Try login → berhasil
- [ ] Cek Supabase dashboard → data user tersimpan di database

---

## 🆘 What If Still Offline?

### Check #1: Supabase Credentials Valid?

Di Supabase dashboard:
- Settings → API
- Copy ulang VITE_SUPABASE_URL dan keys
- Paste lagi di Vercel (overwrite yang lama)
- Redeploy

### Check #2: Supabase Project Status

Di Supabase:
- Dashboard → Settings → General
- Project status: Active ✓ atau Suspended ❌?
- If suspended → upgrade atau check billing

### Check #3: Network/Firewall

Di Supabase:
- Settings → Network
- Check network restrictions
- If any IP restrictions → disable untuk test

### Check #4: Database Tables Exist?

Di Supabase:
- SQL Editor
- Run: `SELECT * FROM customers LIMIT 1;`
- If error "relation does not exist" → tables belum ada
- Solution: Import schema dari backup atau buat manual

---

## 📝 If Nothing Works: Nuclear Option

**Restart everything from scratch:**

1. **Delete deployment di Vercel**
   ```
   Vercel Dashboard → Settings → Danger Zone → Delete Project
   ```

2. **Create new project from GitHub**
   ```
   Vercel → Add New → Project → Select WEB-BUKU-repo
   ```

3. **Setup env variables SEBELUM deploy**
   ```
   Before clicking [Deploy], add 8 variables in environment section
   ```

4. **Deploy**

---

## 📞 Contact Support

Jika masih stuck:

1. **Check Vercel Logs** lebih detail untuk error message
2. **Check Supabase Status** di status.supabase.com
3. **Vercel Support**: https://vercel.com/support
4. **Supabase Support**: https://supabase.com/support

---

**Status**: `DEBUGGING`
**Last Updated**: April 1, 2026

Coba ikuti steps di atas dan report hasilnya! 🚀
