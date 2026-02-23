import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'tokobuku_db'
});

async function checkBookImages() {
    try {
        console.log('🔍 Checking book images in database...\n');
        
        const result = await pool.query(
            'SELECT id, title, image FROM books LIMIT 10'
        );
        
        console.log(`📚 Found ${result.rows.length} books:\n`);
        result.rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`Title: ${row.title}`);
            console.log(`Image: ${row.image || 'NULL'}`);
            console.log('---');
        });
        
        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkBookImages();
