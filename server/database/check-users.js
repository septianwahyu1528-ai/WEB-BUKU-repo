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
    database: process.env.DB_NAME || 'tokobuku_db'
});

async function checkUsers() {
    try {
        console.log('🔍 Checking User Credentials\n');
        
        const result = await pool.query('SELECT id, email, password, name, role FROM users ORDER BY id');
        
        console.log('Available Users for Login:\n');
        result.rows.forEach(user => {
            console.log(`📧 Email: ${user.email}`);
            console.log(`   Password: ${user.password}`);
            console.log(`   Name: ${user.name}`);
            console.log(`   Role: ${user.role}\n`);
        });
        
        console.log('✅ Use these credentials to login in the application');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

checkUsers();
