import express from 'express';
import { query } from '../database/db.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const result = await query(
            'SELECT id, email, name, role FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        res.json({ 
            success: true, 
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role || 'pelanggan'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email already exists
        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const result = await query(
            `INSERT INTO users (email, password, name, role) 
             VALUES ($1, $2, $3, $4) RETURNING id, email, name, role`,
            [email, password, name, 'user']
        );

        const user = result.rows[0];

        res.json({ 
            success: true, 
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
