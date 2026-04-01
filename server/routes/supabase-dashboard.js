import express from 'express';
import supabase from '../supabase.js';

const router = express.Router();

// ===== SUPABASE DASHBOARD ENDPOINTS =====

// 1. Get dashboard summary
router.get('/supabase/dashboard/summary', async (req, res) => {
    try {
        // Get book count
        const { data: books } = await supabase
            .from('books')
            .select('id', { count: 'exact' });

        // Get customer count
        const { data: customers } = await supabase
            .from('customers')
            .select('id', { count: 'exact' });

        // Get order count
        const { data: orders } = await supabase
            .from('orders')
            .select('id', { count: 'exact' });

        // Get total revenue
        const { data: allOrders } = await supabase
            .from('orders')
            .select('total_price');

        const totalRevenue = (allOrders || []).reduce((sum, o) => sum + (o.total_price || 0), 0);

        res.json({
            success: true,
            data: {
                totalBooks: books ? books.length : 0,
                totalCustomers: customers ? customers.length : 0,
                totalOrders: orders ? orders.length : 0,
                totalRevenue: totalRevenue
            }
        });
    } catch (error) {
        console.error('Get dashboard summary error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Get sales by category
router.get('/supabase/dashboard/sales-by-category', async (req, res) => {
    try {
        // Get all order items with book category
        const { data: items, error } = await supabase
            .from('order_items')
            .select('*, books(category)');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Group by category
        const categoryStats = {};
        (items || []).forEach(item => {
            const category = item.books?.category || 'Unknown';
            if (!categoryStats[category]) {
                categoryStats[category] = { totalItems: 0, totalRevenue: 0 };
            }
            categoryStats[category].totalItems += item.quantity;
            categoryStats[category].totalRevenue += item.subtotal || 0;
        });

        const result = Object.entries(categoryStats).map(([category, stats]) => ({
            category,
            ...stats
        }));

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get sales by category error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Get top selling books
router.get('/supabase/dashboard/top-books', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get order items with book info
        const { data: items, error } = await supabase
            .from('order_items')
            .select('book_id, quantity, subtotal, books(name, category, price)');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Group by book and sum
        const bookStats = {};
        (items || []).forEach(item => {
            const bookId = item.book_id;
            if (!bookStats[bookId]) {
                bookStats[bookId] = {
                    book: item.books,
                    totalSold: 0,
                    totalRevenue: 0
                };
            }
            bookStats[bookId].totalSold += item.quantity;
            bookStats[bookId].totalRevenue += item.subtotal || 0;
        });

        const result = Object.values(bookStats)
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get top books error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Get recent orders
router.get('/supabase/dashboard/recent-orders', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const { data, error } = await supabase
            .from('orders')
            .select('*, customers(name, email)')
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Get recent orders error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. Get sales trend (by date)
router.get('/supabase/dashboard/sales-trend', async (req, res) => {
    try {
        const { days = 30 } = req.query;

        // Get orders from last N days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const { data: orders, error } = await supabase
            .from('orders')
            .select('created_at, total_price')
            .gte('created_at', startDate.toISOString());

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Group by date
        const dailyStats = {};
        (orders || []).forEach(order => {
            const date = new Date(order.created_at).toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { count: 0, total: 0 };
            }
            dailyStats[date].count += 1;
            dailyStats[date].total += order.total_price || 0;
        });

        const result = Object.entries(dailyStats)
            .map(([date, stats]) => ({
                date,
                ...stats
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get sales trend error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6. Get customer statistics
router.get('/supabase/dashboard/customer-stats', async (req, res) => {
    try {
        const { data: customers, error: customersError } = await supabase
            .from('customers')
            .select('id, created_at');

        if (customersError) {
            return res.status(400).json({ error: customersError.message });
        }

        // Get purchase count per customer
        const { data: orders } = await supabase
            .from('orders')
            .select('customer_id, total_price');

        const customerStats = {};
        (customers || []).forEach(customer => {
            customerStats[customer.id] = {
                created_at: customer.created_at,
                orderCount: 0,
                totalSpent: 0
            };
        });

        (orders || []).forEach(order => {
            if (customerStats[order.customer_id]) {
                customerStats[order.customer_id].orderCount += 1;
                customerStats[order.customer_id].totalSpent += order.total_price || 0;
            }
        });

        const stats = Object.values(customerStats);

        res.json({
            success: true,
            data: {
                totalCustomers: stats.length,
                averageOrdersPerCustomer: stats.length > 0 
                    ? stats.reduce((sum, c) => sum + c.orderCount, 0) / stats.length
                    : 0,
                averageSpentPerCustomer: stats.length > 0
                    ? stats.reduce((sum, c) => sum + c.totalSpent, 0) / stats.length
                    : 0,
                breakdown: stats
            }
        });
    } catch (error) {
        console.error('Get customer stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 7. Get low stock books
router.get('/supabase/dashboard/low-stock', async (req, res) => {
    try {
        const { threshold = 10 } = req.query;

        const { data, error } = await supabase
            .from('books')
            .select('*')
            .lte('stock', parseInt(threshold))
            .order('stock', { ascending: true });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Get low stock error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
