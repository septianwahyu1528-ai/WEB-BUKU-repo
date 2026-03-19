import { useState, useEffect } from 'react';
import axios from 'axios';
import { getBooksAPI } from '../utils/api';
import ProductDetail from './ProductDetail';
import '../styles/Products.css';

function Products({ user, onNavigate }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const isAdmin = user?.role === 'admin';
    
    // Admin states
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        price: '',
        stock: '',
        rating: '4.5',
        category: '',
        description: '',
        isbn: '',
        publisher: '',
        image: ''
    });

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
            setError(null);
            console.log('📚 Fetching books from /api/books...');
            
            const data = await getBooksAPI();
            const booksData = data.data || data;
            console.log('✓ Got books from server:', Array.isArray(booksData) ? booksData.length : 0);
            setBooks(Array.isArray(booksData) ? booksData : []);
        } catch (err) {
            console.error('❌ Error fetching books:', err.message);
            // Fallback to mock data
            console.log('⚠️ Using mock data fallback...');
            const mockData = getMockBooks();
            setBooks(mockData);
            setError('📖 Mode Offline: Server tidak aktif. Menampilkan data contoh.');
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

    // Admin functions
    const handleOpenAddModal = () => {
        setEditingBook(null);
        setImageFile(null);
        setImagePreview(null);
        setFormData({
            title: '',
            author: '',
            price: '',
            stock: '',
            rating: '4.5',
            category: '',
            description: '',
            isbn: '',
            publisher: '',
            image: ''
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (book) => {
        setEditingBook(book);
        setImageFile(null);
        setImagePreview(`http://localhost:5000/images/${book.image}`);
        setFormData({
            title: book.title,
            author: book.author,
            price: book.price,
            stock: book.stock,
            rating: book.rating || '4.5',
            category: book.category,
            description: book.description || '',
            isbn: book.isbn || '',
            publisher: book.publisher || '',
            image: book.image || ''
        });
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                alert('Format gambar harus JPG, PNG, WebP, atau GIF');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran gambar maksimal 5MB');
                return;
            }
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProduct = async () => {
        try {
            if (!formData.title || !formData.author || !formData.price || !formData.stock || !formData.category) {
                alert('Semua field wajib diisi!');
                return;
            }

            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            
            if (editingBook) {
                // Update product (gunakan FormData jika ada file baru)
                if (imageFile) {
                    const formDataMultipart = new FormData();
                    formDataMultipart.append('title', formData.title);
                    formDataMultipart.append('author', formData.author);
                    formDataMultipart.append('price', parseFloat(formData.price));
                    formDataMultipart.append('stock', parseInt(formData.stock));
                    formDataMultipart.append('rating', parseFloat(formData.rating));
                    formDataMultipart.append('category', formData.category);
                    formDataMultipart.append('description', formData.description);
                    formDataMultipart.append('isbn', formData.isbn);
                    formDataMultipart.append('publisher', formData.publisher);
                    formDataMultipart.append('image', imageFile);
                    await axios.put(`http://localhost:5000/api/books/${editingBook.id}`, formDataMultipart, {
                        headers: {
                            ...headers,
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                } else {
                    const data = {
                        title: formData.title,
                        author: formData.author,
                        price: parseFloat(formData.price),
                        stock: parseInt(formData.stock),
                        rating: parseFloat(formData.rating),
                        category: formData.category,
                        description: formData.description,
                        isbn: formData.isbn,
                        publisher: formData.publisher,
                        image: formData.image
                    };
                    await axios.put(`http://localhost:5000/api/books/${editingBook.id}`, data, { headers });
                }
                // Refresh data
                await fetchBooks();
                alert('Produk berhasil diperbarui!');
            } else {
                // Create product - harus ada file gambar atau akan otomatis generate nama
                const formDataMultipart = new FormData();
                formDataMultipart.append('title', formData.title);
                formDataMultipart.append('author', formData.author);
                formDataMultipart.append('price', parseFloat(formData.price));
                formDataMultipart.append('stock', parseInt(formData.stock));
                formDataMultipart.append('rating', parseFloat(formData.rating));
                formDataMultipart.append('category', formData.category);
                formDataMultipart.append('description', formData.description);
                formDataMultipart.append('isbn', formData.isbn);
                formDataMultipart.append('publisher', formData.publisher);
                if (imageFile) {
                    formDataMultipart.append('image', imageFile);
                }
                const response = await axios.post('http://localhost:5000/api/books', formDataMultipart, {
                    headers: {
                        ...headers,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setBooks([...books, response.data.data]);
                alert('Produk berhasil ditambahkan!');
            }

            setShowModal(false);
            setImageFile(null);
            setImagePreview(null);
        } catch (err) {
            console.error('Error saving product:', err);
            alert('Gagal menyimpan produk: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteProduct = async (bookId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            
            await axios.delete(`http://localhost:5000/api/books/${bookId}`, { headers });
            setBooks(books.filter(b => b.id !== bookId));
            alert('Produk berhasil dihapus!');
        } catch (err) {
            console.error('Error deleting product:', err);
            alert('Gagal menghapus produk: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) {
        return <div className="products-container"><p className="loading">Memuat produk...</p></div>;
    }

    if (selectedProductId) {
        return <ProductDetail productId={selectedProductId} user={user} onBack={() => setSelectedProductId(null)} />;
    }

    return (
        <div className="products-container">
            <div className="products-header">
                <h1>📚 Koleksi Buku</h1>
                <p>Jelajahi koleksi buku terbaik kami</p>
            </div>

            {error && (
                <div className="error-message" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', padding: '10px 20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <span>⚠️ {error}</span>
                    <button 
                        onClick={fetchBooks}
                        style={{ padding: '5px 15px', backgroundColor: '#856404', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                        Coba Lagi
                    </button>
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

                {isAdmin && (
                    <button 
                        className="btn-add-product" 
                        onClick={handleOpenAddModal}
                        style={{padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                    >
                        ➕ Tambah Produk
                    </button>
                )}
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
                                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                        <button
                                            className="btn-detail"
                                            onClick={() => setSelectedProductId(book.id)}
                                            style={{padding: '6px 10px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}
                                            title="Lihat detail produk"
                                        >
                                            👁️ Detail
                                        </button>
                                        <button
                                            className={`btn-add-cart ${book.stock <= 0 ? 'disabled' : ''}`}
                                            onClick={() => addToCart(book)}
                                            disabled={book.stock <= 0}
                                        >
                                            🛒 {book.stock <= 0 ? 'Habis' : 'Beli'}
                                        </button>
                                        {isAdmin && (
                                            <>
                                                <button 
                                                    onClick={() => handleOpenEditModal(book)}
                                                    style={{padding: '6px 10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                                                    title="Edit produk"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteProduct(book.id)}
                                                    style={{padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                                                    title="Hapus produk"
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
                                    </div>
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

            {/* Modal Tambah/Edit Produk */}
            {showModal && isAdmin && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
                        <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '15px'}}>
                            <h2>{editingBook ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}</h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'}}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body" style={{padding: '20px'}}>
                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Judul Produk *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    placeholder="Masukkan judul produk"
                                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                                />
                            </div>

                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Penulis *</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleFormChange}
                                    placeholder="Masukkan nama penulis"
                                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                                />
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                                <div className="form-group">
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Harga (Rp) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleFormChange}
                                        placeholder="Masukkan harga"
                                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Stok *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleFormChange}
                                        placeholder="Masukkan jumlah stok"
                                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                                    />
                                </div>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                                <div className="form-group">
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Rating</label>
                                    <input
                                        type="number"
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleFormChange}
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        placeholder="Rating (0-5)"
                                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Kategori *</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleFormChange}
                                        placeholder="Masukkan kategori"
                                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Deskripsi</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Masukkan deskripsi produk"
                                    rows="3"
                                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                                />
                            </div>

                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>ISBN</label>
                                <input
                                    type="text"
                                    name="isbn"
                                    value={formData.isbn}
                                    onChange={handleFormChange}
                                    placeholder="Masukkan ISBN"
                                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                                />
                            </div>

                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Penerbit</label>
                                <input
                                    type="text"
                                    name="publisher"
                                    value={formData.publisher}
                                    onChange={handleFormChange}
                                    placeholder="Masukkan nama penerbit"
                                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                                />
                            </div>

                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>📷 Gambar Produk</label>
                                {imagePreview && (
                                    <div style={{marginBottom: '10px', textAlign: 'center'}}>
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            style={{maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', border: '1px solid #ddd'}}
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImageChange}
                                    style={{width: '100%', padding: '10px', border: '2px dashed #3498db', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#f8f9fa'}}
                                />
                                <small style={{color: '#666', marginTop: '5px', display: 'block'}}>Format: JPG, PNG, WebP, GIF (Max 5MB)</small>
                            </div>
                        </div>

                        <div className="modal-footer" style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '15px', borderTop: '1px solid #eee'}}>
                            <button 
                                onClick={() => setShowModal(false)}
                                style={{padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleSaveProduct}
                                style={{padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                            >
                                {editingBook ? '💾 Simpan Perubahan' : '➕ Tambah Produk'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;
