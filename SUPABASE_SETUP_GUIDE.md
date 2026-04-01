# 🔧 Setup Guide - Supabase Integration

Panduan lengkap setup Supabase untuk project Toko Buku.

## Prerequisites

- Node.js v16+ 
- npm atau yarn
- Akun Supabase (gratis di https://supabase.com)
- VS Code atau editor lainnya

---

## Step 1: Setup Supabase Project

### 1.1 Buat Project Supabase

1. Kunjungi [supabase.com](https://supabase.com)
2. Login atau buat akun baru
3. Klik "New Project"
4. Isi informasi:
   - **Project Name**: toko-buku
   - **Database Password**: Simpan password yang kuat (Anda akan membutuhkannya)
   - **Region**: pilih region terdekat (Indonesia: Singapore)
5. Klik "Create new project"
6. Tunggu project selesai di-provision (~2 menit)

### 1.2 Get Connection Credentials

1. Buka Project Settings > API
2. Copy dan simpan:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Key** → `VITE_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_KEY`

---

## Step 2: Setup Database Tables

### 2.1 Create Tables via SQL Editor

1. Buka Supabase Dashboard
2. Navigasi ke SQL Editor
3. Jalankan SQL script di bawah ini:

```sql
-- ============ CUSTOMERS TABLE ============
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Indonesia',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ BOOKS TABLE ============
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(20),
  stock INTEGER DEFAULT 0,
  cover_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ ORDERS TABLE ============
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  total_price DECIMAL(12, 2) NOT NULL,
  shipping_address TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ ORDER ITEMS TABLE ============
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============ CART ITEMS TABLE ============
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============ CREATE INDEXES ============
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_book_id ON order_items(book_id);
CREATE INDEX idx_cart_items_customer_id ON cart_items(customer_id);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_customers_email ON customers(email);
```

### 2.2 Setup Row Level Security (RLS)

Untuk produksi, aktifkan RLS di setiap tabel:

1. Buka Tabel > Authentication > RLS
2. Enable RLS
3. Buat policies:

```sql
-- Customers: Users bisa read/update profile mereka sendiri
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON customers FOR UPDATE
  USING (auth.uid() = id);

-- Orders: Users bisa read orders mereka sendiri
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

-- Books: Public read access
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read books"
  ON books FOR SELECT
  USING (true);
```

---

## Step 3: Setup Storage Buckets

### 3.1 Create Storage Buckets

1. Buka Supabase Dashboard > Storage
2. Buat bucket baru:
   - **Name**: book-covers
   - **Public**: ✓ (checked)
   - **File size limit**: 5MB

3. Buat bucket kedua (optional):
   - **Name**: customer-uploads
   - **File size limit**: 10MB

### 3.2 Setup CORS untuk Uploads

1. Storage > book-covers > Settings
2. CORS Configuration:

```json
[
  {
    "origin": "*",
    "methods": ["GET", "POST", "DELETE"],
    "allowedHeaders": ["authorization", "content-type"]
  }
]
```

---

## Step 4: Setup Environment Variables

### 4.1 Create .env file

Di root project:

```bash
cp .env.example .env
```

### 4.2 Edit .env dengan credentials

```env
# Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co

# Server
PORT=5000
JWT_SECRET=tokobuku_secret_key_2024

# Database (jika masih pakai PostgreSQL lokal)
DATABASE_URL=postgresql://user:password@localhost:5432/toko_buku
```

---

## Step 5: Install Dependencies

```bash
npm install
```

---

## Step 6: Start Server

```bash
npm run dev
# atau
npm run server:dev
```

Server akan berjalan di `http://localhost:5000`

---

## Step 7: Test Koneksi

### 7.1 Test via cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get all books (tidak perlu auth)
curl http://localhost:5000/supabase/books

# Register pengguna
curl -X POST http://localhost:5000/supabase/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User"
  }'
```

### 7.2 Test via Postman

1. Import collection: [Download](https://www.postman.com/collections/YOUR-COLLECTION-ID)
2. Setup environment variables
3. Jalankan requests

---

## Step 8: Seed Sample Data

Optional - Tambah data contoh:

```bash
# Run seed script (jika ada)
node server/database/insert-sample-books.js
```

Atau insert manual via SQL Editor:

```sql
INSERT INTO books (name, description, price, category, author, isbn, stock, cover_url) VALUES
('Learn JavaScript', 'Complete guide to JavaScript programming', 150000, 'Komputer', 'John Doe', '978-1234567890', 50, 'https://...'),
('Python untuk Pemula', 'Belajar programming dengan Python', 200000, 'Komputer', 'Jane Smith', '978-9876543210', 40, 'https://...'),
('Fiksi Indonesia', 'Kumpulan cerita pendek', 100000, 'Fiksi', 'Indonesia Writer', '978-5555555555', 30, 'https://...');
```

---

## Troubleshooting

### Error: "Supabase credentials not found"

**Solusi:**
- Pastikan .env file ada di root directory
- Check bahwa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY terisi
- Restart server: `npm run server:dev`

### Error: "CORS Error" saat upload

**Solusi:**
- Setup CORS di Supabase Storage settings (lihat Step 3.2)
- Clear browser cache
- Pastikan bucket "Public" di-enable

### Error: "Unable to connect to Supabase"

**Solusi:**
- Check internet connection
- Pastikan URL Supabase benar
- Check project masih aktif di Supabase dashboard
- Lihat error logs di browser console

### Error: "JWT Token Invalid"

**Solusi:**
- Pastikan JWT_SECRET sama di .env dan di code
- Check token belum expired
- Refresh token menggunakan endpoint `/supabase/auth/refresh`

### Error: "Table does not exist"

**Solusi:**
- Jalankan SQL script setup di Step 2.1
- Check table names sudah sesuai di queries

---

## Next Steps

1. **Setup Authentication UI**: Update login/register components di `src/pages/`
2. **Implement Cart**: Gunakan `/supabase/cart` endpoints
3. **Setup Dashboard**: Gunakan `/supabase/dashboard` endpoints
4. **Realtime Features**: Setup Supabase realtime subscriptions
5. **Image Optimization**: Setup image compression sebelum upload

---

## Useful Links

- 📚 [Supabase Documentation](https://supabase.com/docs)
- 🔐 [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- 💾 [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- 🚀 [JavaScript Client Library](https://supabase.com/docs/reference/javascript/introduction)

---

## Support

Untuk support dan pertanyaan lebih lanjut:
- Buka issue di GitHub
- Kunjungi Supabase discussion forum
- Hubungi development team

---

Last Updated: April 1, 2024
