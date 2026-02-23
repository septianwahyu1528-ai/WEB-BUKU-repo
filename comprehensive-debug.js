import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';

console.log('=== COMPREHENSIVE IMAGE DEBUG ===\n');

// 1. Check file system
console.log('1️⃣  FILES IN public/images:');
try {
    const imageDir = './public/images';
    const files = fs.readdirSync(imageDir);
    console.log(`   Found ${files.length} files:`);
    files.forEach(f => console.log(`     - ${f}`));
} catch (error) {
    console.error('   Error reading directory:', error.message);
}

// 2. Check database books
console.log('\n2️⃣  BOOKS IN DATABASE:');
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'tokobuku_db'
});

try {
    const result = await pool.query('SELECT id, title, image FROM books ORDER BY id');
    console.log(`   Found ${result.rows.length} books:`);
    result.rows.forEach(row => {
        console.log(`     - ID ${row.id}: "${row.title}" => image: "${row.image}"`);
    });
} catch (error) {
    console.error('   Error:', error.message);
}

// 3. Check if image files exist
console.log('\n3️⃣  IMAGE FILE VALIDATION:');
try {
    const result = await pool.query('SELECT id, title, image FROM books ORDER BY id');
    result.rows.forEach(row => {
        const imageFile = `./public/images/${row.image}`;
        const exists = fs.existsSync(imageFile);
        const status = exists ? '✓' : '✗';
        console.log(`   ${status} ${row.title}: ${row.image}`);
        if (!exists) {
            console.log(`      File not found: ${imageFile}`);
        }
    });
} catch (error) {
    console.error('   Error:', error.message);
}

await pool.end();
console.log('\n✅ Debug complete');
