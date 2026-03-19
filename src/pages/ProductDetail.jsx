import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ProductDetail.css';

function ProductDetail({ productId, onBack, user }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        fetchProductDetail();
    }, [productId]);

    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📖 [Detail] Fetching product ID:', productId);
            
            let response;
            try {
                response = await axios.get(`/api/books/${productId}`, { timeout: 3000 });
            } catch (err) {
                try {
                    response = await axios.get(`http://localhost:5000/api/books/${productId}`, { timeout: 3000 });
                } catch (diectErr) {
                    throw new Error('Server tidak merespon');
                }
            }
            
            const productData = response.data.data || response.data;
            setProduct(productData);

            // Fetch related products
            try {
                let relRes;
                try {
                    relRes = await axios.get('/api/books', { timeout: 3000 });
                } catch (e) {
                    relRes = await axios.get('http://localhost:5000/api/books', { timeout: 3000 });
                }
                const booksData = relRes.data.data || relRes.data;
                const related = booksData
                    .filter(b => b.category === productData.category && b.id !== productId)
                    .slice(0, 4);
                setRelatedProducts(related);
            } catch (relErr) {
                console.warn('Gagal memuat produk serupa');
            }
        } catch (err) {
            console.error('❌ Error fetching product detail:', err);
            
            // Try fallback if it's one of the mock IDs
            const mockBooks = [
                { id: 1, title: 'Buku Campus', author: 'DIKA', price: 85000, image: 'Buku Campus.jpg', rating: 4.8, stock: 50, category: 'Buku Teks', description: 'Buku catatan berkualitas.' },
                { id: 2, title: 'Buku Folio', author: 'JESICCA', price: 79000, image: 'Buku Folio.jpg', rating: 4.7, stock: 45, category: 'Buku Teks', description: 'Buku besar untuk pencatatan.' }
            ];
            
            const fallback = mockBooks.find(b => b.id === Number(productId));
            if (fallback) {
                setProduct(fallback);
                setError('Mode Offline: Menampilkan data contoh.');
            } else {
                setError('Gagal memuat detail produk. Server mungkin sedang offline.');
            }
        } finally {
            setLoading(false);
        }
    };

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

    const handleAddToCart = () => {
        if (user && user.role === 'admin') {
            alert('Admin tidak bisa membeli produk');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                ...product,
                quantity: quantity,
                priceValue: product.price,
                bookTitle: product.title
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${quantity}x ${product.title} ditambahkan ke keranjang!`);
        setQuantity(1);
    };

    if (loading) {
        return (
            <div className="product-detail-container">
                <button className="btn-back" onClick={onBack}>← Kembali</button>
                <div className="loading">⏳ Memuat detail produk...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-container">
                <button className="btn-back" onClick={onBack}>← Kembali</button>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="product-detail-container">
            <button className="btn-back" onClick={onBack}>← Kembali</button>
            
            <div className="detail-wrapper">
                <div className="detail-image-section">
                    <div className="main-image">
                        <img
                            src={getImageUrl(product.image)}
                            alt={product.title}
                            onError={(e) => {
                                e.target.src = '/images/placeholder-book.png';
                            }}
                        />
                    </div>
                </div>

                <div className="detail-info-section">
                    <h1 className="product-title">{product.title}</h1>
                    
                    <div className="product-meta">
                        <div className="meta-item">
                            <span className="label">Penulis:</span>
                            <span className="value">{product.author}</span>
                        </div>
                        {product.publisher && (
                            <div className="meta-item">
                                <span className="label">Penerbit:</span>
                                <span className="value">{product.publisher}</span>
                            </div>
                        )}
                        {product.isbn && (
                            <div className="meta-item">
                                <span className="label">ISBN:</span>
                                <span className="value">{product.isbn}</span>
                            </div>
                        )}
                        {product.category && (
                            <div className="meta-item">
                                <span className="label">Kategori:</span>
                                <span className="category-badge">{product.category}</span>
                            </div>
                        )}
                    </div>

                    <div className="rating-section">
                        {product.rating && (
                            <>
                                <span className="stars">⭐ {Number(product.rating).toFixed(1)}/5.0</span>
                            </>
                        )}
                    </div>

                    <div className="price-section">
                        <span className="price">{formatPrice(product.price)}</span>
                    </div>

                    <div className="stock-section">
                        {product.stock > 0 ? (
                            <span className="stock-available">✓ {product.stock} tersedia</span>
                        ) : (
                            <span className="stock-empty">✗ Stok habis</span>
                        )}
                    </div>

                    {product.description && (
                        <div className="description-section">
                            <h3>Deskripsi</h3>
                            <p>{product.description}</p>
                        </div>
                    )}

                    {product.stock > 0 && user?.role !== 'admin' && (
                        <div className="purchase-section">
                            <div className="quantity-selector">
                                <label>Jumlah:</label>
                                <div className="qty-controls">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="qty-btn"
                                    >
                                        −
                                    </button>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max={product.stock}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    />
                                    <button 
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="qty-btn"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button 
                                className="btn-add-cart"
                                onClick={handleAddToCart}
                            >
                                🛒 Tambah ke Keranjang
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="related-section">
                    <h2>📚 Produk Serupa</h2>
                    <div className="related-grid">
                        {relatedProducts.map(relatedProduct => (
                            <div key={relatedProduct.id} className="related-card">
                                <div className="related-image">
                                    <img
                                        src={getImageUrl(relatedProduct.image)}
                                        alt={relatedProduct.title}
                                        onError={(e) => {
                                            e.target.src = '/images/placeholder-book.png';
                                        }}
                                    />
                                </div>
                                <h4>{relatedProduct.title}</h4>
                                <p className="related-author">{relatedProduct.author}</p>
                                <p className="related-price">{formatPrice(relatedProduct.price)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetail;
