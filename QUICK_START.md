# 🎯 QUICK START - Backend & Database Setup

## ⚡ Setup Cepat (5 Menit)

### 1️⃣ Install Dependencies
```bash
npm install express cors pg jsonwebtoken dotenv nodemon --save
```

### 2️⃣ Buat Database
**Option A - Command Line:**
```bash
psql -h localhost -U postgres -f database_complete_setup.sql
```

**Option B - PowerShell:**
```powershell
.\setup-backend.ps1
```

**Option C - pgAdmin GUI:**
- Buka pgAdmin → Tools → Query Tool
- Copy-paste isi `database_complete_setup.sql`
- Klik Execute

### 3️⃣ Jalankan Server

**Terminal 1 - Backend:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 🔓 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 👨‍💼 Admin | `admin@tokobuku.com` | `admin123` |
| 👤 User | `user@tokobuku.com` | `user123` |

---

## 🎛️ Role Permissions

### 🔴 ADMIN
- ✅ Lihat semua data
- ✅ CRUD Buku
- ✅ CRUD Pesanan
- ✅ CRUD Pelanggan
- ✅ Lihat Riwayat Belanja

### 🔵 USER
- ✅ Lihat Buku (read-only)
- ✅ Lihat Pesanan (read-only)
- ✅ Buat Pesanan
- ❌ Edit/Hapus Buku
- ❌ Hapus Pesanan
- ✅ Lihat Riwayat Belanja

---

## 📊 Data Lengkap di Database

### Users (2)
```
admin@tokobuku.com (admin)
user@tokobuku.com (user)
```

### Books (10)
```
1. Buku Campus - DIKA (Rp 85.000)
2. Buku Folio - JESICCA (Rp 79.000)
3. Buku Anak - REVAN (Rp 75.000)
4. Buku Cerita - YOGI (Rp 95.000)
5. Buku Pelajaran - TANGGUH (Rp 65.000)
6. Buku Jilid - NIFAIL (Rp 70.000)
7. Buku Notebook - ZAINAL (Rp 55.000)
8. Buku Tabungan - YUSUF MAHFUD (Rp 45.000)
9. Buku Tulis - REHAN (Rp 35.000)
10. Buku Kotak - REVANDRA (Rp 50.000)
```

### Customers (10)
```
DIKA, JESICCA, REVAN, YOGI, TANGGUH,
NIFAIL, ZAINAL, YUSUF MAHFUD, REHAN, REVANDRA
```

### Orders (7)
```
ORD-001 sampai ORD-007 dengan berbagai status
```

---

## 🔐 JWT Token System

Setiap login mendapat token valid 24 jam:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token berisi: `{id, email, role}`

---

## 🌐 API Endpoints

### Public (No Token)
```
POST   /api/auth/login           ✅ Login
POST   /api/auth/register        ✅ Register
GET    /api/books                ✅ Lihat semua buku
GET    /api/health               ✅ Health check
```

### Protected (Need Token)
```
GET    /api/customers            ✅ Lihat pelanggan
GET    /api/orders               ✅ Lihat pesanan
GET    /api/purchase-history     ✅ Lihat riwayat belanja

POST   /api/orders               ✅ Buat pesanan
POST   /api/customers            ✅ Buat pelanggan
POST   /api/purchase-history     ✅ Simpan belanja

PUT    /api/orders/:id           ✅ Update pesanan
PUT    /api/customers/:id        ✅ Update pelanggan
```

### Admin Only
```
POST   /api/books                ✅ Buat buku
PUT    /api/books/:id            ✅ Edit buku
DELETE /api/books/:id            ✅ Hapus buku
DELETE /api/orders/:id           ✅ Hapus pesanan
```

---

## 🛠️ Environment Variables

File `.env`:
```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tokobuku_db
JWT_SECRET=tokobuku_secret_key_2024
NODE_ENV=development
PORT=5000
```

---

## 📝 Database Schema

```sql
users (id, name, email, password, role)
books (id, title, author, price, stock, rating)
customers (id, name, email, phone, address, total_purchase)
orders (id, customer_id, book_id, quantity, status, order_date, delivery_date)
purchase_history (id, customer_id, total_amount, items, purchase_date)
```

---

## ✅ Verification Checklist

- [ ] Node.js terinstall
- [ ] PostgreSQL running
- [ ] Dependencies installed (`npm install...`)
- [ ] Database created dengan data
- [ ] Backend running di port 5000
- [ ] Frontend running di port 5173
- [ ] Login berhasil dengan admin account
- [ ] Token diterima setelah login
- [ ] Bisa akses /api/health

---

## 🚨 Common Issues

### Database Error?
```
❌ FATAL: password authentication failed
✅ Check DB_PASSWORD di .env sesuai PostgreSQL password
```

### Token Expired?
```
❌ Token tidak valid
✅ Login ulang untuk mendapat token baru (24h expiry)
```

### CORS Error?
```
❌ Access to XMLHttpRequest blocked by CORS
✅ Sudah ada cors middleware di backend
```

### Port Already in Use?
```
❌ Error: listen EADDRINUSE: address already in use :::5000
✅ Change PORT di .env atau stop process lain
```

---

## 📚 Files Created

```
server/
├── index.js                    ← Backend server utama

database_complete_setup.sql     ← Database setup lengkap
.env                           ← Environment variables
BACKEND_SETUP_GUIDE.md        ← Panduan detail
setup-backend.ps1             ← Automated setup script
QUICK_START.md                ← File ini
```

---

## 🎓 Next Steps

1. ✅ Login dengan credentials admin/user
2. ✅ Test API dengan Postman/cURL
3. ✅ Connect frontend ke backend API
4. ✅ Implementasi real database calls
5. ✅ Deploy ke production

---

Semua sudah siap! Tinggal jalankan dan enjoy! 🚀
