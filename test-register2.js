import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'tokobuku_db'
});

(async () => {
  try {
    console.log('🧪 Testing registration with correct role...');
    const testRes = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ['DIKA', 'pelanggan1@tokobuku.com', 'password123', 'pelanggan']
    );
    console.log('✅ Registration test successful!');
    console.log('User created:', testRes.rows[0]);
    await pool.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
