# Toko Buku - Book Store Management System

Sistem manajemen toko buku dengan frontend React dan backend Node.js menggunakan PostgreSQL.

## Prerequisites

- Node.js v18+
- Docker & Docker Compose
- PostgreSQL 15 (atau gunakan Docker)

## Setup Database

### Menggunakan Docker (Recommended)

1. **Start PostgreSQL dan pgAdmin:**
```bash
docker-compose up -d
```

2. **Akses pgAdmin:**
   - URL: `http://localhost:5050`
   - Email: `admin@tokobuku.com`
   - Password: `admin123`

3. **Setup Server Connection di pgAdmin:**
   - Hostname: `postgres`
   - Port: `5432`
   - Username: `tokobuku_user`
   - Password: `tokobuku_password`
   - Database: `tokobuku_db`

### Database Schema

**Tables:**
- `users` - Admin dan user credentials
- `books` - Informasi buku (judul, author, harga, stok)
- `customers` - Data pelanggan
- `orders` - Pesanan buku

## Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

## Running the Application

### Terminal 1 - Start Backend Server
```bash
npm run server:dev
```
Server akan berjalan di `http://localhost:5000`

### Terminal 2 - Start Frontend
```bash
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user baru

### Books
- `GET /api/books` - Get semua buku
- `GET /api/books/:id` - Get buku berdasarkan ID
- `POST /api/books` - Create buku baru
- `PUT /api/books/:id` - Update buku
- `DELETE /api/books/:id` - Delete buku

### Customers
- `GET /api/customers` - Get semua pelanggan
- `GET /api/customers/:id` - Get pelanggan berdasarkan ID
- `POST /api/customers` - Create pelanggan baru
- `PUT /api/customers/:id` - Update pelanggan
- `DELETE /api/customers/:id` - Delete pelanggan

## Default Credentials

**Login:**
- Email: `admin@tokobuku.com`
- Password: `admin123`

## Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Remove volumes (reset database)
docker-compose down -v
```

## Project Structure

```
WEB-BUKU/
├── server/
│   ├── database/
│   │   ├── db.js - Database connection
│   │   └── init.sql - Database schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   └── customers.js
│   └── index.js
├── src/
│   ├── pages/
│   └── styles/
├── docker-compose.yml
└── package.json
```

## Technologies

- **Frontend:** React, Vite, React Router
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Admin Panel:** pgAdmin
- **Containerization:** Docker

## Notes

- Database otomatis diinisialisasi dengan data sample saat pertama kali connect
- Gunakan pgAdmin untuk manage database secara visual
- Untuk production, gunakan environment variables yang proper dan secure password

## Troubleshooting

**Koneksi database error:**
```bash
# Check if PostgreSQL container is running
docker ps

# View PostgreSQL logs
docker-compose logs postgres
```

**Port already in use:**
```bash
# Change port di docker-compose.yml atau .env
```
