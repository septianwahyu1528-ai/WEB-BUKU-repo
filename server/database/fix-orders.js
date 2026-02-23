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

async function fixOrdersTable() {
    try {
        console.log('🔄 Memperbaiki tabel orders di database Toko_Buku...\n');
        
        const columnsToAdd = [
            { name: 'total_amount', definition: 'DECIMAL(12, 2) NOT NULL CHECK (total_amount > 0)', description: 'Jumlah total' },
            { name: 'payment_method', definition: 'VARCHAR(50)', description: 'Metode pembayaran' },
            { name: 'notes', definition: 'TEXT', description: 'Catatan' },
            { name: 'updated_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP', description: 'Waktu update' }
        ];

        for (const column of columnsToAdd) {
            try {
                const checkColumn = await pool.query(`
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'orders' AND column_name = $1 AND table_schema = 'public'
                    )
                `, [column.name]);

                if (checkColumn.rows[0].exists) {
                    console.log(`✅ Kolom '${column.name}' sudah ada`);
                } else {
                    console.log(`➕ Menambahkan kolom '${column.name}' (${column.description})...`);
                    await pool.query(`
                        ALTER TABLE orders 
                        ADD COLUMN ${column.name} ${column.definition}
                    `);
                    console.log(`✅ Kolom '${column.name}' berhasil ditambahkan`);
                }
            } catch (err) {
                console.error(`❌ Error pada '${column.name}':`, err.message);
            }
        }

        console.log('\n✅ Tabel orders sekarang memiliki semua kolom yang diperlukan!');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

fixOrdersTable();
