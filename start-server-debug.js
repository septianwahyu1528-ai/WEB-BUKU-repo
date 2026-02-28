import dotenv from 'dotenv';

dotenv.config();

console.log('Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'not set');
console.log('PORT:', process.env.PORT);

import('./server/index.js').catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
});
