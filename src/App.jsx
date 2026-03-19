import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import PurchaseHistory from './pages/PurchaseHistory';
import Settings from './pages/Settings';
import ProductDetail from './pages/ProductDetail';
import ServerStatus from './components/ServerStatus';
import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [showRegister, setShowRegister] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = (userData, token) => {
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(userData));
        if (token) {
            localStorage.setItem('token', token);
        }
        setShowRegister(false);
    };

    const handleRegister = (userData) => {
        // Setelah registrasi, kembali ke login
        setShowRegister(false);
    };

    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setCurrentPage('dashboard');
    };

    const renderPage = () => {
        if (selectedProductId) {
            return <ProductDetail productId={selectedProductId} user={user} onBack={() => setSelectedProductId(null)} />;
        }

        switch (currentPage) {
            case 'products':
                return <Products user={user} />;
            case 'customers':
                return <Customers user={user} onNavigate={setCurrentPage} />;
            case 'orders':
                return <Orders user={user} onNavigate={setCurrentPage} />;
            case 'cart':
                return <Cart />;
            case 'history':
                return <PurchaseHistory />;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard user={user} onLogout={handleLogout} onNavigate={setCurrentPage} />;
        }
    };

    return (
        <>
            {isLoggedIn ? (
                <div>
                    <ServerStatus />
                    <nav className="app-nav">
                        <div className="nav-brand">TOKO BUKU</div>
                        <div className="nav-menu">
                            <button 
                                className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
                                onClick={() => setCurrentPage('dashboard')}
                            >
                                Dasbor
                            </button>
                            <button 
                                className={`nav-btn ${currentPage === 'products' ? 'active' : ''}`}
                                onClick={() => setCurrentPage('products')}
                            >
                                📚 Produk
                            </button>
                            {user?.role === 'admin' && (
                                <>
                                    <button 
                                        className={`nav-btn ${currentPage === 'customers' ? 'active' : ''}`}
                                        onClick={() => setCurrentPage('customers')}
                                    >
                                        Pelanggan
                                    </button>
                                    <button 
                                        className={`nav-btn ${currentPage === 'orders' ? 'active' : ''}`}
                                        onClick={() => setCurrentPage('orders')}
                                    >
                                        Pesanan
                                    </button>
                                </>
                            )}
                            <button 
                                className={`nav-btn ${currentPage === 'cart' ? 'active' : ''}`}
                                onClick={() => setCurrentPage('cart')}
                            >
                                🛒 Keranjang
                            </button>
                            <button 
                                className={`nav-btn ${currentPage === 'history' ? 'active' : ''}`}
                                onClick={() => setCurrentPage('history')}
                            >
                                📋 Riwayat
                            </button>
                            <button 
                                className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
                                onClick={() => setCurrentPage('settings')}
                            >
                                Pengaturan
                            </button>
                        </div>
                        <div className="nav-user">
                            <div className="user-info">
                                <span className="user-name">{user?.name || user?.email}</span>
                                <span className="user-role">👤 {user?.role === 'admin' ? '👨‍💼 Admin' : '👥 Pelanggan'}</span>
                            </div>
                            <button className="logout-btn" onClick={handleLogout}>
                                Keluar
                            </button>
                        </div>
                    </nav>
                    <div className="app-content">
                        {renderPage()}
                    </div>
                </div>
            ) : (
                <>
                    <ServerStatus />
                    {showRegister ? (
                        <Register 
                            onRegister={handleRegister}
                            onSwitchToLogin={() => setShowRegister(false)}
                        />
                    ) : (
                        <Login 
                            onLogin={handleLogin}
                            onSwitchToRegister={() => setShowRegister(true)}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default App;
