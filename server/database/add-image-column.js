import { initDB, query } from './db.js';

const pool = initDB();

async function addImageColumn() {
    try {
        console.log('🔄 Checking books table for image_data column...');
        
        // Check if column exists
        const checkColumn = await query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'books' AND column_name = 'image_data'
            )
        `);

        if (checkColumn.rows[0].exists) {
            console.log('✅ Column image_data sudah ada');
            process.exit(0);
            return;
        }

        // Add image_data column if it doesn't exist
        console.log('➕ Menambahkan kolom image_data...');
        await query(`
            ALTER TABLE books 
            ADD COLUMN IF NOT EXISTS image_data BYTEA
        `);

        console.log('✅ Kolom image_data berhasil ditambahkan');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

addImageColumn();
