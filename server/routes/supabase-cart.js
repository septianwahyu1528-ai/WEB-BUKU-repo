import express from 'express';
import supabase from '../supabase.js';

const router = express.Router();

// ===== SUPABASE CART ENDPOINTS =====

// 1. Get cart items for customer
router.get('/supabase/cart/:customer_id', async (req, res) => {
    try {
        const { customer_id } = req.params;

        const { data, error } = await supabase
            .from('cart_items')
            .select('*, books(name, price, stock, cover_url)')
            .eq('customer_id', customer_id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Calculate totals
        const items = data || [];
        const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

        res.json({
            success: true,
            data: {
                items: items,
                totalItems: totalItems,
                totalPrice: totalPrice
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Add item to cart
router.post('/supabase/cart', async (req, res) => {
    try {
        const { customer_id, book_id, quantity } = req.body;

        if (!customer_id || !book_id || !quantity) {
            return res.status(400).json({ error: 'customer_id, book_id, dan quantity required' });
        }

        // Check if item already in cart
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('*')
            .eq('customer_id', customer_id)
            .eq('book_id', book_id)
            .single();

        if (existingItem) {
            // Update quantity
            const { data, error } = await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + parseInt(quantity) })
                .eq('id', existingItem.id)
                .select();

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            return res.json({
                success: true,
                message: 'Item quantity updated',
                data: data[0]
            });
        }

        // Get book price
        const { data: book } = await supabase
            .from('books')
            .select('price')
            .eq('id', book_id)
            .single();

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Add new item
        const { data, error } = await supabase
            .from('cart_items')
            .insert([{
                customer_id: customer_id,
                book_id: book_id,
                quantity: parseInt(quantity),
                price: book.price,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            message: 'Item added to cart',
            data: data[0]
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Update cart item quantity
router.put('/supabase/cart/:cart_item_id', async (req, res) => {
    try {
        const { cart_item_id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1' });
        }

        const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity: parseInt(quantity) })
            .eq('id', cart_item_id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        res.json({
            success: true,
            message: 'Cart item updated',
            data: data[0]
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Remove item from cart
router.delete('/supabase/cart/:cart_item_id', async (req, res) => {
    try {
        const { cart_item_id } = req.params;

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', cart_item_id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. Clear entire cart
router.delete('/supabase/cart', async (req, res) => {
    try {
        const { customer_id } = req.body;

        if (!customer_id) {
            return res.status(400).json({ error: 'customer_id required' });
        }

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('customer_id', customer_id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
