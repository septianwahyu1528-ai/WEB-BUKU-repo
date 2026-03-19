import React, { useState } from 'react';
import { loginAPI } from '../utils/api';
import '../styles/Login.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
    const [userType, setUserType] = useState('pelanggan');
    const [email, setEmail] = useState('pelanggan1@toko.buku.com');
    const [password, setPassword] = useState('pelanggan123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUserTypeChange = (type) => {
        setUserType(type);
        if (type === 'admin') {
            setEmail('admin@tokobuku.com');
            setPassword('admin123');
        } else {
            setEmail('pelanggan1@toko.buku.com');
            setPassword('pelanggan123');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Email dan password harus diisi!');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Coba koneksi ke API backend
            const data = await loginAPI(email, password);
            onLogin(data.user, data.token);
        } catch (err) {
            // Fallback jika backend tidak tersedia - check localStorage
            console.log('Backend tidak tersedia, menggunakan mode offline');
            
            // Check default credentials
            const defaultUsers = [
                { email: 'admin@tokobuku.com', password: 'admin123', name: 'Admin Toko', role: 'admin' },
                { email: 'pelanggan@toko.buku.com', password: 'pelanggan123', name: 'Ahmad Rizki', role: 'pelanggan' },
                { email: 'pelanggan2@toko.buku.com', password: 'pelanggan123', name: 'Siti Nurhaliza', role: 'pelanggan' },
                { email: 'pelanggan3@toko.buku.com', password: 'pelanggan123', name: 'Budi Santoso', role: 'pelanggan' }
            ];
            
            // Check registered users dari localStorage
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const allUsers = [...defaultUsers, ...registeredUsers];
            
            const user = allUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
                const userData = {
                    email: user.email,
                    name: user.name || email.split('@')[0],
                    role: user.role || 'pelanggan'
                };
                onLogin(userData, null); // No token in offline mode
            } else {
                setError('Email atau password salah!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <h1>Toko Buku</h1>
                        <p className="tagline">Selamat datang!</p>
                    </div>

                    <div className="user-type-selector">
                        <button 
                            type="button"
                            className={`type-btn ${userType === 'admin' ? 'active' : ''}`}
                            onClick={() => handleUserTypeChange('admin')}
                        >
                            👨‍💼 Admin
                        </button>
                        <button 
                            type="button"
                            className={`type-btn ${userType === 'pelanggan' ? 'active' : ''}`}
                            onClick={() => handleUserTypeChange('pelanggan')}
                        >
                            👤 Pelanggan
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="pelanggan@toko.buku.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="pelanggan123"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Sedang login...' : 'Login'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Belum punya akun? 
                            <button 
                                className="link-button"
                                onClick={onSwitchToRegister}
                            >
                                Daftar di sini
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
