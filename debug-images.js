import axios from 'axios';

console.log('=== DEBUG: Image Path Test ===\n');

// Test 1: Direct API call untuk books
console.log('Test 1: Fetch books dari API');
try {
    const response = await axios.get('http://localhost:5174/api/books');
    console.log('✓ API Response:', response.data.data ? `${response.data.data.length} books` : response.data);
    if (response.data.data && response.data.data[0]) {
        console.log('  Example book:');
        console.log('    - ID:', response.data.data[0].id);
        console.log('    - Title:', response.data.data[0].title);
        console.log('    - Image:', response.data.data[0].image);
    }
} catch (error) {
    console.error('✗ Error:', error.message);
    if (error.response) {
        console.error('  Status:', error.response.status);
        console.error('  Data:', error.response.data);
    }
}

// Test 2: Test image URL dari Vite proxy
console.log('\nTest 2: Test image URL via Vite proxy');
try {
    const imageResponse = await axios.head('http://localhost:5174/images/laskar-pelangi.svg');
    console.log('✓ Image accessible via proxy: Status', imageResponse.status);
} catch (error) {
    console.error('✗ Image not accessible:', error.message);
}

// Test 3: Test langsung ke backend
console.log('\nTest 3: Test image URL langsung ke backend');
try {
    const imageResponse = await axios.head('http://localhost:5000/images/laskar-pelangi.svg');
    console.log('✓ Image accessible from backend: Status', imageResponse.status);
} catch (error) {
    console.error('✗ Image not accessible from backend:', error.message);
}
