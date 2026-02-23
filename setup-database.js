#!/usr/bin/env node

/**
 * Database Setup Script
 * Inisialisasi PostgreSQL dengan schema dan sample data
 * Jalankan dengan: npm run setup-db
 */

import pkg from 'pg';
const { Pool, Client } = pkg;
import fs from 'fs';
import path from 'path';

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres' // Connect to default postgres DB first
};

const targetDB = 'tokobuku_db';

async function setupDatabase() {
    console.log('\n🔧 Memulai setup database Toko Buku...\n');
    
    // Step 1: Connect to default postgres database
    console.log(`📡 Menghubung ke PostgreSQL (${config.host}:${config.port})...`);
    
    const client = new Client(config);
    
    try {
        await client.connect();
        console.log('✓ Koneksi berhasil\n');
        
        // Step 2: Create database if not exists
        console.log(`📦 Membuat database '${targetDB}' (jika belum ada)...`);
        try {
            await client.query(`CREATE DATABASE ${targetDB};`);
            console.log(`✓ Database '${targetDB}' berhasil dibuat\n`);
        } catch (err) {
            if (err.message.includes('already exists')) {
                console.log(`✓ Database '${targetDB}' sudah ada\n`);
            } else {
                throw err;
            }
        }
        
        await client.end();
        
        // Step 3: Connect to target database and run init SQL
        const poolConfig = {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: targetDB
        };
        
        const pool = new Pool(poolConfig);
        
        console.log(`📂 Membaca file init.sql...`);
        const sqlPath = path.join(process.cwd(), 'server', 'database', 'init.sql');
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`File init.sql tidak ditemukan di: ${sqlPath}`);
        }
        
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
        console.log('✓ File init.sql ditemukan\n');
        
        console.log('📝 Menjalankan SQL script...');
        
        // Split by semicolon and execute each statement
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        let executedCount = 0;
        for (const statement of statements) {
            try {
                await pool.query(statement);
                executedCount++;
            } catch (err) {
                // Some statements might fail (like ON CONFLICT), but that's ok
                if (!err.message.includes('already exists') && 
                    !err.message.includes('duplicate key')) {
                    console.warn(`⚠️  Warning: ${err.message}`);
                }
            }
        }
        
        console.log(`✓ Eksekusi selesai (${executedCount} statements)\n`);
        
        // Step 4: Verify tables
        console.log('🔍 Memverifikasi tabel...');
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log(`✓ Tabel yang tersedia:`);
        result.rows.forEach(row => {
            console.log(`   • ${row.table_name}`);
        });
        
        // Step 5: Check sample data
        console.log('\n📊 Memeriksa sample data...');
        
        const checks = [
            { table: 'users', label: 'Users' },
            { table: 'books', label: 'Books' },
            { table: 'customers', label: 'Customers' },
            { table: 'orders', label: 'Orders' }
        ];
        
        for (const check of checks) {
            const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${check.table}`);
            const count = countResult.rows[0].count;
            console.log(`   • ${check.label}: ${count} record(s)`);
        }
        
        await pool.end();
        
        console.log('\n✅ Database setup berhasil!\n');
        console.log('📋 Informasi koneksi:');
        console.log(`   Host: ${poolConfig.host}`);
        console.log(`   Port: ${poolConfig.port}`);
        console.log(`   Database: ${poolConfig.database}`);
        console.log(`   User: ${poolConfig.user}`);
        console.log('\n🚀 Sekarang jalankan: npm run server\n');
        
    } catch (err) {
        console.error('\n❌ Error setup database:');
        console.error(err.message);
        console.error('\nPastikan PostgreSQL sudah berjalan dengan kredensial:');
        console.error(`   User: ${config.user}`);
        console.error(`   Password: ${config.password}`);
        console.error(`   Host: ${config.host}:${config.port}`);
        process.exit(1);
    }
}

setupDatabase();
