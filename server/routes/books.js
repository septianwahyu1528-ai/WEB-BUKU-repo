import express from 'express';
import { query } from '../database/db.js';

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM books ORDER BY title ASC');
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Get single book
router.get('/:id', async (req, res) => {
    try {
        const result = await query('SELECT * FROM books WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create book (admin only)
router.post('/', async (req, res) => {
    try {
        const { title, author, price, image, rating, stock, description } = req.body;
        
        const result = await query(
            `INSERT INTO books (title, author, price, image, rating, stock, description) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, author, price, image, rating || 0, stock || 0, description || '']
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update book
router.put('/:id', async (req, res) => {
    try {
        const { title, author, price, image, rating, stock, description } = req.body;
        
        const result = await query(
            `UPDATE books SET title = $1, author = $2, price = $3, image = $4, rating = $5, stock = $6, description = $7 
             WHERE id = $8 RETURNING *`,
            [title, author, price, image, rating, stock, description, req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete book
router.delete('/:id', async (req, res) => {
    try {
        await query('DELETE FROM books WHERE id = $1', [req.params.id]);
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
