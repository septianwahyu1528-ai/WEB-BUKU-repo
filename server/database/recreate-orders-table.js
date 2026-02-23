import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'Toko_Buku'
});

async function fixOrdersTableStructure() {
    try {
        console.log('🔄 Memperbaiki struktur tabel orders di Toko_Buku...\n');
        
        // Step 1: Drop dependent tables
        console.log('1️⃣ Menghapus tabel yang bergantung...');
        await pool.query('DROP TABLE IF EXISTS order_items CASCADE');
        await pool.query('DROP TABLE IF EXISTS purchase_history CASCADE');
        await pool.query('DROP TABLE IF EXISTS orders CASCADE');
        console.log('✅ Tabel lama dihapus\n');
        
        // Step 2: Create correct orders table
        console.log('2️⃣ Membuat tabel orders dengan struktur yang benar...');
        await pool.query(`
            CREATE TABLE orders (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount > 0),
                status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
                payment_method VARCHAR(50),
                notes TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabel orders berhasil dibuat\n');
        
        // Step 3: Create order_items table
        console.log('3️⃣ Membuat tabel order_items...');
        await pool.query(`
            CREATE TABLE order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
                quantity INTEGER NOT NULL CHECK (quantity > 0),
                unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
                subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal > 0),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabel order_items berhasil dibuat\n');
        
        // Step 4: Create purchase_history table
        console.log('4️⃣ Membuat tabel purchase_history...');
        await pool.query(`
            CREATE TABLE purchase_history (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
                purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                quantity INTEGER NOT NULL CHECK (quantity > 0),
                price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
                total DECIMAL(12, 2) NOT NULL CHECK (total > 0),
                order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Tabel purchase_history berhasil dibuat\n');
        
        // Step 5: Create indexes
        console.log('5️⃣ Membuat indexes...');
        await pool.query('CREATE INDEX idx_orders_customer_id ON orders(customer_id)');
        await pool.query('CREATE INDEX idx_orders_status ON orders(status)');
        await pool.query('CREATE INDEX idx_orders_order_date ON orders(order_date)');
        console.log('✅ Indexes berhasil dibuat\n');
        
        console.log('✅✅✅ Struktur tabel orders sudah diperbaiki dengan benar!');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

fixOrdersTableStructure();
