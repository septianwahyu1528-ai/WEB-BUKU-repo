# 🚀 QUICK REFERENCE - TOKO BUKU

## ⚡ Mulai Sekarang (30 detik)

```bash
npm run dev
```

**SELESAI!** Buka browser ke local address yang muncul.

---

## 🔗 URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:5173 (or 5174) | Auto-open |
| Backend | http://localhost:5000 | Running |
| Health Check | http://localhost:5000/api/health | ✅ |

---

## 🔐 Login

**Admin**
- Email: admin@tokobuku.com
- Pass: admin123

**Customer**
- Email: pelanggan1@toko.buku.com
- Pass: pelanggan123

---

## 📝 Available Commands

```bash
npm run dev              # Start backend + frontend (RECOMMENDED)
npm run server          # Backend only
npm run server:dev      # Backend with auto-reload
npm run build           # Build for production
npm run setup-db        # Initialize database
```

---

## ✅ What's Fixed

- ✅ Backend starts without crashing
- ✅ Frontend automatically connects
- ✅ Smart error handling
- ✅ Offline mode with fallback
- ✅ Clear status messages
- ✅ Auto-retry every 5 seconds
- ✅ Error "Gagal terhubung server" FIXED!

---

## ❌ If Issues

1. **Port already in use?**
   ```
   → Vite auto-uses next port. Normal!
   ```

2. **Database error?**
   ```
   → Make sure PostgreSQL is running
   → Check Windows Services or: psql -U postgres -c "SELECT 1"
   ```

3. **Backend not starting?**
   ```
   → Check .env file exists & has DB config
   → Delete node_modules & run: npm install
   ```

---

## 📚 Learn More

- `README_FIRST.md` - Full guide
- `STARTUP_GUIDE.md` - Troubleshooting
- `FIXES_APPLIED.md` - Technical details
- `✅_FINAL_STATUS.txt` - Complete summary

---

## 🎯 Verification

```bash
node verify-fixes.js
```

Expected: ✅ ALL FIXES VERIFIED!

---

**Ready?** Just run:
```bash
npm run dev
```

Enjoy! 📚✨
