import axios from 'axios';

console.log('=== FINAL DIAGNOSTIC ===\n');

// Check all endpoints
const tests = [
    { name: 'Backend health', url: 'http://localhost:5000/api/health', method: 'GET' },
    { name: 'Backend books', url: 'http://localhost:5000/api/books', method: 'GET' },
    { name: 'Vite books proxy', url: 'http://localhost:5174/api/books', method: 'GET' },
    { name: 'Image via Vite proxy', url: 'http://localhost:5174/images/laskar-pelangi.svg', method: 'HEAD' }
];

for (const test of tests) {
    try {
        const config = {};
        if (test.method === 'HEAD') {
            const response = await axios.head(test.url);
            console.log(`✓ ${test.name}: Status ${response.status}`);
        } else {
            const response = await axios.get(test.url);
            console.log(`✓ ${test.name}: Status ${response.status}`);
            if (test.name === 'Vite books proxy') {
                const books = response.data.data || response.data;
                console.log(`  → Returns ${Array.isArray(books) ? books.length : 0} books`);
            }
        }
    } catch (error) {
        console.error(`✗ ${test.name}: ${error.message}`);
        if (error.response) {
            console.error(`  Status: ${error.response.status}`);
        }
    }
}

console.log('\n📋 Summary:');
console.log('- Backend should be running on localhost:5000');
console.log('- Vite should be running on localhost:5174');
console.log('- Proxy should forward /api and /images to backend');
console.log('- Images should be in public/images/ folder');
