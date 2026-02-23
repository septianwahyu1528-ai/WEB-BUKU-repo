import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'tokobuku_db'
});

try {
    const result = await pool.query('SELECT id, title, image FROM books ORDER BY id');
    console.log('Books in database:');
    result.rows.forEach(row => {
        console.log(`ID ${row.id}: ${row.title} -> Image: ${row.image}`);
    });
} catch (error) {
    console.error('Error:', error.message);
} finally {
    await pool.end();
}
