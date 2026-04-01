# 📚 Toko Buku - Supabase API Documentation

Dokumentasi lengkap semua endpoint Supabase yang tersedia di server Toko Buku.

## Table of Contents
- [Authentication](#authentication)
- [Books](#books)
- [Customers](#customers)
- [Orders](#orders)
- [Cart](#cart)
- [Purchase History](#purchase-history)
- [Dashboard](#dashboard)
- [Files & Storage](#files--storage)

---

## Authentication

### 1. Register
**POST** `/supabase/auth/register`

Register pengguna baru di Supabase Auth dan membuat customer profile.

```json
Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+62812345678",
  "address": "Jl. Test No. 123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here",
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

### 2. Login
**POST** `/supabase/auth/login`

Login dengan email dan password.

```json
Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here",
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

### 3. Logout
**POST** `/supabase/auth/logout`

Logout pengguna dan invalidate session.

```
Response:
{
  "success": true,
  "message": "Logout successful"
}
```

### 4. Get Current User
**GET** `/supabase/auth/me`

Get informasi user yang sedang login.

```
Headers:
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+62812345678",
    "address": "Jl. Test No. 123"
  }
}
```

### 5. Refresh Token
**POST** `/supabase/auth/refresh`

Refresh JWT token menggunakan refresh token.

```json
Request Body:
{
  "refreshToken": "refresh-token-here"
}

Response:
{
  "success": true,
  "token": "new-jwt-token",
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

### 6. Change Password
**POST** `/supabase/auth/change-password`

Ubah password pengguna.

```json
Request Body:
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}

Headers:
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Books

### 1. Get All Books
**GET** `/supabase/books`

Get semua buku dengan filter dan sorting.

```
Query Parameters:
- search: string (optional) - cari berdasarkan nama atau deskripsi
- category: string (optional) - filter berdasarkan kategori
- sort: string (optional) - "name", "price-asc", "price-desc", "newest"

Example: GET /supabase/books?search=programming&category=komputer&sort=price-asc

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Learn JavaScript",
      "description": "...",
      "price": 150000,
      "category": "Komputer",
      "author": "John Doe",
      "isbn": "978-1234567890",
      "stock": 25,
      "cover_url": "https://...",
      "created_at": "2024-04-01T12:00:00Z"
    }
  ]
}
```

### 2. Get Book by ID
**GET** `/supabase/books/:id`

Get detail buku berdasarkan ID.

```
Response:
{
  "success": true,
  "data": { ...book data... }
}
```

### 3. Create Book (Admin)
**POST** `/supabase/books`

Buat buku baru.

```json
Request Body:
{
  "name": "Learn Python",
  "description": "Complete guide to Python programming",
  "price": 250000,
  "category": "Komputer",
  "author": "Jane Smith",
  "isbn": "978-9876543210",
  "stock": 50,
  "cover_url": "https://..."
}

Response:
{
  "success": true,
  "message": "Book created successfully",
  "data": { ...new book data... }
}
```

### 4. Update Book (Admin)
**PUT** `/supabase/books/:id`

Update data buku.

```json
Request Body (partial):
{
  "price": 280000,
  "stock": 45
}

Response:
{
  "success": true,
  "message": "Book updated successfully",
  "data": { ...updated book data... }
}
```

### 5. Delete Book (Admin)
**DELETE** `/supabase/books/:id`

Hapus buku.

```
Response:
{
  "success": true,
  "message": "Book deleted successfully"
}
```

### 6. Get Books by Category
**GET** `/supabase/books-category/:category`

Get semua buku dalam kategori tertentu.

```
Response:
{
  "success": true,
  "data": [ ...books... ]
}
```

### 7. Get Available Categories
**GET** `/supabase/books-categories`

Get daftar semua kategori.

```
Response:
{
  "success": true,
  "data": ["Komputer", "Fiksi", "Non-Fiksi", "Anak-anak"]
}
```

### 8. Update Book Stock
**PATCH** `/supabase/books/:id/stock`

Update stock buku.

```json
Request Body:
{
  "quantity": 10,
  "operation": "decrease" // atau "increase"
}

Response:
{
  "success": true,
  "message": "Stock updated successfully",
  "data": { ...book with new stock... }
}
```

---

## Customers

### 1. Get All Customers (Admin)
**GET** `/supabase/customers`

Get semua pelanggan dengan search dan sorting.

```
Query Parameters:
- search: string (optional)
- sort: string (optional) - "name", "newest"

Response:
{
  "success": true,
  "data": [ ...customers... ]
}
```

### 2. Get Customer by ID
**GET** `/supabase/customers/:id`

Get detail pelanggan.

```
Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+62812345678",
    "address": "Jl. Test No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "12345",
    "country": "Indonesia",
    "created_at": "2024-04-01T12:00:00Z"
  }
}
```

### 3. Update Customer Profile
**PUT** `/supabase/customers/:id`

Update profile pelanggan.

```json
Request Body:
{
  "name": "John Doe",
  "phone": "+6281234567890",
  "address": "Jl. Baru No. 456",
  "city": "Bandung",
  "province": "Jawa Barat",
  "postal_code": "40123",
  "country": "Indonesia"
}

Response:
{
  "success": true,
  "message": "Customer updated successfully",
  "data": { ...updated customer... }
}
```

### 4. Get Customer Statistics
**GET** `/supabase/customers/:id/stats`

Get statistik pembelian pelanggan.

```
Response:
{
  "success": true,
  "data": {
    "customer": { ...customer data... },
    "totalOrders": 15,
    "totalSpent": 5250000,
    "averageOrderValue": 350000
  }
}
```

### 5. Delete Customer (Admin)
**DELETE** `/supabase/customers/:id`

Hapus pelanggan dan data terkaitnya.

```
Response:
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

### 6. Get Customer Orders
**GET** `/supabase/customers/:id/orders`

Get semua pesanan pelanggan.

```
Query Parameters:
- limit: number (default: 10)
- offset: number (default: 0)

Response:
{
  "success": true,
  "data": [ ...orders... ]
}
```

---

## Orders

### 1. Create Order
**POST** `/supabase/orders`

Buat pesanan baru.

```json
Request Body:
{
  "customer_id": "uuid",
  "items": [
    {
      "book_id": "uuid",
      "quantity": 2,
      "price": 150000
    }
  ],
  "shipping_address": "Jl. Pengiriman No. 789",
  "total_price": 300000,
  "notes": "Kirim dengan hati-hati"
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": { ...order data... },
    "items": [ ...order items... ]
  }
}
```

### 2. Get All Orders
**GET** `/supabase/orders`

Get semua pesanan dengan filter.

```
Query Parameters:
- status: string (optional) - "pending", "processing", "shipped", "delivered", "cancelled"
- customer_id: string (optional)
- sort: string (optional) - "newest" atau "oldest"
- limit: number (default: 20)
- offset: number (default: 0)

Response:
{
  "success": true,
  "data": [ ...orders... ]
}
```

### 3. Get Order by ID
**GET** `/supabase/orders/:id`

Get detail pesanan lengkap.

```
Response:
{
  "success": true,
  "data": {
    "order": { ...order data... },
    "items": [ ...order items with book details... ],
    "customer": { ...customer data... }
  }
}
```

### 4. Update Order Status
**PATCH** `/supabase/orders/:id/status`

Update status pesanan.

```json
Request Body:
{
  "status": "shipped" // valid: pending, processing, shipped, delivered, cancelled
}

Response:
{
  "success": true,
  "message": "Order status updated successfully",
  "data": { ...updated order... }
}
```

### 5. Update Order
**PUT** `/supabase/orders/:id`

Update informasi pesanan.

```json
Request Body:
{
  "shipping_address": "Jl. Baru No. 999",
  "notes": "Update catatan"
}

Response:
{
  "success": true,
  "message": "Order updated successfully",
  "data": { ...updated order... }
}
```

### 6. Delete Order
**DELETE** `/supabase/orders/:id`

Hapus pesanan dan kembalikan stock.

```
Response:
{
  "success": true,
  "message": "Order deleted successfully"
}
```

### 7. Get Order Statistics
**GET** `/supabase/orders/stats/summary`

Get statistik pesanan.

```
Response:
{
  "success": true,
  "data": {
    "totalOrders": 100,
    "totalRevenue": 15000000,
    "byStatus": {
      "pending": 10,
      "processing": 5,
      "shipped": 20,
      "delivered": 60,
      "cancelled": 5
    }
  }
}
```

---

## Cart

### 1. Get Cart Items
**GET** `/supabase/cart/:customer_id`

Get item-item dalam keranjang.

```
Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "customer_id": "uuid",
        "book_id": "uuid",
        "quantity": 2,
        "price": 150000,
        "books": {
          "name": "Learn JavaScript",
          "price": 150000,
          "stock": 25,
          "cover_url": "https://..."
        }
      }
    ],
    "totalItems": 2,
    "totalPrice": 300000
  }
}
```

### 2. Add Item to Cart
**POST** `/supabase/cart`

Tambah atau update item di keranjang.

```json
Request Body:
{
  "customer_id": "uuid",
  "book_id": "uuid",
  "quantity": 2
}

Response:
{
  "success": true,
  "message": "Item added to cart",
  "data": { ...cart item... }
}
```

### 3. Update Cart Item Quantity
**PUT** `/supabase/cart/:cart_item_id`

Update jumlah item di keranjang.

```json
Request Body:
{
  "quantity": 5
}

Response:
{
  "success": true,
  "message": "Cart item updated",
  "data": { ...updated cart item... }
}
```

### 4. Remove Item from Cart
**DELETE** `/supabase/cart/:cart_item_id`

Hapus item dari keranjang.

```
Response:
{
  "success": true,
  "message": "Item removed from cart"
}
```

### 5. Clear Entire Cart
**DELETE** `/supabase/cart`

Kosongkan semua item di keranjang.

```json
Request Body:
{
  "customer_id": "uuid"
}

Response:
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## Purchase History

### 1. Get Purchase History
**GET** `/supabase/purchase-history/:customer_id`

Get riwayat pembelian pelanggan.

```
Query Parameters:
- limit: number (default: 20)
- offset: number (default: 0)

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "quantity": 2,
      "price": 150000,
      "orders": {
        "status": "delivered",
        "created_at": "2024-04-01T12:00:00Z",
        "total_price": 300000
      },
      "books": {
        "name": "Learn JavaScript",
        "cover_url": "https://..."
      }
    }
  ]
}
```

### 2. Get Detailed Purchase History
**GET** `/supabase/purchase-history/:customer_id/detailed`

Get riwayat pembelian lengkap dengan detail item.

```
Response:
{
  "success": true,
  "data": [
    {
      "order": { ...order data... },
      "items": [ ...items with book details... ]
    }
  ]
}
```

### 3. Get Purchase Statistics
**GET** `/supabase/purchase-stats/:customer_id`

Get statistik pembelian pelanggan.

```
Response:
{
  "success": true,
  "data": {
    "totalPurchases": 15,
    "totalSpent": 5250000,
    "averagePurchase": 350000,
    "lastPurchase": "2024-04-10T15:30:00Z",
    "byMonth": {
      "2024-04": { "count": 3, "total": 1050000 },
      "2024-03": { "count": 2, "total": 700000 }
    }
  }
}
```

### 4. Get Frequently Bought Books
**GET** `/supabase/frequently-bought/:customer_id`

Get buku yang sering dibeli pelanggan.

```
Response:
{
  "success": true,
  "data": [
    {
      "book": { ...book data... },
      "totalQuantity": 5
    }
  ]
}
```

### 5. Download Purchase Invoice
**GET** `/supabase/purchase-invoice/:order_id`

Get invoice untuk pesanan tertentu.

```
Response:
{
  "success": true,
  "data": {
    "order": { ...order data... },
    "customer": { ...customer data... },
    "items": [ ...order items... ]
  }
}
```

---

## Dashboard

### 1. Get Dashboard Summary
**GET** `/supabase/dashboard/summary`

Get ringkasan dashboard admin.

```
Response:
{
  "success": true,
  "data": {
    "totalBooks": 150,
    "totalCustomers": 1200,
    "totalOrders": 850,
    "totalRevenue": 127500000
  }
}
```

### 2. Get Sales by Category
**GET** `/supabase/dashboard/sales-by-category`

Get penjualan per kategori.

```
Response:
{
  "success": true,
  "data": [
    {
      "category": "Komputer",
      "totalItems": 450,
      "totalRevenue": 67500000
    }
  ]
}
```

### 3. Get Top Selling Books
**GET** `/supabase/dashboard/top-books`

Get buku dengan penjualan terbaik.

```
Query Parameters:
- limit: number (default: 10)

Response:
{
  "success": true,
  "data": [
    {
      "book": { ...book data... },
      "totalSold": 150,
      "totalRevenue": 22500000
    }
  ]
}
```

### 4. Get Recent Orders
**GET** `/supabase/dashboard/recent-orders`

Get pesanan terbaru.

```
Query Parameters:
- limit: number (default: 10)

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "shipped",
      "total_price": 450000,
      "customers": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### 5. Get Sales Trend
**GET** `/supabase/dashboard/sales-trend`

Get tren penjualan per hari.

```
Query Parameters:
- days: number (default: 30)

Response:
{
  "success": true,
  "data": [
    {
      "date": "2024-04-01",
      "count": 15,
      "total": 2250000
    }
  ]
}
```

### 6. Get Customer Statistics
**GET** `/supabase/dashboard/customer-stats`

Get statistik pelanggan.

```
Response:
{
  "success": true,
  "data": {
    "totalCustomers": 1200,
    "averageOrdersPerCustomer": 3.5,
    "averageSpentPerCustomer": 312500,
    "breakdown": [ ...detailed stats... ]
  }
}
```

### 7. Get Low Stock Books
**GET** `/supabase/dashboard/low-stock`

Get buku dengan stok rendah.

```
Query Parameters:
- threshold: number (default: 10)

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Learn Python",
      "stock": 3
    }
  ]
}
```

---

## Files & Storage

### 1. Upload Image to Supabase Storage
**POST** `/supabase/upload-image`

Upload gambar ke Supabase Storage.

```
Content-Type: multipart/form-data

