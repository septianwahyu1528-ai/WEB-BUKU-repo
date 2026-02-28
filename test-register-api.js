const testRegister = async () => {
  try {
    console.log('🧪 Testing registration endpoint...\n');
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Registration failed!');
      console.log('Error:', data);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  process.exit(0);
};

testRegister();
