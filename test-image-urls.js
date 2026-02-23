import axios from 'axios';

console.log('=== Testing Image URL Access ===\n');

const imagesToTest = [
    'laskar-pelangi.svg',
    'ayah.svg',
    'bumi.svg',
    'aku-.png',
    'ayah.png'
];

for (const image of imagesToTest) {
    try {
        const response = await axios.head(`http://localhost:5000/images/${image}`);
        console.log(`✓ ${image}: Status ${response.status}`);
    } catch (error) {
        if (error.response?.status === 404) {
            console.log(`✗ ${image}: NOT FOUND (404)`);
        } else {
            console.log(`✗ ${image}: Error - ${error.message}`);
        }
    }
}
