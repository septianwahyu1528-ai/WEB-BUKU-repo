#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

async function verifyUsers() {
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'tokobuku_db'
    });

    try {
        const result = await pool.query('SELECT id, email, password, name, role FROM users');
        console.log('\n📋 Users dalam database:\n');
        result.rows.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Password: ${user.password}`);
            console.log(`Name: ${user.name}`);
            console.log(`Role: ${user.role}`);
            console.log('---');
        });
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

verifyUsers();
