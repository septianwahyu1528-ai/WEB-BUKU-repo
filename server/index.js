import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { initDB, query, closeDB } from './database/db.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Multer setup untuk upload
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format gambar tidak didukung'));
        }
    }
});

const app = express();

// Initialize database
const pool = initDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files dari public folder
app.use(express.static(path.join(path.resolve(), 'public')));

// Global request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'tokobuku_secret_key_2024';

// Test database connection on startup
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected successfully');
    }
});

// Middleware untuk verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token tidak valid' });
    }
};

// ============ AUTH ROUTES ============
app.post('/api/auth/login', async (req, res) => {
    try {
        let { email, username, password } = req.body;

        // Support both email and username fields
        email = email || username;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email/Username dan password harus diisi' });
        }

        console.log('Attempting login for:', email);

        const result = await query(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );

        console.log('Query result:', result.rows.length, 'rows found');

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }

        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login berhasil',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        console.error('Error details:', err);
        res.status(500).json({ 
            error: 'Server error: ' + err.message
        });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Semua field harus diisi' });
        }

        // Check if email already exists
        const checkEmail = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }

        const result = await query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, password, 'user']
        );

        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Register berhasil',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ BOOKS ROUTES ============
app.get('/api/books', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, author, price, stock, rating, image, description, isbn, publisher, publication_date, category FROM books ORDER BY id');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error('Get books error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/books/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, author, price, stock, rating, image, description, isbn, publisher, publication_date, category FROM books WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Buku tidak ditemukan' });
        }
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Get book error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/books', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Hanya admin yang bisa tambah buku' });
        }

        const { title, author, price, stock, rating, description, isbn, publisher, publication_date, category } = req.body;
        const imageName = req.file ? req.file.originalname : title.toLowerCase().replace(/\s+/g, '-') + '.svg';

        const result = await pool.query(
            'INSERT INTO books (title, author, price, stock, rating, image, description, isbn, publisher, publication_date, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [title, author, price, stock, rating || 4.5, imageName, description, isbn, publisher, publication_date, category]
        );
        res.json({
            success: true,
            message: 'Buku berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Create book error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/books/:id/image', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Hanya admin yang bisa upload gambar' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Tidak ada file gambar' });
        }

        const imageName = req.file.originalname;

        const result = await pool.query(
            'UPDATE books SET image = $1 WHERE id = $2 RETURNING *',
            [imageName, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Buku tidak ditemukan' });
        }

        res.json({ success: true, message: 'Gambar berhasil diupload', data: result.rows[0] });
    } catch (err) {
        console.error('Upload image error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/books/:id', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Hanya admin yang bisa edit buku' });
        }

        const { title, author, price, stock, rating } = req.body;
        
        if (req.file) {
            // Update dengan gambar baru
            const imageData = req.file.buffer;
            const imageName = req.file.originalname;
            
            const result = await pool.query(
                'UPDATE books SET title = $1, author = $2, price = $3, stock = $4, rating = $5, image = $6, image_data = $7 WHERE id = $8 RETURNING *',
                [title, author, price, stock, rating, imageName, imageData, req.params.id]
            );
            res.json(result.rows[0]);
        } else {
            // Update tanpa gambar
            const result = await pool.query(
                'UPDATE books SET title = $1, author = $2, price = $3, stock = $4, rating = $5 WHERE id = $6 RETURNING *',
                [title, author, price, stock, rating, req.params.id]
            );
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Update book error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/books/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Hanya admin yang bisa hapus buku' });
        }

        await pool.query('DELETE FROM books WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Buku berhasil dihapus' });
    } catch (err) {
        console.error('Delete book error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
app.delete('/api/books/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Hanya admin yang bisa hapus buku' });
        }

        await pool.query('DELETE FROM books WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Buku berhasil dihapus' });
    } catch (err) {
        console.error('Delete book error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ============ CUSTOMERS ROUTES ============
app.get('/api/customers', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers ORDER BY id');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error('Get customers error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/customers', verifyToken, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const result = await pool.query(
            'INSERT INTO customers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, phone, address]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Create customer error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/customers/:id', verifyToken, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const result = await pool.query(
            'UPDATE customers SET name = $1, email = $2, phone = $3, address = $4 WHERE id = $5 RETURNING *',
            [name, email, phone, address, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update customer error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/customers/:id', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Pelanggan berhasil dihapus' });
    } catch (err) {
        console.error('Delete customer error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ ORDERS ROUTES ============
app.get('/api/orders', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, 
                   json_agg(json_build_object('id', oi.id, 'book_id', oi.book_id, 'quantity', oi.quantity, 'unit_price', oi.unit_price)) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.id DESC
        `);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/orders', verifyToken, async (req, res) => {
    try {
        const { customer_id, total_amount, items, status, payment_method, notes } = req.body;
        
        // Create order
        const orderResult = await pool.query(
            'INSERT INTO orders (customer_id, total_amount, status, payment_method, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [customer_id, total_amount, status || 'pending', payment_method, notes]
        );
        
        const order = orderResult.rows[0];
        
        // Insert order items
        if (items && Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                await pool.query(
                    'INSERT INTO order_items (order_id, book_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)',
                    [order.id, item.book_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
                );
            }
        }
        
        res.json({
            success: true,
            message: 'Pesanan berhasil dibuat',
            data: order
        });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/orders/:id', verifyToken, async (req, res) => {
    try {
        const { status, payment_method, notes } = req.body;
        const result = await pool.query(
            'UPDATE orders SET status = $1, payment_method = $2, notes = $3 WHERE id = $4 RETURNING *',
            [status, payment_method, notes, req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
        }
        
        res.json({
            success: true,
            message: 'Pesanan berhasil diupdate',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Update order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/orders/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Hanya admin yang bisa hapus pesanan' });
        }
        await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Pesanan berhasil dihapus' });
    } catch (err) {
        console.error('Delete order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get order details with items
app.get('/api/orders/:id', verifyToken, async (req, res) => {
    try {
        const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
        }
        
        const itemsResult = await pool.query(
            'SELECT oi.*, b.title, b.image FROM order_items oi LEFT JOIN books b ON oi.book_id = b.id WHERE oi.order_id = $1',
            [req.params.id]
        );
        
        res.json({
            success: true,
            data: {
                ...orderResult.rows[0],
                items: itemsResult.rows
            }
        });
    } catch (err) {
        console.error('Get order detail error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add item to existing order
app.post('/api/orders/:id/items', verifyToken, async (req, res) => {
    try {
        const { book_id, quantity, unit_price } = req.body;
        const subtotal = quantity * unit_price;
        
        const result = await pool.query(
            'INSERT INTO order_items (order_id, book_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.params.id, book_id, quantity, unit_price, subtotal]
        );
        
        res.json({
            success: true,
            message: 'Item berhasil ditambahkan ke pesanan',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Add order item error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ PURCHASE HISTORY ROUTES ============
app.get('/api/purchase-history', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT ph.*, b.title as book_title
            FROM purchase_history ph
            LEFT JOIN books b ON ph.book_id = b.id
            ORDER BY ph.purchase_date DESC
        `);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error('Get history error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/purchase-history', verifyToken, async (req, res) => {
    try {
        const { customer_id, book_id, quantity, price, order_id } = req.body;
        const total = quantity * price;
        
        const result = await pool.query(
            'INSERT INTO purchase_history (customer_id, book_id, quantity, price, total, order_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [customer_id, book_id, quantity, price, total, order_id]
        );
        
        res.json({
            success: true,
            message: 'Riwayat pembelian berhasil dicatat',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Create history error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server running', timestamp: new Date() });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n✅ Server berjalan di http://localhost:${PORT}`);
    console.log(`📚 Toko Buku API - Backend Server`);
    console.log(`🔐 JWT Authentication Enabled`);
    console.log(`\n📋 Endpoints tersedia:`);
    console.log(`  Auth: POST /api/auth/login, /api/auth/register`);
    console.log(`  Books: GET/POST/PUT/DELETE /api/books`);
    console.log(`  Customers: GET/POST/PUT/DELETE /api/customers`);
    console.log(`  Orders: GET/POST/PUT/DELETE /api/orders`);
    console.log(`  History: GET/POST /api/purchase-history`);
    console.log(`\n🔗 Health Check: GET /api/health\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await pool.end();
    console.log('\n🛑 Server dihentikan');
    process.exit(0);
});
