# 🎯 MULAI DI SINI!

## ⚡ Cara Termudah (30 detik)

Buka terminal di folder project dan jalankan:

```bash
npm run dev
```

**TUNGGU 10-20 detik** sampai kedua server siap!

✅ **Selesai!** Buka browser ke: `http://localhost:5173`

---

## ❌ Jika masih ada error "Gagal terhubung ke server"

**DON'T PANIC!** Ini sudah diperbaiki dengan:
- ✅ Smart connection retry
- ✅ Helpful error messages  
- ✅ Offline mode dengan mock data

### 3 Langkah Solusi:

1. **Pastikan backend berjalan:**
   ```bash
   npm run dev
   ```
   Tunggu hingga melihat: `✅ Server berjalan di http://localhost:5000`

2. **Check server status:**
   ```bash
   node check-server-status.js
   ```

3. **Read dokumentasi:**
   - 📖 `STARTUP_GUIDE.md` - Panduan lengkap
   - 📋 `FIXES_APPLIED.md` - Penjelasan detail semua perbaikan

---

## 🚀 Cara Alternatif (Windows)

Jalankan PowerShell script:
```powershell
.\start-app.ps1
```

Script ini akan:
1. ✅ Check semua requirements
2. ✅ Install dependencies
3. ✅ Setup database
4. ✅ Start both servers
5. ✅ Open browser

---

## 📚 Dokumentasi Penting

| File | Untuk Apa? |
|------|-----------|
| **STARTUP_GUIDE.md** | Panduan comprehensive & troubleshooting |
| **FIXES_APPLIED.md** | Penjelasan semua perbaikan yang dibuat |
| **SETUP_COMPLETE.txt** | Ringkasan changes untuk developer |

---

## ✨ Yang Sudah Diperbaiki

| Masalah Lama | Solusi Baru |
|-------------|-----------|
| ❌ URL hardcoded di banyak file | ✅ Centralized API utility (`src/utils/api.js`) |
| ❌ Error message membingungkan | ✅ Helpful, actionable error messages |
| ❌ Tidak ada status indicator | ✅ Visual banner saat backend down + auto-retry |
| ❌ Startup process rumit | ✅ `npm run dev` = satu command untuk semua |
| ❌ Offline tidak ada fallback | ✅ Automatic mock data dalam offline mode |

---

## 🎯 Tahapan Startup

```
$ npm run dev
       ↓
[Backend starting on port 5000...]
[Frontend starting on port 5173...]
       ↓
⏳ Tunggu 10-20 detik
       ↓
✅ Backend ready
✅ Frontend ready
✅ Browser opens automatically to http://localhost:5173
       ↓
🎉 Aplikasi siap digunakan!
```

---

## ⚙️ Port yang Digunakan

- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: `http://localhost:5000` (Express server)
- **Database**: `localhost:5432` (PostgreSQL)

---

## 📞 Bantuan Cepat

### Q: Masih error setelah `npm run dev`?
**A:** Baca `STARTUP_GUIDE.md` → Solusi terperinci

### Q: Backend tidak berjalan?
**A:** 
```bash
npm run server:dev
```
Tunggu sampai melihat: `✅ Server berjalan di http://localhost:5000`

### Q: Frontend tidak muncul?
**A:** 
- Buka manual: `http://localhost:5173`
- Atau jalankan: `npm run dev` lagi

### Q: PostgreSQL error?
**A:** Pastikan PostgreSQL running:
```bash
# Windows: Services → PostgreSQL
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Q: Port 5000/5173 sudah terpakai?
**A:** Baca `STARTUP_GUIDE.md` → Bagian "Port Conflict"

---

## 🚀 QUICK START CHECKLIST

- [ ] Buka terminal di project folder
- [ ] Jalankan: `npm run dev`
- [ ] Tunggu 10-20 detik
- [ ] Browser otomatis membuka aplikasi
- [ ] Login dengan:
  - **Admin**: admin@tokobuku.com / admin123
  - **Customer**: pelanggan1@toko.buku.com / pelanggan123
- [ ] ✅ Done!

---

## 📝 Catatan Penting

1. **Jangan matikan terminal** saat aplikasi berjalan (akan matikan server)
2. **Refresh browser** (F5) jika ada perubahan
3. **Dev tools** (F12) untuk debug jika ada error
4. **Clear cache** jika stuck: Ctrl+Shift+Delete (Chrome) / Cmd+Shift+Delete (Safari)

---

## 🎉 SIAP?

```bash
npm run dev
```

Tunggu browser terbuka, dan **nikmati Toko Buku!** 📚✨

---

**Untuk bantuan lengkap:** Cek `STARTUP_GUIDE.md`
**Untuk technical details:** Cek `FIXES_APPLIED.md`