Form Data:
- file: <image file>

Response:
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "fileName": "1711950000000-abc123.png",
    "url": "https://project.supabase.co/storage/v1/object/public/book-covers/1711950000000-abc123.png",
    "path": "book-covers/1711950000000-abc123.png"
  }
}
```

### 2. Delete Image from Supabase Storage
**DELETE** `/supabase/delete-image`

Hapus gambar dari Supabase Storage.

```json
Request Body:
{
  "fileName": "1711950000000-abc123.png",
  "bucket": "book-covers" // optional
}

Response:
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### 3. Get Image URL from Supabase Storage
**GET** `/supabase/image-url`

Get URL publik untuk gambar.

```
Query Parameters:
- fileName: string (required)
- bucket: string (optional, default: "book-covers")

Response:
{
  "success": true,
  "data": {
    "url": "https://project.supabase.co/storage/v1/object/public/book-covers/filename.png"
  }
}
```

### 4. List Images in Bucket
**GET** `/supabase/images-list`

List semua gambar dalam bucket.

```
Query Parameters:
- bucket: string (default: "book-covers")
- limit: number (default: 100)
- offset: number (default: 0)

Response:
{
  "success": true,
  "data": [
    {
      "name": "1711950000000-abc123.png",
      "id": "uuid",
      "updated_at": "2024-04-01T12:00:00Z",
      "created_at": "2024-04-01T12:00:00Z",
      "last_accessed_at": "2024-04-01T12:00:00Z",
      "metadata": {},
      "url": "https://..."
    }
  ]
}
```

