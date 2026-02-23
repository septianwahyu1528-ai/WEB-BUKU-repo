import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'tokobuku_db'
});

async function updateEmail() {
    try {
        const result = await pool.query(
            'UPDATE users SET email = $1 WHERE email = $2 RETURNING id, name, email',
            ['Ahmad@toko.buku.com', 'pelanggan@toko.buku.com']
        );

        if (result.rows.length === 0) {
            console.log('⚠️  No user found with email: pelanggan@toko.buku.com');
            console.log('Checking all users:');
            const allUsers = await pool.query('SELECT id, name, email FROM users');
            allUsers.rows.forEach(user => {
                console.log(`  ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
            });
        } else {
            console.log('✅ Email updated successfully!');
            console.log('User:', result.rows[0]);
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        pool.end();
    }
}

updateEmail();
