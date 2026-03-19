import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Catalog.css';

function Catalog({ onNavigate, onViewProduct }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('title');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            console.log('📚 Fetching books from /api/books...');
            
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
            setError('Gagal memuat katalog produk. Silakan coba lagi nanti.');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesCategory = filter === 'all' || book.category === filter;
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.author.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
        switch(sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return a.title.localeCompare(b.title);
        }
    });

    const categories = ['all', ...new Set(books.map(b => b.category).filter(Boolean))];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getImageUrl = (imageName) => {
        if (!imageName) return '/images/placeholder-book.png';
        if (imageName.startsWith('http')) return imageName;
        return `/images/${imageName}`;
    };

    return (
        <div className="catalog-container">
            <div className="catalog-header">
                <h1>📚 Katalog Toko Buku</h1>
                <p>Jelajahi koleksi buku lengkap kami</p>
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchBooks}>Coba Lagi</button>
                </div>
            )}

            {!error && (
                <div className="catalog-controls">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Cari buku atau penulis..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filters">
                        <div className="filter-group">
                            <label>Kategori:</label>
                            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'Semua Kategori' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Urutkan:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="title">Judul (A-Z)</option>
                                <option value="price-low">Harga Terendah</option>
                                <option value="price-high">Harga Tertinggi</option>
                                <option value="rating">Rating Tertinggi</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading-spinner">
                    <p>⏳ Memuat katalog...</p>
                </div>
            ) : (
                <>
                    <div className="catalog-stats">
                        <p>Menampilkan <strong>{filteredBooks.length}</strong> dari <strong>{books.length}</strong> buku</p>
                    </div>

                    <div className="books-grid">
                        {filteredBooks.length === 0 ? (
                            <div className="no-books">
                                <p>😔 Tidak ada buku yang sesuai dengan pencarian Anda</p>
                            </div>
                        ) : (
                            filteredBooks.map(book => (
                                <div key={book.id} className="book-card">
                                    <div className="book-image-wrapper">
                                        <img
                                            src={getImageUrl(book.image)}
                                            alt={book.title}
                                            onError={(e) => {
                                                e.target.src = '/images/placeholder-book.png';
                                            }}
                                        />
                                        {book.rating && (
                                            <div className="book-rating">
                                                ⭐ {book.rating.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="book-info">
                                        <h3>{book.title}</h3>
                                        <p className="author">Oleh: {book.author}</p>
                                        {book.category && <p className="category">📌 {book.category}</p>}
                                        
                                        <div className="book-meta">
                                            <span className={`stock ${book.stock > 0 ? 'available' : 'out'}`}>
                                                {book.stock > 0 ? `${book.stock} tersedia` : 'Habis'}
                                            </span>
                                        </div>

                                        <p className="price">{formatPrice(book.price)}</p>

                                        {book.description && (
                                            <p className="description">{book.description.substring(0, 100)}...</p>
                                        )}

                                        <button 
                                            className="btn-view"
                                            onClick={() => onViewProduct && onViewProduct(book)}
                                        >
                                            👁️ Lihat Detail
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Catalog;
