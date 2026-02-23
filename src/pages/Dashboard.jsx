import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
    const [books, setBooks] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data dari API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('📚 [Dashboard] Fetching books from API...');
                const token = localStorage.getItem('token');
                console.log('🔐 Token exists:', !!token);
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                // Fetch books
                console.log('🔄 Making request to /api/books...');
                let booksResponse;
                try {
                    booksResponse = await axios.get('/api/books', { timeout: 5000 });
                } catch (err) {
                    console.log('Proxy failed, trying direct backend...');
                    booksResponse = await axios.get('http://localhost:5000/api/books', { timeout: 5000 });
                }
                
                console.log('📦 API Response:', booksResponse.status, booksResponse.data);
                
                const booksData = booksResponse.data.data || booksResponse.data;
                console.log('📖 Books data:', booksData.length, 'items');
                
                if (!Array.isArray(booksData)) {
                    throw new Error('Books data is not an array');
                }
                
                const formattedBooks = booksData.map(book => ({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    priceValue: book.price,
                    price: `Rp ${parseInt(book.price).toLocaleString('id-ID')}`,
                    image: book.image || '',
                    rating: book.rating || 0,
                    stock: book.stock || 0,
                    description: book.description || '',
                    isbn: book.isbn || '',
                    publisher: book.publisher || '',
                    category: book.category || ''
                }));
                console.log('✓ Formatted books ready:', formattedBooks.length, 'items');
                console.log('  First book:', formattedBooks[0]);
                console.log('  Book images:', formattedBooks.map(b => b.image));
                console.log('  Books state will be set to:', formattedBooks);
                setBooks(formattedBooks);
                setLoading(false);
                console.log('✅ Loading set to false');

                // Fetch orders
                try {
                    const ordersResponse = await axios.get('/api/orders', { headers });
                    const ordersData = ordersResponse.data.data || ordersResponse.data;
                    setOrders(ordersData);
                } catch (error) {
                    console.error('Error fetching orders:', error);
                    setOrders([]);
                }

                // Fetch customers
                try {
                    const customersResponse = await axios.get('/api/customers', { headers });
                    const customersData = customersResponse.data.data || customersResponse.data;
                    setCustomers(customersData);
                } catch (error) {
                    console.error('Error fetching customers:', error);
                    setCustomers([]);
                }
            } catch (error) {
                console.error('❌ Error fetching data:', error.message);
                setError(error.message);
                setBooks([]);
                setOrders([]);
                setCustomers([]);
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Hitung statistik
    const totalProducts = books.length;
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const [cart, setCart] = useState([]);
    const [editingBook, setEditingBook] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        price: '',
        priceValue: 0,
        stock: 0,
        rating: 0,
        image: null
    });

    const handleAddToCart = (book) => {
        // Get existing cart from localStorage
        const savedCart = localStorage.getItem('cart');
        let updatedCart = savedCart ? JSON.parse(savedCart) : [];
        
        // Check if book already exists in cart
        const existingItem = updatedCart.find(item => item.id === book.id);
        
        const priceValue = book.priceValue || 0;
        const cartItem = {
            ...book,
            priceValue: priceValue,
            quantity: 1,
            bookTitle: book.title,
            totalPrice: `Rp ${priceValue.toLocaleString('id-ID')}`
        };
        
        if (existingItem) {
            updatedCart = updatedCart.map(item =>
                item.id === book.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        } else {
            updatedCart = [...updatedCart, cartItem];
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCart(updatedCart);
        
        // Show confirmation
        alert(`✓ ${book.title} ditambahkan ke keranjang!`);
    };

    const handleDeleteBook = (bookId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
            setBooks(books.filter(book => book.id !== bookId));
            alert('Buku berhasil dihapus!');
        }
    };

    const handleEditBook = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            price: book.price,
            priceValue: book.priceValue,
            stock: book.stock,
            rating: book.rating
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (!formData.title || !formData.author || !formData.price || formData.stock < 0) {
            alert('Semua field harus diisi dengan benar!');
            return;
        }

        setBooks(books.map(book => 
            book.id === editingBook.id 
                ? { ...book, ...formData }
                : book
        ));
        setShowEditModal(false);
        setEditingBook(null);
        alert('Buku berhasil diperbarui!');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'priceValue') {
            setFormData({
                ...formData,
                [name]: parseInt(value) || 0,
                price: `Rp ${parseInt(value || 0).toLocaleString('id-ID')}`
            });
        } else if (name === 'stock' || name === 'rating') {
            setFormData({ ...formData, [name]: parseFloat(value) || 0 });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Preview image
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData({ ...formData, image: event.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddBook = () => {
        if (!formData.title || !formData.author || !formData.priceValue || formData.stock < 0) {
            alert('Silakan isi semua field yang diperlukan!');
            return;
        }

        const newBook = {
            id: Math.max(...books.map(b => b.id), 0) + 1,
            title: formData.title,
            author: formData.author,
            price: formData.price,
            priceValue: formData.priceValue,
            stock: formData.stock,
            rating: formData.rating,
            image: formData.image
        };

        setBooks([...books, newBook]);
        setShowAddModal(false);
        resetForm();
        alert('Buku berhasil ditambahkan!');
    };

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            price: '',
            priceValue: 0,
            stock: 0,
            rating: 0,
            image: null
        });
        setSelectedFile(null);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'delivered': return '#27ae60';
            case 'shipped': return '#3498db';
            case 'confirmed': return '#f39c12';
            case 'pending': return '#95a5a6';
            case 'cancelled': return '#e74c3c';
            default: return '#666';
        }
    };

    return (
        <div className="dashboard">
            {/* User Profile Section */}
            <section className="profile-section">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {user?.role === 'admin' ? '👨‍💼' : '👤'}
                        </div>
                        <div className="profile-info">
                            <h2>{user?.name || 'User'}</h2>
                            <p className="profile-email">{user?.email}</p>
                            <span className={`profile-role role-${user?.role}`}>
                                {user?.role === 'admin' ? '✨ Admin' : '👥 Pelanggan'}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card stat-products">
                        <div className="stat-icon">📚</div>
                        <div className="stat-content">
                            <h3>Total Produk</h3>
                            <p className="stat-number">{books.length || 0}</p>
                            <span className="stat-label">Buku tersedia</span>
                        </div>
                    </div>

                    <div className="stat-card stat-orders">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <h3>Total Pesanan</h3>
                            <p className="stat-number">{orders.length || 0}</p>
                            <span className="stat-label">Pesanan dibuat</span>
                        </div>
                    </div>

                    <div className="stat-card stat-customers">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Total Pelanggan</h3>
                            <p className="stat-number">{customers.length || 0}</p>
                            <span className="stat-label">Pelanggan terdaftar</span>
                        </div>
                    </div>

                    <div className="stat-card stat-revenue">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Total Pendapatan</h3>
                            <p className="stat-number">Rp 0</p>
                            <span className="stat-label">Dari semua pesanan</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured-products">
                <div className="featured-header">
                    <h2>⭐ Produk Pilihan</h2>
                    <p>Buku berkualitas dengan rating terbaik</p>
                </div>
                
                {!loading && books && books.length > 0 ? (
                    <div className="featured-grid">
                        {books.slice(0, 6).map((book) => (
                            <div key={book.id} className="featured-card">
                                <div className="featured-image" style={{width: '100%', height: '240px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #ddd'}}>
                                    {book.image ? (
                                        <img 
                                            src={`http://localhost:5000/images/${book.image}`}
                                            alt={book.title}
                                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                            onLoad={() => console.log(`✅ Image loaded: ${book.image}`)}
                                            onError={(e) => {
                                                console.error(`❌ Image failed to load: ${book.image}`, e);
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `<div style="padding: 20px; text-align: center; color: #999;">📷 ${book.title}</div>`;
                                            }}
                                        />
                                    ) : (
                                        <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>📷 No image: {book.image || 'NULL'}</div>
                                    )}
                                </div>
                                <div className="featured-info">
                                    <h3>{book.title}</h3>
                                    <p className="featured-author">{book.author}</p>
                                    <div className="featured-rating">
                                        <span className="stars">{'⭐'.repeat(Math.floor(book.rating || 0))}</span>
                                        <span className="rating-value">{book.rating || 0}</span>
                                    </div>
                                    <p className="featured-price">{book.price}</p>
                                    <button 
                                        className="featured-btn"
                                        onClick={() => handleAddToCart(book)}
                                    >
                                        ➕ Keranjang
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{padding: '40px', textAlign: 'center', color: '#999'}}>
                        {loading ? '⏳ Loading...' : '📭 No products'}
                    </div>
                )}
            </section>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-header">
                    <div>
                        <h2>📚 Koleksi Buku Pilihan</h2>
                        <p>Temukan buku-buku terbaik dengan harga terjangkau</p>
                    </div>
                </div>

                {/* Status Messages */}
                {loading && (
                    <div style={{padding: '40px', textAlign: 'center', color: '#999'}}>
                        ⏳ Loading books...
                    </div>
                )}

                {error && (
                    <div style={{padding: '20px', background: '#f8d7da', borderRadius: '4px', margin: '20px 0', color: '#721c24'}}>
                        ❌ Error: {error}
                    </div>
                )}

                {!loading && books.length === 0 && !error && (
                    <div style={{padding: '40px', textAlign: 'center', color: '#999'}}>
                        📭 No books available
                    </div>
                )}

                {/* Books Grid */}
                {!loading && books.length > 0 && (
                    <div className="books-grid">
                        {books.map((book) => (
                            <div key={book.id} className="book-card">
                                <div className="book-cover" style={{width: '100%', height: '200px', background: '#f5f5f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    {book.image ? (
                                        <img 
                                            src={`http://localhost:5000/images/${book.image}`}
                                            alt={book.title}
                                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                            onLoad={() => console.log(`✅ Book image loaded: ${book.image}`)}
                                            onError={(e) => {
                                                console.error(`❌ Book image failed: ${book.image}`, e);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div style={{color: '#999', padding: '20px', textAlign: 'center'}}>📷</div>
                                    )}
                                </div>
                                <div className="book-info">
                                    <h3>{book.title}</h3>
                                    <p className="author">by {book.author}</p>
                                    <div className="rating">
                                        {'⭐'.repeat(Math.floor(book.rating || 0))}
                                        <span> {book.rating || 0}</span>
                                    </div>
                                    <p className="stock">Stock: {book.stock || 0}</p>
                                    <p className="price">{book.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
