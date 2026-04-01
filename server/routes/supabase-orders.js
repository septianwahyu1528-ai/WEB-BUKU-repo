import express from 'express';
import supabase from '../supabase.js';

const router = express.Router();

// ===== SUPABASE ORDERS ENDPOINTS =====

// 1. Create new order
router.post('/supabase/orders', async (req, res) => {
    try {
        const { customer_id, items, shipping_address, total_price, notes } = req.body;

        if (!customer_id || !items || items.length === 0) {
            return res.status(400).json({ error: 'customer_id and items required' });
        }

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                customer_id: customer_id,
                total_price: total_price || 0,
                shipping_address: shipping_address || null,
                notes: notes || null,
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select();

        if (orderError) {
            return res.status(400).json({ error: orderError.message });
        }

        const orderId = order[0].id;

        // Insert order items
        const orderItems = items.map(item => ({
            order_id: orderId,
            book_id: item.book_id,
            quantity: item.quantity,
            price: item.price,
            subtotal: (item.price * item.quantity),
            created_at: new Date().toISOString()
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error inserting order items:', itemsError);
        }

        // Update book stock
        for (const item of items) {
            const { data: book } = await supabase
                .from('books')
                .select('stock')
                .eq('id', item.book_id)
                .single();

            if (book) {
                const newStock = Math.max(0, book.stock - item.quantity);
                await supabase
                    .from('books')
                    .update({ stock: newStock })
                    .eq('id', item.book_id);
            }
        }

        res.json({
            success: true,
            message: 'Order created successfully',
            data: {
                order: order[0],
                items: orderItems
            }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Get all orders
router.get('/supabase/orders', async (req, res) => {
    try {
        const { status, customer_id, sort = 'newest', limit = 20, offset = 0 } = req.query;

        let query = supabase
            .from('orders')
            .select('*');

        if (status) {
            query = query.eq('status', status);
        }

        if (customer_id) {
            query = query.eq('customer_id', customer_id);
        }

        if (sort === 'oldest') {
            query = query.order('created_at', { ascending: true });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        const { data, error } = await query;

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Get order by ID
router.get('/supabase/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (orderError) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get order items with book details
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*, books(name, cover_url)')
            .eq('order_id', id);

        if (itemsError) {
            console.error('Error fetching items:', itemsError);
        }

        // Get customer details
        const { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('id', order.customer_id)
            .single();

        res.json({
            success: true,
            data: {
                order: order,
                items: items || [],
                customer: customer
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Update order status
router.patch('/supabase/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ 
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. Update order
router.put('/supabase/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { shipping_address, notes } = req.body;

        const updateData = {};
        if (shipping_address !== undefined) updateData.shipping_address = shipping_address;
        if (notes !== undefined) updateData.notes = notes;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            success: true,
            message: 'Order updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6. Delete order
router.delete('/supabase/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get order items to restore stock
        const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', id);

        if (items) {
            for (const item of items) {
                const { data: book } = await supabase
                    .from('books')
                    .select('stock')
                    .eq('id', item.book_id)
                    .single();

                if (book) {
                    const newStock = book.stock + item.quantity;
                    await supabase
                        .from('books')
                        .update({ stock: newStock })
                        .eq('id', item.book_id);
                }
            }
        }

        // Delete order items
        await supabase
            .from('order_items')
            .delete()
            .eq('order_id', id);

        // Delete order
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 7. Get order statistics
router.get('/supabase/orders/stats/summary', async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('status, total_price');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const stats = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, o) => sum + (o.total_price || 0), 0),
            byStatus: {}
        };

        // Count by status
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        statuses.forEach(status => {
            stats.byStatus[status] = orders.filter(o => o.status === status).length;
        });

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
