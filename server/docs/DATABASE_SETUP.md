# 📚 Database & Backend Setup Guide

## Persyaratan
- **Node.js** v16+ ([Download](https://nodejs.org))
- **PostgreSQL** v12+ ([Download](https://www.postgresql.org/download/))

## 🚀 Setup Cepat

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database PostgreSQL

#### Opsi A: Otomatis dengan Script Node.js (Recommended)
```bash
npm run setup-db
```
Script ini akan:
- ✓ Membuat database `tokobuku_db`
- ✓ Membuat tabel (users, books, customers, orders)
- ✓ Insert sample data
- ✓ Verifikasi koneksi

#### Opsi B: Manual dengan psql
```bash
# Set password PostgreSQL
$env:PGPASSWORD = "your_postgres_password"

# Jalankan init script
psql -h localhost -U postgres -d tokobuku_db -f server/database/init.sql
```

#### Opsi C: Menggunakan Docker Compose
```bash
# Jalankan PostgreSQL + pgAdmin di container
docker-compose up -d

# Lihat log
docker-compose logs -f postgres
```

**Akses pgAdmin:**
- URL: http://localhost:5050
- Email: admin@tokobuku.com
- Password: admin123

### 3. Jalankan Backend Server

```bash
# Development (dengan auto-reload)
npm run server:dev

# Production
npm run server
```

Server akan berjalan di: **http://localhost:5000**

### 4. Jalankan Frontend (di terminal lain)

```bash
npm run dev
```

Frontend akan berjalan di: **http://localhost:5173**

## 📋 Database Schema

### Users Table
```sql
users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) [admin|user],
  created_at TIMESTAMP
)
```

### Books Table
```sql
books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  price VARCHAR(50),
  image VARCHAR(255),
  rating DECIMAL(3, 2),
  stock INTEGER,
  description TEXT,
  created_at TIMESTAMP
)
```

### Customers Table
```sql
customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  join_date TIMESTAMP,
  total_purchase VARCHAR(50)
)
```

### Orders Table
```sql
orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER (FK),
  book_id INTEGER (FK),
  quantity INTEGER,
  total_price VARCHAR(50),
  order_date TIMESTAMP,
  status VARCHAR(50),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
)
```

## 🔑 Kredensial Default

### PostgreSQL (Docker)
- User: `tokobuku_user`
- Password: `tokobuku_password`
- Host: `localhost`
- Port: `5432`
- Database: `tokobuku_db`

### Test Accounts
- **Admin**: admin@tokobuku.com / admin123
- **User**: user@tokobuku.com / user123

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user baru

### Books
- `GET /api/books` - List semua buku
- `GET /api/books/:id` - Detail buku
- `POST /api/books` - Tambah buku (admin only)
- `PUT /api/books/:id` - Update buku (admin only)
- `DELETE /api/books/:id` - Hapus buku (admin only)

### Customers
- `GET /api/customers` - List pelanggan (auth required)
- `POST /api/customers` - Tambah pelanggan (auth required)
- `PUT /api/customers/:id` - Update pelanggan (auth required)
- `DELETE /api/customers/:id` - Hapus pelanggan (auth required)

### Orders
- `GET /api/orders` - List pesanan (auth required)
- `POST /api/orders` - Buat pesanan (auth required)
- `PUT /api/orders/:id` - Update status pesanan (auth required)
- `DELETE /api/orders/:id` - Hapus pesanan (admin only)

### Purchase History
- `GET /api/purchase-history` - Riwayat pembelian (auth required)
- `POST /api/purchase-history` - Tambah riwayat (auth required)

## 🐛 Troubleshooting

### Error: "psql not found"
Pastikan PostgreSQL terinstall dan ditambahkan ke PATH sistem.

### Error: "Database connection refused"
- Pastikan PostgreSQL service sudah berjalan
- Cek kredensial di `server/index.js`
- Untuk Docker: jalankan `docker-compose up -d`

### Error: "EADDRINUSE: address already in use :::5000"
Port 5000 sudah digunakan. Ubah PORT di `.env`:
```
PORT=5001
```

### Database tidak terinisialisasi
```bash
# Hapus database lama dan buat baru
npm run setup-db

# Atau jika pakai Docker
docker-compose down
docker volume rm web-buku_postgres_data
docker-compose up -d
```

## 📁 Struktur Proyek

```
WEB-BUKU/
├── server/
│   ├── index.js (Backend Express)
│   ├── database/
│   │   ├── db.js (Database connection)
│   │   └── init.sql (Schema + sample data)
│   └── routes/
│       ├── auth.js
│       ├── books.js
│       ├── customers.js
│       └── orders.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── pages/
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── Dashboard.jsx
│       ├── Cart.jsx
│       ├── Orders.jsx
│       ├── Customers.jsx
│       └── ...
├── package.json
├── docker-compose.yml
├── setup-database.js
└── .env.example
```

## 🔗 Koneksi Database di Code

### Backend (Node.js)
```javascript
import { query } from './server/database/db.js';

const result = await query('SELECT * FROM books WHERE id = $1', [id]);
```

### Frontend (React)
```javascript
import axios from 'axios';

const fetchBooks = async () => {
  const response = await axios.get('http://localhost:5000/api/books');
  return response.data;
};
```

## ✅ Checklist Setup

- [ ] Node.js v16+ terinstall
- [ ] PostgreSQL v12+ terinstall dan berjalan
- [ ] Dependencies diinstall (`npm install`)
- [ ] Database terinisialisasi (`npm run setup-db`)
- [ ] Backend berjalan (`npm run server:dev`)
- [ ] Frontend berjalan (`npm run dev`)
- [ ] Bisa login dengan admin@tokobuku.com / admin123

## 📞 Support

Jika ada masalah, cek:
1. PostgreSQL status: `psql -h localhost -U tokobuku_user -d tokobuku_db`
2. Backend logs: `npm run server:dev`
3. Browser console untuk error frontend
4. Docker logs: `docker-compose logs`

---

**Created**: February 4, 2026  
**Last Updated**: February 4, 2026
