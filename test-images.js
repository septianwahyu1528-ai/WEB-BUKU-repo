import pkg from 'pg';
const { Pool } = pkg;
import axios from 'axios';

// Test 1: Check books in database
console.log('=== TEST 1: Books in Database ===');
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'tokobuku_db'
});

try {
    const result = await pool.query('SELECT id, title, image FROM books ORDER BY id LIMIT 3');
    console.log('✓ Found books:', result.rows);
} catch (error) {
    console.error('✗ Database error:', error.message);
}
await pool.end();

// Test 2: Check if API endpoint returns books
console.log('\n=== TEST 2: API Books Endpoint ===');
try {
    const response = await axios.get('http://localhost:5000/api/books');
    console.log('✓ API returned:', response.data.data ? `${response.data.data.length} books` : 'data structure');
    if (response.data.data && response.data.data[0]) {
        console.log('  First book:', {
            title: response.data.data[0].title,
            image: response.data.data[0].image
        });
    }
} catch (error) {
    console.error('✗ API error:', error.message);
}

// Test 3: Check if image files exist
console.log('\n=== TEST 3: Image Files in public/images ===');
import fs from 'fs';
try {
    const files = fs.readdirSync('./public/images');
    console.log(`✓ Found ${files.length} image files`);
    console.log('  Sample:', files.slice(0, 3));
} catch (error) {
    console.error('✗ File system error:', error.message);
}
