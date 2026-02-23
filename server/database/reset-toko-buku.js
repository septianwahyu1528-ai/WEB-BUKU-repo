import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { Pool, Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function resetupTokoBook() {
    const config = {
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
    };
    
    try {
        console.log('🔄 Resetting Toko_Buku database dengan init.sql yang baru\n');
        
        // Connect ke postgres default DB
        const client = new Client({ ...config, database: 'postgres' });
        await client.connect();
        
        // Drop dan recreate database
        console.log('1️⃣ Dropping Toko_Buku database...');
        await client.query(`DROP DATABASE IF EXISTS "Toko_Buku" WITH (FORCE);`);
        console.log('✅ Database dropped\n');
        
        console.log('2️⃣ Creating Toko_Buku database...');
        await client.query(`CREATE DATABASE "Toko_Buku";`);
        console.log('✅ Database created\n');
        
        await client.end();
        
        // Connect to new database dan run SQL
        console.log('3️⃣ Running SQL initialization scripts...');
        const pool = new Pool({ ...config, database: 'Toko_Buku' });
        
        const sqlPath = path.join(__dirname, 'init.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
        
        // Execute SQL
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        let count = 0;
        for (const statement of statements) {
            try {
                await pool.query(statement);
                count++;
            } catch (err) {
                if (!err.message.includes('already exists') && !err.message.includes('duplicate key')) {
                    console.warn(`⚠️  ${statement.substring(0, 50)}...: ${err.message}`);
                }
            }
        }
        
        console.log(`✅ Executed ${count} SQL statements\n`);
        
        // Verify
        console.log('4️⃣ Verifying data...');
        
        const ordersCheck = await pool.query('SELECT COUNT(*) as count FROM orders');
        const orderItemsCheck = await pool.query('SELECT COUNT(*) as count FROM order_items');
        
        console.log(`   Orders: ${ordersCheck.rows[0].count}`);
        console.log(`   Order Items: ${orderItemsCheck.rows[0].count}\n`);
        
        // Check for orphaned records
        console.log('5️⃣ Checking for foreign key violations...');
        const orphanedCheck = await pool.query(`
            SELECT COUNT(*) as count
            FROM order_items oi
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE o.id IS NULL
        `);
        
        if (orphanedCheck.rows[0].count === 0) {
            console.log('   ✅ No orphaned order_items\n');
            console.log('✅✅✅ Database Toko_Buku successfully reset!');
        } else {
            console.log(`   ❌ Found ${orphanedCheck.rows[0].count} orphaned records\n`);
        }
        
        await pool.end();
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

resetupTokoBook();
