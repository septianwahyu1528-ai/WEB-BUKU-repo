#!/usr/bin/env node
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

console.log('Express app created');

// Global middleware
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
});

console.log('Middleware registered');

// Simple login endpoint
app.post('/api/auth/login', (req, res) => {
    console.log('Login endpoint hit!');
    console.log('Body:', req.body);
    res.json({ success: true, message: 'Simple login' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Minimal server running on port ${PORT}`);
});
