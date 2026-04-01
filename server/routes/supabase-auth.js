import express from 'express';
import supabase from '../supabase.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tokobuku_secret_key_2024';

// ===== SUPABASE AUTHENTICATION ENDPOINTS =====

// 1. Register with Supabase Auth
router.post('/supabase/auth/register', async (req, res) => {
    try {
        const { email, password, name, phone, address } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, dan name required' });
        }

        // Sign up user di Supabase Auth
        const { data: authData, error: signupError } = await supabase.auth.signUpWithPassword({
            email,
            password,
            options: {
                data: { name, phone, address }
            }
        });

        if (signupError) {
            return res.status(400).json({ error: signupError.message });
        }

        // Insert user ke customers table
        const { data: userData, error: insertError } = await supabase
            .from('customers')
            .insert([{
                id: authData.user.id,
                email: email,
                name: name,
                phone: phone || null,
                address: address || null,
                created_at: new Date().toISOString()
            }])
            .select();

        if (insertError) {
            console.error('Error inserting user data:', insertError);
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: authData.user.id, 
                email: authData.user.email,
                name: name 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                name: name
            },
            token: token,
            session: authData.session
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Login with Supabase Auth
router.post('/supabase/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Sign in dengan Supabase Auth
        const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (loginError) {
            return res.status(401).json({ error: loginError.message });
        }

        // Get customer data
        const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (customerError) {
            console.error('Error fetching customer:', customerError);
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: authData.user.id, 
                email: authData.user.email,
                name: customerData?.name || email.split('@')[0]
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            user: customerData || {
                id: authData.user.id,
                email: authData.user.email,
                name: email.split('@')[0]
            },
            token: token,
            session: authData.session
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Logout
router.post('/supabase/auth/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ success: true, message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Get current user
router.get('/supabase/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get full user data from Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get customer data
        const { data: customerData } = await supabase
            .from('customers')
            .select('*')
            .eq('id', user.id)
            .single();

        res.json({
            success: true,
            user: customerData || {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.email.split('@')[0]
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// 5. Refresh token
router.post('/supabase/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        // Create new JWT token
        const token = jwt.sign(
            { 
                id: data.user.id, 
                email: data.user.email,
                name: data.user.user_metadata?.name
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token: token,
            session: data.session
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6. Change password
router.post('/supabase/auth/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader || !currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const token = authHeader.replace('Bearer ', '');

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        }, { 
            autoRefreshToken: false,
            detectSessionInUrl: false
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
