import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Products.css';

function Products() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetchBooks();
        // Load cart from localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            console.log('📚 Fetching books from /api/books...');
            
            // Try local proxy first, then fallback to direct backend
            let response;
            try {
                response = await axios.get('/api/books', { timeout: 5000 });
            } catch (proxyErr) {
                console.log('Proxy failed, trying direct backend...');
                response = await axios.get('http://localhost:5000/api/books', { timeout: 5000 });
            }
            
            const booksData = response.data.data || response.data;
            console.log('✓ Got books:', booksData.length, booksData);
            setBooks(Array.isArray(booksData) ? booksData : []);
            setError(null);
        } catch (err) {
            console.error('❌ Error fetching books:', err);
            setError('Gagal memuat produk. Pastikan server berjalan.');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const getMockBooks = () => [
        { id: 1, title: 'Buku Campus', author: 'DIKA', price: 85000, image: 'Buku Campus.jpg', rating: 4.8, stock: 50, category: 'Buku Teks' },
        { id: 2, title: 'Buku Folio', author: 'JESICCA', price: 79000, image: 'Buku Folio.jpg', rating: 4.7, stock: 45, category: 'Buku Teks' },
        { id: 3, title: 'Buku Anak', author: 'REVAN', price: 75000, image: 'Buku anak.png', rating: 4.9, stock: 60, category: 'Anak-anak' },
        { id: 4, title: 'Buku Cerita', author: 'YOGI', price: 95000, image: 'Buku cerita.png', rating: 4.6, stock: 40, category: 'Cerita' },
        { id: 5, title: 'Buku Pelajaran', author: 'TANGGUH', price: 65000, image: 'Buku pelajaran.png', rating: 4.5, stock: 35, category: 'Pelajaran' },
        { id: 6, title: 'Buku Jilid', author: 'NIFAIL', price: 70000, image: 'Buku jilid.png', rating: 4.4, stock: 25, category: 'Buku Teks' },
        { id: 7, title: 'Buku Notebook', author: 'ZAINAL', price: 55000, image: 'Buku notebook.png', rating: 4.5, stock: 30, category: 'Catatan' },
        { id: 8, title: 'Buku Tabungan', author: 'YUSUF MAHFUD', price: 45000, image: 'Buku tabungan.png', rating: 4.3, stock: 40, category: 'Catatan' },
        { id: 9, title: 'Buku Tulis', author: 'REHAN', price: 35000, image: 'Buku tulis.png', rating: 4.6, stock: 55, category: 'Catatan' },
        { id: 10, title: 'Buku Kotak', author: 'REVANDRA', price: 50000, image: 'Buku kotak.png', rating: 4.5, stock: 35, category: 'Catatan' },
    ];

    const filteredBooks = books.filter(book => {
        const matchesCategory = filter === 'all' || book.category === filter;
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.author.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['all', ...new Set(books.map(b => b.category))];

    const addToCart = (book) => {
        const existingItem = cart.find(item => item.id === book.id);
        let updatedCart;
        
        // Ensure priceValue is a number
        const priceValue = typeof book.price === 'number' ? book.price : (book.priceValue || 0);
        const cartItem = { 
            ...book, 
            priceValue: priceValue,
            quantity: 1,
            bookTitle: book.title,
            totalPrice: `Rp ${priceValue.toLocaleString('id-ID')}`
        };
        
        if (existingItem) {
            updatedCart = cart.map(item =>
                item.id === book.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        } else {
            updatedCart = [...cart, cartItem];
        }
        
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        alert(`${book.title} ditambahkan ke keranjang!`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return <div className="products-container"><p className="loading">Memuat produk...</p></div>;
    }

    return (
        <div className="products-container">
            <div className="products-header">
                <h1>📚 Koleksi Buku</h1>
                <p>Jelajahi koleksi buku terbaik kami</p>
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            <div className="products-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Cari buku atau penulis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-box">
                    <label>Kategori:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'Semua Kategori' : cat}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="products-count">
                Menampilkan {filteredBooks.length} dari {books.length} produk
            </div>

            <div className="products-grid">
                {filteredBooks.length > 0 ? (
                    filteredBooks.map(book => (
                        <div key={book.id} className="product-card">
                            <div className="product-image">
                                {book.image ? (
                                    <img 
                                        src={`http://localhost:5000/images/${book.image}`} 
                                        alt={book.title}
                                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                    />
                                ) : (
                                    <div className="placeholder">📖</div>
                                )}
                                {book.stock <= 0 && <div className="badge-soldout">Habis</div>}
                            </div>

                            <div className="product-info">
                                <div className="product-category">{book.category}</div>
                                <h3 className="product-title">{book.title}</h3>
                                <p className="product-author">oleh {book.author}</p>

                                <div className="product-rating">
                                    <span className="stars">
                                        {'⭐'.repeat(Math.floor(book.rating || 0))}
                                    </span>
                                    <span className="rating-value">{book.rating || 0}</span>
                                </div>

                                <div className="product-stock">
                                    Stok: <strong>{book.stock}</strong>
                                </div>

                                <div className="product-footer">
                                    <div className="product-price">
                                        {formatPrice(book.price)}
                                    </div>
                                    <button
                                        className={`btn-add-cart ${book.stock <= 0 ? 'disabled' : ''}`}
                                        onClick={() => addToCart(book)}
                                        disabled={book.stock <= 0}
                                    >
                                        🛒 {book.stock <= 0 ? 'Habis' : 'Beli'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-products">
                        <p>📭 Tidak ada produk yang cocok</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;
