import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Supabase Routes (tanpa db.js karena menggunakan Supabase)
import supabaseAuthRoutes from '../../server/routes/supabase-auth.js';
import supabaseBooksRoutes from '../../server/routes/supabase-books.js';
import supabaseCustomersRoutes from '../../server/routes/supabase-customers.js';
import supabaseOrdersRoutes from '../../server/routes/supabase-orders.js';
import supabaseCartRoutes from '../../server/routes/supabase-cart.js';
import supabaseHistoryRoutes from '../../server/routes/supabase-history.js';
import supabaseDashboardRoutes from '../../server/routes/supabase-dashboard.js';
import supabaseFilesRoutes from '../../server/routes/supabase-files.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware CORS untuk production
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL || 'https://your-domain.vercel.app'
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Production serving dari dist folder untuk static files
const distPath = path.join(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

// Load JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'tokobuku_secret_key_2024';

// Middleware untuk verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token tidak valid: ' + err.message });
    }
};

// Middleware untuk verify admin
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang bisa mengakses fitur ini.' });
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token tidak valid' });
    }
};

// Health check
app.get('/api/health', (req, res) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const hasSupabaseKey = !!(process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
    const hasJwtSecret = !!process.env.JWT_SECRET;
    
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        backend: 'running',
        supabase: {
            url: supabaseUrl ? '✓ Connected' : '✗ Missing VITE_SUPABASE_URL',
            credentials: hasSupabaseKey ? '✓ Found' : '✗ Missing SUPABASE_SERVICE_KEY',
            message: supabaseUrl && hasSupabaseKey ? 'Supabase ready' : 'Supabase not configured!'
        },
        jwt: hasJwtSecret ? '✓ Configured' : '✗ Missing JWT_SECRET',
        environment: process.env.NODE_ENV
    });
});

// Routes
app.use('/api/auth', supabaseAuthRoutes);
app.use('/api/books', supabaseBooksRoutes);
app.use('/api/customers', supabaseCustomersRoutes);
app.use('/api/orders', supabaseOrdersRoutes);
app.use('/api/cart', supabaseCartRoutes);
app.use('/api/history', supabaseHistoryRoutes);
app.use('/api/dashboard', supabaseDashboardRoutes);
app.use('/api/files', supabaseFilesRoutes);

// SPA fallback - serve index.html untuk semua route yang tidak ada
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({ 
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;
