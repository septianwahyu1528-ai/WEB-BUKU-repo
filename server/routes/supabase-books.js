import express from 'express';
import supabase from '../supabase.js';

const router = express.Router();

// ===== SUPABASE BOOKS ENDPOINTS =====

// 1. Get all books
router.get('/supabase/books', async (req, res) => {
    try {
        const { search, category, sort = 'name' } = req.query;

        let query = supabase
            .from('books')
            .select('*');

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        // Add sorting
        if (sort === 'price-asc') {
            query = query.order('price', { ascending: true });
        } else if (sort === 'price-desc') {
            query = query.order('price', { ascending: false });
        } else if (sort === 'newest') {
            query = query.order('created_at', { ascending: false });
        } else {
            query = query.order('name', { ascending: true });
        }

        const { data, error } = await query;

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Get book by ID
router.get('/supabase/books/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Create new book (admin only)
router.post('/supabase/books', async (req, res) => {
    try {
        const { name, description, price, category, author, isbn, stock, cover_url } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ error: 'name, price, dan category required' });
        }

        const { data, error } = await supabase
            .from('books')
            .insert([{
                name: name,
                description: description || null,
                price: parseFloat(price),
                category: category,
                author: author || null,
                isbn: isbn || null,
                stock: parseInt(stock) || 0,
                cover_url: cover_url || null,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            message: 'Book created successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Create book error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Update book (admin only)
router.put('/supabase/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, author, isbn, stock, cover_url } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (category !== undefined) updateData.category = category;
        if (author !== undefined) updateData.author = author;
        if (isbn !== undefined) updateData.isbn = isbn;
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (cover_url !== undefined) updateData.cover_url = cover_url;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('books')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({
            success: true,
            message: 'Book updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. Delete book (admin only)
router.delete('/supabase/books/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6. Get books by category
router.get('/supabase/books-category/:category', async (req, res) => {
    try {
        const { category } = req.params;

        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('category', category)
            .order('name');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Get books by category error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 7. Get available categories
router.get('/supabase/books-categories', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('books')
            .select('category')
            .order('category');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Get unique categories
        const categories = [...new Set(data.map(b => b.category))];

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 8. Update book stock
router.patch('/supabase/books/:id/stock', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, operation = 'decrease' } = req.body;

        if (!quantity) {
            return res.status(400).json({ error: 'Quantity required' });
        }

        // Get current stock
        const { data: book, error: getError } = await supabase
            .from('books')
            .select('stock')
            .eq('id', id)
            .single();

        if (getError) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const newStock = operation === 'decrease' 
            ? book.stock - parseInt(quantity)
            : book.stock + parseInt(quantity);

        if (newStock < 0) {
            return res.status(400).json({ error: 'Stock tidak cukup' });
        }

        const { data, error } = await supabase
            .from('books')
            .update({ stock: newStock })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
