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
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Users table columns:');
    res.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    });
    
    // Test registration
    console.log('\n🧪 Testing registration...');
    const testRes = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ['Test User', 'test@example.com', 'password123', 'user']
    );
    console.log('✅ Registration test successful:', testRes.rows[0]);
    
    await pool.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