### 5. Upload Book Cover
**POST** `/supabase/books/:id/upload-cover`

Upload dan update cover buku.

```
Content-Type: multipart/form-data

Form Data:
- cover: <image file>

Response:
{
  "success": true,
  "message": "Book cover uploaded successfully",
  "data": {
    "url": "https://...",
    "book": { ...updated book data... }
  }
}
```

### 6. Export Data as CSV
**GET** `/supabase/export/:table`

Export data tabel dalam format CSV.

```
Query Parameters:
- table: string (required) - "books", "customers", "orders", "order_items"

Example: GET /supabase/export/books

Response: CSV file download
```

---

## Error Handling

Semua endpoint mengembalikan error response dengan format:

```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP Status Codes:
- `200 OK` - Request berhasil
- `400 Bad Request` - Data request tidak valid
- `401 Unauthorized` - Token tidak ada atau tidak valid
- `403 Forbidden` - Akses ditolak
- `404 Not Found` - Resource tidak ditemukan
- `500 Internal Server Error` - Error di server

---

## Authentication Headers

Untuk endpoint yang memerlukan autentikasi, gunakan header:

```
Authorization: Bearer <jwt-token>
```

Dapatkan token dari endpoint login atau register.

---

## Environment Setup

Setup environment variables di file `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=tokobuku_secret_key_2024
PORT=5000
```

---

## Testing Endpoints

Gunakan tools seperti:
- **Postman** - GUI based testing
- **cURL** - Command line
- **Thunder Client** - VS Code extension
- **REST Client** - VS Code extension

### Example cURL:

```bash
# Login
curl -X POST http://localhost:5000/supabase/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Get All Books
curl -X GET http://localhost:5000/supabase/books

# Create Order
curl -X POST http://localhost:5000/supabase/orders \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "uuid",
    "items": [...],
    "total_price": 300000
  }'
```

---

Last Updated: April 1, 2024
