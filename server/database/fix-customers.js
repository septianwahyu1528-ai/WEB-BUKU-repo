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

async function fixCustomersTable() {
    try {
        console.log('🔄 Memperbaiki tabel customers di database Toko_Buku...\n');
        
        const columnsToAdd = [
            { name: 'city', definition: 'VARCHAR(100)', description: 'Kota' },
            { name: 'postal_code', definition: 'VARCHAR(20)', description: 'Kode pos' },
            { name: 'country', definition: 'VARCHAR(100)', description: 'Negara' },
            { name: 'total_orders', definition: 'INTEGER DEFAULT 0 CHECK (total_orders >= 0)', description: 'Total pesanan' },
            { name: 'is_active', definition: 'BOOLEAN DEFAULT true', description: 'Status aktif' },
            { name: 'updated_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP', description: 'Waktu update' }
        ];

        for (const column of columnsToAdd) {
            try {
                const checkColumn = await pool.query(`
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'customers' AND column_name = $1 AND table_schema = 'public'
                    )
                `, [column.name]);

                if (checkColumn.rows[0].exists) {
                    console.log(`✅ Kolom '${column.name}' sudah ada`);
                } else {
                    console.log(`➕ Menambahkan kolom '${column.name}' (${column.description})...`);
                    await pool.query(`
                        ALTER TABLE customers 
                        ADD COLUMN ${column.name} ${column.definition}
                    `);
                    console.log(`✅ Kolom '${column.name}' berhasil ditambahkan`);
                }
            } catch (err) {
                console.error(`❌ Error pada '${column.name}':`, err.message);
            }
        }

        console.log('\n✅ Tabel customers sekarang memiliki semua kolom yang diperlukan!');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

fixCustomersTable();
