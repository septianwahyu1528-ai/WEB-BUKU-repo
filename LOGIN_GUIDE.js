#!/usr/bin/env node

/**
 * Guide Lengkap untuk Login dan Melihat Data
 * Copy-paste perintah ini ke PowerShell
 */

console.log(`
╔════════════════════════════════════════════════════════════╗
║    🔐 PANDUAN LENGKAP - LOGIN & TAMPILKAN DATA PELANGGAN   ║
╚════════════════════════════════════════════════════════════╝

📋 PERSYARATAN:
✅ Backend server harus berjalan di port 5000
✅ Frontend harus berjalan di port 5173

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 STEP 1: Jalankan Backend Server
┌─────────────────────────────────────────────────────────┐
│ TERMINAL 1 (Backend)                                     │
│                                                          │
│ $ cd "c:\\Users\\NEW EDHOCATION\\Documents\\WEB-BUKU"   │
│ $ node server/index.js                                   │
│                                                          │
│ Tunggu sampai muncul:                                   │
│ ✅ Server berjalan di http://localhost:5000             │
│ ✅ Database connected successfully                      │
└─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 STEP 2: Jalankan Frontend Dev Server
┌─────────────────────────────────────────────────────────┐
│ TERMINAL 2 (Frontend)                                    │
│                                                          │
│ $ cd "c:\\Users\\NEW EDHOCATION\\Documents\\WEB-BUKU"   │
│ $ npm run dev                                            │
│                                                          │
│ Tunggu sampai muncul URL seperti:                       │
│ ➜  Local:   http://localhost:5173/                      │
└─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 STEP 3: Buka Browser
┌─────────────────────────────────────────────────────────┐
│ Buka URL: http://localhost:5173                          │
│                                                          │
│ Seharusnya muncul halaman LOGIN dengan form kosong      │
└─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 STEP 4: Masukkan Credentials
┌─────────────────────────────────────────────────────────┐
│ Email:    admin@tokobuku.com                            │
│ Password: admin123                                       │
│                                                          │
│ Klik tombol "Login"                                     │
└─────────────────────────────────────────────────────────┘

ATAU pilih user lain:

│ Email:    user1@tokobuku.com                            │
│ Password: user123                                        │
└─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 STEP 5: Setelah Login Berhasil
┌─────────────────────────────────────────────────────────┐
│ Klik menu di navbar:                                    │
│                                                          │
│ 1. "Pelanggan" → lihat 5 customers                      │
│ 2. "Pesanan" → lihat 7 orders                           │
│ 3. "Produk" → lihat 10 books                            │
└─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❓ JIKA TIDAK BISA LOGIN:

1️⃣  Pastikan Backend SUDAH berjalan:
    • Buka http://localhost:5000/api/health di browser
    • Harus muncul: {"status":"Server running"...}

2️⃣  Lihat error di Console:
    • Buka F12 → Console tab
    • Cari error message (CORS? Network? 404?)

3️⃣  Lihat Network tab:
    • Buka F12 → Network tab
    • Klik Login
    • Cari request ke "localhost:5000/api/auth/login"
    • Check response status dan message

4️⃣  Cek localStorage:
    • Buka F12 → Application tab
    • Lihat localStorage
    • Harus ada key "token" dan "user" setelah login

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 BUTUH BANTUAN?

Share error atau screenshot, saya siap membantu!

═════════════════════════════════════════════════════════════
`);

process.exit(0);
