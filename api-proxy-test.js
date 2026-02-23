import axios from 'axios';

console.log('=== API AND PROXY TEST ===\n');

// Test 1: API dari backend langsung
console.log('1️⃣  TEST: Backend API (localhost:5000/api/books)');
try {
    const response = await axios.get('http://localhost:5000/api/books');
    const books = response.data.data || response.data;
    console.log(`   ✓ Got ${books.length} books`);
    console.log(`   First 3 books:`);
    books.slice(0, 3).forEach(b => {
        console.log(`     - ${b.title}: image="${b.image}"`);
    });
} catch (error) {
    console.error('   ✗ Error:', error.message);
}

// Test 2: API dari Vite proxy
console.log('\n2️⃣  TEST: Vite Proxy API (localhost:5174/api/books)');
try {
    const response = await axios.get('http://localhost:5174/api/books');
    const books = response.data.data || response.data;
    console.log(`   ✓ Got ${books.length} books`);
    console.log(`   First 3 books:`);
    books.slice(0, 3).forEach(b => {
        console.log(`     - ${b.title}: image="${b.image}"`);
    });
} catch (error) {
    console.error('   ✗ Error:', error.message);
}

// Test 3: Image files via proxy
console.log('\n3️⃣  TEST: Image files via Vite proxy (localhost:5174/images/)');
const imagesToTest = [
    'laskar-pelangi.svg',
    'bumi.svg', 
    'ayah.svg'
];

for (const image of imagesToTest) {
    try {
        const response = await axios.head(`http://localhost:5174/images/${image}`);
        console.log(`   ✓ ${image}: Status ${response.status}`);
    } catch (error) {
        console.error(`   ✗ ${image}: ${error.message}`);
    }
}

console.log('\n✅ All tests complete');
