import React, { useState } from 'react';
import '../styles/Register.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validateForm = () => {
        if (!name || !email || !password || !confirmPassword) {
            setError('Semua field harus diisi!');
            return false;
        }

        if (name.length < 3) {
            setError('Nama minimal 3 karakter!');
            return false;
        }

        if (!email.includes('@')) {
            setError('Email tidak valid!');
            return false;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter!');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Password dan konfirmasi password tidak sama!');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Coba koneksi ke API backend
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess('Registrasi berhasil! Silakan login.');
                setTimeout(() => {
                    onRegister(data.user);
                }, 1500);
            } else {
                const data = await response.json();
                setError(data.error || 'Registrasi gagal!');
            }
        } catch (err) {
            // Fallback jika backend tidak tersedia - registrasi offline
            console.log('Backend tidak tersedia, menggunakan mode offline');
            setSuccess('✓ Registrasi berhasil! Silakan login dengan akun baru Anda.');
            
            // Simpan ke localStorage sebagai user terdaftar
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            registeredUsers.push({
                name: name,
                email: email,
                password: password
            });
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            
            setTimeout(() => {
                onSwitchToLogin();
            }, 1500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-box">
                    <div className="register-header">
                        <h1>Toko Buku</h1>
                        <p className="tagline">Buat Akun Baru</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        
                        <div className="form-group">
                            <label>Nama Lengkap</label>
                            <input
                                type="text"
                                placeholder="Masukkan nama lengkap"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Minimal 6 karakter"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Konfirmasi Password</label>
                            <input
                                type="password"
                                placeholder="Ulangi password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="btn-register" disabled={loading}>
                            {loading ? 'Sedang mendaftar...' : 'Daftar'}
                        </button>
                    </form>

                    <div className="register-footer">
                        <p>Sudah punya akun? 
                            <button 
                                className="link-button"
                                onClick={onSwitchToLogin}
                            >
                                Login di sini
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
