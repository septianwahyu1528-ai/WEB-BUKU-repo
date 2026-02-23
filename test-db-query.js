#!/usr/bin/env node
import pkg from 'pg';
const { Pool } = pkg;

async function testQuery() {
    const pool = new Pool({
        user: 'postgres',
        password: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'tokobuku_db'
    });

    try {
        console.log('Testing direct database query...\n');
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            ['admin@tokobuku.com', 'admin123']
        );
        
        console.log('✅ Query successful!');
        console.log('Found users:', result.rows.length);
        if (result.rows.length > 0) {
            console.log('User:', result.rows[0]);
        }
    } catch (err) {
        console.error('❌ Query failed:', err.message);
    } finally {
        await pool.end();
    }
}

testQuery();
