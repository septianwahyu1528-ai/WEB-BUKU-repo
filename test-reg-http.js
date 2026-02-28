import pkg from 'http';
const { request } = pkg;

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('✅ Response received:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

const body = JSON.stringify({
  name: 'Test ABC',
  email: 'testabc@example.com',
  password: 'password123'
});

console.log('🧪 Sending registration request...');
req.write(body);
req.end();
