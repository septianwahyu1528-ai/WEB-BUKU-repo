import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'tokobuku_db'
});

async function checkUsers() {
    try {
        console.log('📋 All users in database:');
        const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
        result.rows.forEach(user => {
            console.log(`  ID: ${user.id} | Name: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
        });
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        pool.end();
    }
}

checkUsers();
