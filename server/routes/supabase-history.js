import express from 'express';
import supabase from '../supabase.js';

const router = express.Router();

// ===== SUPABASE PURCHASE HISTORY ENDPOINTS =====

// 1. Get customer purchase history
router.get('/supabase/purchase-history/:customer_id', async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        const { data, error } = await supabase
            .from('order_items')
            .select('*, orders(status, created_at, total_price), books(name, cover_url)')
            .eq('orders.customer_id', customer_id)
            .order('orders.created_at', { ascending: false })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Get purchase history error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Get purchase history with detailed info
router.get('/supabase/purchase-history/:customer_id/detailed', async (req, res) => {
    try {
        const { customer_id } = req.params;

        // Get all customer orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', customer_id)
            .order('created_at', { ascending: false });

        if (ordersError) {
            return res.status(400).json({ error: ordersError.message });
        }

        // Get order items for each order
        const result = [];
        for (const order of orders || []) {
            const { data: items } = await supabase
                .from('order_items')
                .select('*, books(name, author, cover_url)')
                .eq('order_id', order.id);

            result.push({
                order: order,
                items: items || []
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get detailed purchase history error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Get purchase statistics
router.get('/supabase/purchase-stats/:customer_id', async (req, res) => {
    try {
        const { customer_id } = req.params;

        // Get all orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', customer_id);

        if (ordersError) {
            return res.status(400).json({ error: ordersError.message });
        }

        // Calculate stats
        const stats = {
            totalPurchases: orders ? orders.length : 0,
            totalSpent: orders ? orders.reduce((sum, o) => sum + (o.total_price || 0), 0) : 0,
            averagePurchase: 0,
            lastPurchase: null,
            byMonth: {}
        };

        if (orders && orders.length > 0) {
            stats.averagePurchase = stats.totalSpent / orders.length;
            stats.lastPurchase = orders[0].created_at;

            // Group by month
            orders.forEach(order => {
                const date = new Date(order.created_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!stats.byMonth[monthKey]) {
                    stats.byMonth[monthKey] = { count: 0, total: 0 };
                }
                stats.byMonth[monthKey].count += 1;
                stats.byMonth[monthKey].total += order.total_price || 0;
            });
        }

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get purchase stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Get frequently bought books
router.get('/supabase/frequently-bought/:customer_id', async (req, res) => {
    try {
        const { customer_id } = req.params;

        // Get all order items for customer
        const { data: items, error } = await supabase
            .from('order_items')
            .select('book_id, quantity, books(name, cover_url)')
            .eq('orders.customer_id', customer_id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Group by book and calculate total quantity
        const bookMap = new Map();
        (items || []).forEach(item => {
            const bookId = item.book_id;
            if (!bookMap.has(bookId)) {
                bookMap.set(bookId, { book: item.books, totalQuantity: 0 });
            }
            bookMap.set(bookId, {
                book: item.books,
                totalQuantity: bookMap.get(bookId).totalQuantity + item.quantity
            });
        });

        // Sort by quantity
        const frequentBooks = Array.from(bookMap.values())
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 10);

        res.json({
            success: true,
            data: frequentBooks
        });
    } catch (error) {
        console.error('Get frequently bought books error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. Download purchase invoice
router.get('/supabase/purchase-invoice/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;

        // Get order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single();

        if (orderError || !order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get customer
        const { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('id', order.customer_id)
            .single();

        // Get order items
        const { data: items } = await supabase
            .from('order_items')
            .select('*, books(name, author)')
            .eq('order_id', order_id);

        res.json({
            success: true,
            data: {
                order: order,
                customer: customer,
                items: items || []
            }
        });
    } catch (error) {
        console.error('Get purchase invoice error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
