#!/usr/bin/env node
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    console.log('\n🔧 Database Setup Started...\n');
    
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'tokobuku_db'
    });

    try {
        console.log('📡 Connecting to tokobuku_db...');
        const client = await pool.connect();
        console.log('✓ Connected\n');

        const sqlPath = path.join(__dirname, 'server', 'database', 'init.sql');
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`File not found: ${sqlPath}`);
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
        console.log('📝 Running SQL...');
        
        // Execute all SQL at once
        await client.query(sqlContent);
        console.log('✓ SQL executed\n');

        // Verify tables
        console.log('🔍 Verifying tables...');
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log(`✓ Tables found:`);
        result.rows.forEach(row => {
            console.log(`   • ${row.table_name}`);
        });

        // Check data
        console.log('\n📊 Sample data:');
        const tables = ['users', 'books', 'customers', 'orders'];
        for (const table of tables) {
            try {
                const res = await client.query(`SELECT COUNT(*) as cnt FROM ${table}`);
                console.log(`   • ${table}: ${res.rows[0].cnt} records`);
            } catch (e) {
                // table doesn't exist
            }
        }

        await client.release();
        console.log('\n✅ Setup complete!\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

setupDatabase();
