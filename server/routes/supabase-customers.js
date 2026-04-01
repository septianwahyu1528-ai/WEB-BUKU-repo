import express from 'express';
import supabase from '../supabase.js';

const router = express.Router();

// ===== SUPABASE CUSTOMERS ENDPOINTS =====

// 1. Get all customers (admin only)
router.get('/supabase/customers', async (req, res) => {
    try {
        const { search, sort = 'name' } = req.query;

        let query = supabase
            .from('customers')
            .select('*');

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        if (sort === 'newest') {
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
        console.error('Get customers error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Get customer by ID
router.get('/supabase/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Update customer profile
router.put('/supabase/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address, city, province, postal_code, country } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (province !== undefined) updateData.province = province;
        if (postal_code !== undefined) updateData.postal_code = postal_code;
        if (country !== undefined) updateData.country = country;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('customers')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({
            success: true,
            message: 'Customer updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Get customer statistics
router.get('/supabase/customers/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;

        // Get customer data
        const { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        // Get total orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, total_price')
            .eq('customer_id', id);

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
        }

        // Get total spent
        const totalSpent = orders ? orders.reduce((sum, order) => sum + (order.total_price || 0), 0) : 0;

        res.json({
            success: true,
            data: {
                customer: customer,
                totalOrders: orders ? orders.length : 0,
                totalSpent: totalSpent,
                averageOrderValue: orders && orders.length > 0 ? totalSpent / orders.length : 0
            }
        });
    } catch (error) {
        console.error('Get customer stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. Delete customer (admin only)
router.delete('/supabase/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete related orders first
        const { error: deleteOrdersError } = await supabase
            .from('orders')
            .delete()
            .eq('customer_id', id);

        if (deleteOrdersError) {
            console.error('Error deleting orders:', deleteOrdersError);
        }

        // Delete customer
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6. Get customer orders
router.get('/supabase/customers/:id/orders', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10, offset = 0 } = req.query;

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', id)
            .order('created_at', { ascending: false })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Get customer orders error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
