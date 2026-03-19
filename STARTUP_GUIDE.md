# 🚀 PANDUAN CEPAT MENJALANKAN TOKO BUKU

## ⚡ Cara Paling Cepat (Recommended)

### Windows PowerShell:
```powershell
.\start-app.ps1
```

### macOS/Linux Terminal:
```bash
npm run dev
```

---

## ❌ Error: "Gagal terhubung ke server"

### Apa itu?
Error ini muncul ketika aplikasi frontend (React) tidak bisa terhubung ke backend (Express) di `http://localhost:5000`.

### Penyebab Umum:
1. ❌ Backend server **tidak berjalan**
2. ❌ Database PostgreSQL **tidak aktif**
3. ❌ Port 5000 **sudah terpakai**
4. ❌ Port 5173 (frontend) **sudah terpakai**

### ✅ Solusi:

#### Solusi 1: Jalankan dengan npm run dev (PALING MUDAH)
```bash
npm run dev
```
Ini akan menjalankan **KEDUA** server secara bersamaan:
- Express Backend: `http://localhost:5000`
- Vite Frontend: `http://localhost:5173`

**Tunggu 10-20 detik hingga kedua server siap!**

#### Solusi 2: Jalankan Backend & Frontend Terpisah

**Terminal 1 - Backend:**
```bash
npm run server:dev
```
*Tunggu hingga melihat: `✅ Server running on port 5000`*

**Terminal 2 - Frontend (di folder yang sama):**
```bash
npm run dev
```
*Tunggu hingga melihat: `➜  Local:   http://localhost:5173`*

#### Solusi 3: Troubleshooting

**Jika masih error setelah npm run dev:**

1. **Cek apakah backend benar-benar berjalan:**
   ```bash
   node check-server-status.js
   ```

2. **Cek apakah port 5000 sudah digunakan:**
   ```bash
   # Windows PowerShell:
   netstat -ano | findstr :5000
   
   # macOS/Linux:
   lsof -i :5000
   ```

3. **Kill proses yang menggunakan port 5000:**
   ```bash
   # Windows PowerShell:
   taskkill /PID <PID_NUMBER> /F
   
   # macOS/Linux:
   kill -9 <PID>
   ```

4. **Cek database PostgreSQL:**
   ```bash
   psql -U postgres -c "SELECT 1"
   ```
   
   Jika gagal, pastikan PostgreSQL berjalan:
   - **Windows**: Buka Services dan cari "PostgreSQL"
   - **macOS**: `brew services start postgresql`
   - **Linux**: `sudo systemctl start postgresql`

---

## 🎯 Cara yang Benar untuk Development

```
┌─────────────────────────────────────────────────┐
│          BUKA TERMINAL DI PROJECT ROOT          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Jalankan:  npm run dev                  │
└─────────────────────────────────────────────────┘
                      ↓
         ⏳ Tunggu 10-20 detik...
                      ↓
┌─────────────────────────────────────────────────┐
│  ✅ Backend siap: http://localhost:5000         │
│  ✅ Frontend siap: http://localhost:5173        │
│  ✅ Browser otomatis terbuka                    │
└─────────────────────────────────────────────────┘
```

---

## 📝 Informasi Penting

### Folder Penting:
```
project-root/
├── package.json          ← npm scripts
├── server/              ← Backend Express code
│   ├── index.js         ← Main entry point
│   └── database/        ← Database connection
├── src/                 ← Frontend React code
│   ├── pages/           ← React pages
│   ├── utils/api.js     ← API utility (centralized)
│   └── components/      ← React components
└── public/              ← Static files & images
```

### Scripts npm:
```bash
npm run dev           # Start backend + frontend together
npm run server        # Start backend only (production)
npm run server:dev    # Start backend only (dev with nodemon)
npm run build         # Build for production
npm run setup-db      # Setup database
```

### Ports:
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:5173`
- **PostgreSQL**: `localhost:5432`

---

## 🔧 API Configuration

Semua request API sudah automatic dipilih dengan benar:
- Di development: Vite proxy ke backend
- Di production: Direct connection ke localhost:5000

Lihat: `src/utils/api.js` untuk konfigurasi terpusat.

---

## 🆘 Masih Error?

Cek log error di developer console (F12):
1. Buka browser → Tekan `F12`
2. Pilih tab `Console`
3. Lihat pesan error detail
4. Screenshot dan bagikan error message yang muncul

### Kemungkinan Pesan Error:

**Error: `ERR_CONNECTION_REFUSED`**
→ Backend tidak berjalan. Jalankan `npm run dev`

**Error: `Network request failed`**
→ Frontend tidak bisa reach backend. Cek firewall/antivirus

**Error: `Database connection failed`**
→ PostgreSQL tidak berjalan. Nyalakan PostgreSQL

---

## ✨ Berhasil Menjalankan?

Jika sudah punya di dashboard tanpa error "Gagal terhubung ke server", berarti:
- ✅ Backend Express running
- ✅ PostgreSQL connected
- ✅ Frontend React connected
- ✅ Semua siap pakai!

**Nikmati aplikasi Toko Buku! 📚🎉**
