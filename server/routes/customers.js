import express from 'express';
import { query } from '../database/db.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM customers ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single customer
router.get('/:id', async (req, res) => {
    try {
        const result = await query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create customer
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        
        const result = await query(
            `INSERT INTO customers (name, email, phone, address, total_purchase) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, email, phone, address, '0']
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update customer
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        
        const result = await query(
            `UPDATE customers SET name = $1, email = $2, phone = $3, address = $4 
             WHERE id = $5 RETURNING *`,
            [name, email, phone, address, req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete customer
router.delete('/:id', async (req, res) => {
    try {
        await query('DELETE FROM customers WHERE id = $1', [req.params.id]);
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
