# 🚀 Setup Backend & Database - Toko Buku

## 📋 Prerequisites
- PostgreSQL 15+ terinstall
- Node.js 16+ terinstall
- npm/yarn

## 🗄️ Step 1: Setup PostgreSQL Database

### Option A: Menggunakan psql Command Line
```bash
# 1. Buka PowerShell sebagai Administrator
# 2. Jalankan perintah berikut (ganti path sesuai folder project)
psql -h localhost -U postgres -f "C:\Users\RPL\Documents\WEB-BUKU\database_complete_setup.sql"

# 3. Masukkan password PostgreSQL saat diminta
```

### Option B: Menggunakan pgAdmin GUI
1. Buka pgAdmin (http://localhost:5050)
2. Login dengan:
   - Email: admin@tokobuku.com
   - Password: admin123
3. Right-click "Databases" → Create → Database
4. Nama: `tokobuku_db`
5. Klik Create
6. Buka Query Tool (Tools → Query Tool)
7. Copy-paste isi file `database_complete_setup.sql`
8. Klik Execute (F5)

---

## 📦 Step 2: Install Backend Dependencies

```bash
# 1. Navigasi ke folder project
cd C:\Users\RPL\Documents\WEB-BUKU

# 2. Install npm packages (frontend)
npm install

# 3. Install backend dependencies
npm install express cors pg jsonwebtoken dotenv nodemon

# Atau install sekaligus
npm install express cors pg jsonwebtoken dotenv nodemon --save
```

---

## ⚙️ Step 3: Setup Environment Variables

File `.env` sudah dibuat di root folder dengan isi:

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

**Sesuaikan jika:**
- Password PostgreSQL Anda berbeda
- Host PostgreSQL tidak localhost
- Port PostgreSQL tidak 5432

---

## 🚀 Step 4: Jalankan Backend Server

### Terminal 1 (Backend Server)
```bash
# Dari folder project
npm run server

# Atau dengan auto-reload
npm run server:dev
```

**Output yang diharapkan:**
```
✅ Server berjalan di http://localhost:5000
📚 Toko Buku API - Backend Server
🔐 JWT Authentication Enabled

📋 Endpoints tersedia:
  Auth: POST /api/auth/login, /api/auth/register
  Books: GET/POST/PUT/DELETE /api/books
  Customers: GET/POST/PUT/DELETE /api/customers
  Orders: GET/POST/PUT/DELETE /api/orders
  History: GET/POST /api/purchase-history

🔗 Health Check: GET /api/health
```

### Terminal 2 (Frontend Development)
```bash
# Dari folder project
npm run dev

# Output:
# VITE v... ready in ... ms
# ➜  Local:   http://localhost:5173/
```

---

## 🔐 Login Credentials

### Admin Account
- Email: `admin@tokobuku.com`
- Password: `admin123`
- Role: **ADMIN** (Akses penuh CRUD)

### User Account
- Email: `user@tokobuku.com`
- Password: `user123`
- Role: **USER** (Akses terbatas)

---

## 🔑 JWT Token System

Setiap login akan mendapat token JWT yang berlaku 24 jam:

```javascript
// Response login successful:
{
    "success": true,
    "message": "Login berhasil",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "email": "admin@tokobuku.com",
        "name": "Admin Toko Buku",
        "role": "admin"
    }
}
```

### Token Permissions:
- **ADMIN**: 
  - ✅ Buat/Edit/Hapus Buku
  - ✅ Hapus Pesanan
  - ✅ Lihat Semua Data
  
- **USER**:
  - ❌ Edit/Hapus Buku
  - ❌ Hapus Pesanan
  - ✅ Lihat Data Publik
  - ✅ Buat Pesanan

---

## 📊 Database Schema

### Users Table
```
id | name | email | password | role (admin/user) | created_at
```

### Books Table (10 buku)
```
id | title | author | price | stock | rating | created_at
```

### Customers Table (10 pelanggan)
```
id | name | email | phone | address | join_date | total_purchase | created_at
```

### Orders Table (7 pesanan)
```
id | customer_id | book_id | quantity | status | order_date | delivery_date | created_at
Status: Menunggu, Dalam Proses, Tertunda, Selesai, Dibatalkan
```

### Purchase History Table
```
id | customer_id | total_amount | items (JSON) | purchase_date | created_at
```

---

## 🧪 Test API Endpoints

### Using Postman / cURL / REST Client:

#### 1. Login (Dapatkan Token)
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@tokobuku.com",
  "password": "admin123"
}
```

#### 2. Get Books (Tidak perlu token)
```
GET http://localhost:5000/api/books
```

#### 3. Get Customers (Perlu token)
```
GET http://localhost:5000/api/customers
Authorization: Bearer [TOKEN_DARI_LOGIN]
```

#### 4. Create Book (Admin only)
```
POST http://localhost:5000/api/books
Authorization: Bearer [TOKEN_ADMIN]
Content-Type: application/json

{
  "title": "Buku Baru",
  "author": "Nama Author",
  "price": 85000,
  "stock": 10,
  "rating": 4.8
}
```

---

## 🔗 Frontend Integration

Update Login.jsx untuk connect ke backend:

```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onLogin(data.user);
        } else {
            setError(data.error);
        }
    } catch (err) {
        setError('Server tidak dapat diakses');
    }
};
```

---

## ⚠️ Troubleshooting

### Error: "Cannot connect to database"
- ✅ Pastikan PostgreSQL service running
- ✅ Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD di .env
- ✅ Buat database tokobuku_db terlebih dahulu

### Error: "Token tidak ditemukan"
- ✅ Pastikan Authorization header ada
- ✅ Format: `Authorization: Bearer [TOKEN]`

### Port 5000 sudah terpakai
- Edit `.env` dan ganti PORT dengan nomor lain (misal 5001)
- Atau stop proses yang menggunakan port 5000

### Frontend tidak bisa connect ke backend
- ✅ Pastikan backend sudah running (npm run server)
- ✅ Check CORS sudah enabled di server
- ✅ Check URL backend benar

---

## 📞 Summary

| Komponen | Port | Status |
|----------|------|--------|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Express) | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |
| pgAdmin | 5050 | http://localhost:5050 |

---

## ✅ Verifikasi Setup

1. **Backend Running?**
   - Buka browser: http://localhost:5000/api/health
   - Harus muncul: `{"status":"Server running","timestamp":"..."}`

2. **Database Connected?**
   - Check di Terminal backend
   - Harus ada log: `✅ Database connected successfully`

3. **Token Valid?**
   - Test login dengan Postman
   - Harus dapat JWT token

4. **Frontend Connected?**
   - Login di aplikasi dengan credentials admin/user
   - Harus sukses dan dapat token

---

Done! 🎉 Backend dan database sudah lengkap siap digunakan!
