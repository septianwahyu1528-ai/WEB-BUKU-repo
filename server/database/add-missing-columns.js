import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'tokobuku_db'
});

async function addMissingColumns() {
    try {
        console.log('🔄 Memeriksa dan menambahkan kolom yang hilang pada tabel books...\n');
        
        const columnsToAdd = [
            { name: 'isbn', definition: 'VARCHAR(50) UNIQUE', description: 'ISBN number' },
            { name: 'publisher', definition: 'VARCHAR(255)', description: 'Publisher name' },
            { name: 'publication_date', definition: 'DATE', description: 'Publication date' },
            { name: 'category', definition: 'VARCHAR(100)', description: 'Book category' }
        ];

        for (const column of columnsToAdd) {
            try {
                // Check if column exists
                const checkColumn = await pool.query(`
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'books' AND column_name = $1
                    )
                `, [column.name]);

                if (checkColumn.rows[0].exists) {
                    console.log(`✅ Kolom '${column.name}' sudah ada`);
                } else {
                    console.log(`➕ Menambahkan kolom '${column.name}' (${column.description})...`);
                    await pool.query(`
                        ALTER TABLE books 
                        ADD COLUMN ${column.name} ${column.definition}
                    `);
                    console.log(`✅ Kolom '${column.name}' berhasil ditambahkan\n`);
                }
            } catch (err) {
                console.error(`❌ Error saat menambahkan kolom '${column.name}':`, err.message);
            }
        }

        console.log('\n✅ Selesai! Database sudah diupdate dengan semua kolom yang diperlukan');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

addMissingColumns();
