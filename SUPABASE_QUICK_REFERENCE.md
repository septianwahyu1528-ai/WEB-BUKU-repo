# 📋 Supabase API - Quick Reference

Referensi cepat untuk semua endpoint Supabase Toko Buku.

## Authentication

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/supabase/auth/register` | Daftar pengguna baru |
| POST | `/supabase/auth/login` | Login |
| POST | `/supabase/auth/logout` | Logout |
| GET | `/supabase/auth/me` | Get current user |
| POST | `/supabase/auth/refresh` | Refresh token |
| POST | `/supabase/auth/change-password` | Ubah password |

## Books

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/supabase/books` | Get all books (with search/filter) |
| GET | `/supabase/books/:id` | Get book by ID |
| GET | `/supabase/books-category/:category` | Get books by category |
| GET | `/supabase/books-categories` | Get all categories |
| POST | `/supabase/books` | Create book (admin) |
| PUT | `/supabase/books/:id` | Update book |
| DELETE | `/supabase/books/:id` | Delete book |
| PATCH | `/supabase/books/:id/stock` | Update stock |

## Customers

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/supabase/customers` | Get all customers (admin) |
| GET | `/supabase/customers/:id` | Get customer by ID |
| GET | `/supabase/customers/:id/stats` | Get customer statistics |
| GET | `/supabase/customers/:id/orders` | Get customer orders |
| PUT | `/supabase/customers/:id` | Update customer profile |
| DELETE | `/supabase/customers/:id` | Delete customer |

## Orders

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/supabase/orders` | Get all orders (with filter) |
| GET | `/supabase/orders/:id` | Get order by ID |
| GET | `/supabase/orders/stats/summary` | Get order statistics |
| POST | `/supabase/orders` | Create new order |
| PUT | `/supabase/orders/:id` | Update order |
| PATCH | `/supabase/orders/:id/status` | Update order status |
| DELETE | `/supabase/orders/:id` | Delete order |

## Cart

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/supabase/cart/:customer_id` | Get cart items |
| POST | `/supabase/cart` | Add item to cart |
| PUT | `/supabase/cart/:cart_item_id` | Update cart item quantity |
| DELETE | `/supabase/cart/:cart_item_id` | Remove item from cart |
| DELETE | `/supabase/cart` | Clear entire cart |

## Purchase History

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/supabase/purchase-history/:customer_id` | Get purchase history |
| GET | `/supabase/purchase-history/:customer_id/detailed` | Get detailed history |
| GET | `/supabase/purchase-stats/:customer_id` | Get purchase statistics |
| GET | `/supabase/frequently-bought/:customer_id` | Get frequently bought books |
| GET | `/supabase/purchase-invoice/:order_id` | Get invoice |

## Dashboard

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/supabase/dashboard/summary` | Get dashboard summary |
| GET | `/supabase/dashboard/sales-by-category` | Sales per category |
| GET | `/supabase/dashboard/top-books` | Top selling books |
| GET | `/supabase/dashboard/recent-orders` | Recent orders |
| GET | `/supabase/dashboard/sales-trend` | Sales trend (by date) |
| GET | `/supabase/dashboard/customer-stats` | Customer statistics |
| GET | `/supabase/dashboard/low-stock` | Low stock books |

## Files & Storage

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/supabase/upload-image` | Upload image |
| DELETE | `/supabase/delete-image` | Delete image |
| GET | `/supabase/image-url` | Get image URL |
| GET | `/supabase/images-list` | List images in bucket |
| POST | `/supabase/books/:id/upload-cover` | Upload book cover |
| GET | `/supabase/export/:table` | Export table as CSV |

---

## Common Query Parameters

### Pagination
```
?limit=20&offset=0
```

### Filtering & Sorting
```
?search=text&category=category&sort=name|price-asc|price-desc|newest
```

### Status Filter
```
?status=pending|processing|shipped|delivered|cancelled
```

---

## Example Usage

### TypeScript/JavaScript

```typescript
// Import
import axios from 'axios';

const API_URL = 'http://localhost:5000';
let token = '';

// Register
const register = async (email, password, name) => {
  const res = await axios.post(`${API_URL}/supabase/auth/register`, {
    email, password, name
  });
  token = res.data.token;
  return res.data;
};

// Login
const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/supabase/auth/login`, {
    email, password
  });
  token = res.data.token;
  return res.data;
};

// Get Books
const getBooks = async (search = '', category = 'all') => {
  const res = await axios.get(`${API_URL}/supabase/books`, {
    params: { search, category }
  });
  return res.data.data;
};

// Create Order
const createOrder = async (customer_id, items, total_price) => {
  const res = await axios.post(`${API_URL}/supabase/orders`, 
    { customer_id, items, total_price },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Upload Image
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_URL}/supabase/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.data;
};
```

### React Hook Example

```typescript
import { useState } from 'react';
import axios from 'axios';

export const useSupabaseAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/supabase/books');
      return res.data.data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { getBooks, loading, error };
};
```

### cURL Examples

```bash
# Register
curl -X POST http://localhost:5000/supabase/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123","name":"User"}'

# Login
curl -X POST http://localhost:5000/supabase/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123"}'

# Get All Books
curl http://localhost:5000/supabase/books

# Get Books by Search
curl "http://localhost:5000/supabase/books?search=javascript&sort=price-asc"

# Create Order (with auth)
curl -X POST http://localhost:5000/supabase/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id":"uuid",
    "items":[{"book_id":"uuid","quantity":2,"price":150000}],
    "total_price":300000
  }'

# Get Dashboard Summary
curl http://localhost:5000/supabase/dashboard/summary

# Get Customer Stats
curl "http://localhost:5000/supabase/customers/uuid/stats"

# Upload Image
curl -X POST http://localhost:5000/supabase/upload-image \
  -F "file=@/path/to/image.jpg"
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Description",
  "data": { /* relevant data */ }
}
```

### Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Authentication Header

Untuk endpoint yang memerlukan auth:

```
Authorization: Bearer <your_jwt_token>
```

---

## Best Practices

1. **Always include error handling** dalam API calls
2. **Store token di localStorage** (atau secure storage)
3. **Refresh token** sebelum expiration
4. **Validate input** sebelum send ke server
5. **Use pagination** untuk large datasets
6. **Cache data** dengan react-query atau SWR
7. **Handle rate limiting** untuk production
8. **Log errors** untuk debugging

---

## Testing Tools

- **Postman** - GUI REST client
- **Thunder Client** - VS Code extension
- **REST Client** - VS Code extension (@request format)
- **cURL** - Command line
- **Insomnia** - API testing tool

---

## Useful Snippets

### React Component untuk Login

```jsx
import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/supabase/auth/login', {
        email, password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Redirect to home
      window.location.href = '/';
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
    </form>
  );
}
```

---

Last Updated: April 1, 2024
