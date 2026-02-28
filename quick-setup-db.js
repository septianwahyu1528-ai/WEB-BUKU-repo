import pkg from 'pg';
import fs from 'fs';
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
    const sqlContent = fs.readFileSync('./server/database/init.sql', 'utf-8');
    console.log('📝 Executing SQL...');
    
    // Execute all statements together
    await pool.query(sqlContent);
    console.log('✓ SQL executed successfully');
    
    // Verify tables
    const result = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name');
    console.log('\n✓ Tables created:');
    result.rows.forEach(row => console.log('   •', row.table_name));
    
    await pool.end();
    console.log('\n✅ Database setup complete!');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
