import React, { useState, useEffect } from 'react';
import ProductDetail from './ProductDetail';
import '../styles/Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    const handleDeleteItem = (itemId) => {
        if (window.confirm('Hapus item dari keranjang?')) {
            const updatedCart = cartItems.filter(item => item.id !== itemId);
            setCartItems(updatedCart);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            alert('Item dihapus dari keranjang!');
        }
    };

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity <= 0) return;
        
        const updatedCart = cartItems.map(item =>
            item.id === itemId
                ? { 
                    ...item, 
                    quantity: newQuantity,
                    totalPrice: `Rp ${(parseFloat(item.priceValue || item.price || 0) * newQuantity).toLocaleString('id-ID')}`
                }
                : item
        );
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Keranjang kosong! Tambahkan produk terlebih dahulu.');
            return;
        }
        
        // Ensure all items have proper priceValue
        const validatedItems = cartItems.map(item => ({
            ...item,
            priceValue: parseFloat(item.priceValue || item.price || 0)
        }));
        
        const totalAmount = validatedItems.reduce((sum, item) => sum + (item.priceValue * item.quantity), 0);
        
        const purchase = {
            id: Date.now(),
            purchaseDate: new Date().toISOString(),
            items: validatedItems,
            totalAmount: totalAmount
        };

        const existingHistory = localStorage.getItem('purchaseHistory');
        let history = existingHistory ? JSON.parse(existingHistory) : [];
        history.push(purchase);
        localStorage.setItem('purchaseHistory', JSON.stringify(history));

        alert(`✓ Checkout berhasil! ${validatedItems.length} item disimpan di riwayat belanja.\nTotal: Rp ${getTotalPrice()}`);
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    const getTotalPrice = () => {
        const total = cartItems.reduce((sum, item) => {
            const price = parseFloat(item.priceValue || item.price || 0);
            return sum + (price * item.quantity);
        }, 0);
        return total.toLocaleString('id-ID');
    };

    const getTotalItems = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    return (
        <div className="cart-container">
            {selectedProductId ? (
                <ProductDetail productId={selectedProductId} onBack={() => setSelectedProductId(null)} />
            ) : (
                <>
                    <div className="cart-header">
                        <h2>🛒 Keranjang Belanja</h2>
                        <p>Total Items: {getTotalItems()} | Total: Rp {getTotalPrice()}</p>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <p>Keranjang Anda kosong</p>
                            <p>Tambahkan pesanan dari halaman Pesanan</p>
                        </div>
                    ) : (
                <>
                    <div className="cart-items">
                        <table className="cart-table">
                            <thead>
                                <tr>
                                    <th>Buku</th>
                                    <th>Harga Satuan</th>
                                    <th>Jumlah</th>
                                    <th>Total</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map(item => (
                                    <tr key={item.id}>
                                        <td className="item-name">{item.bookTitle || item.title || 'Buku'}</td>
                                        <td className="item-price">Rp {(parseFloat(item.priceValue || item.price || 0)).toLocaleString('id-ID')}</td>
                                        <td className="item-qty">
                                            <div className="qty-control">
                                                <button 
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    className="qty-btn"
                                                >
                                                    −
                                                </button>
                                                <input 
                                                    type="number" 
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                                    min="1"
                                                    className="qty-input"
                                                />
                                                <button 
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    className="qty-btn"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="item-total">{item.totalPrice || `Rp ${(parseFloat(item.priceValue || item.price || 0) * item.quantity).toLocaleString('id-ID')}`}</td>
                                        <td className="item-action">
                                            <button 
                                                className="btn-detail"
                                                onClick={() => setSelectedProductId(item.id)}
                                                title="Lihat detail produk"
                                                style={{marginRight: '8px', padding: '6px 10px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}
                                            >
                                                👁️ Detail
                                            </button>
                                            <button 
                                                className="btn-remove"
                                                onClick={() => handleDeleteItem(item.id)}
                                                title="Hapus"
                                            >
                                                🗑️ Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="cart-footer">
                        <div className="cart-summary">
                            <div className="summary-row">
                                <span>Total Items:</span>
                                <strong>{getTotalItems()}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Total Harga:</span>
                                <strong className="total-amount">Rp {getTotalPrice()}</strong>
                            </div>
                        </div>
                        <div className="cart-actions">
                            <button 
                                className="btn-clear"
                                onClick={() => {
                                    if (window.confirm('Kosongkan keranjang?')) {
                                        setCartItems([]);
                                        localStorage.removeItem('cart');
                                    }
                                }}
                            >
                                Kosongkan Keranjang
                            </button>
                            <button 
                                className="btn-checkout"
                                onClick={handleCheckout}
                            >
                                ✓ Checkout
                            </button>
                        </div>
                    </div>
                    </>
                    )}
                </>
            )}
        </div>
    );
};

export default Cart;
