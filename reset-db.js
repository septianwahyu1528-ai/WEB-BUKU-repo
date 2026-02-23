#!/usr/bin/env node
import pkg from 'pg';
const { Pool } = pkg;

async function resetDatabase() {
    console.log('\n🔄 RESETTING DATABASE...\n');

    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'postgres' // Connect to default DB
    });

    try {
        const client = await pool.connect();
        
        // Terminate all connections to tokobuku_db
        console.log('📡 Terminating existing connections...');
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'tokobuku_db'
            AND pid <> pg_backend_pid();
        `);

        // Drop database if exists
        console.log('🗑️  Dropping database...');
        await client.query('DROP DATABASE IF EXISTS tokobuku_db;');
        console.log('✓ Database dropped\n');

        // Create fresh database
        console.log('✨ Creating new database...');
        await client.query('CREATE DATABASE tokobuku_db;');
        console.log('✓ Database created\n');

        await client.release();
        await pool.end();
        
        console.log('✅ Reset complete! Now run: node setup-db-simple.js\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

resetDatabase();
