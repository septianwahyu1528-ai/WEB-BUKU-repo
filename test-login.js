#!/usr/bin/env node
import axios from 'axios';

async function testLogin() {
    try {
        console.log('Testing login endpoint...\n');
        
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@tokobuku.com',
            password: 'admin123'
        });
        
        console.log('✅ Login successful!');
        console.log(JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Login failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
