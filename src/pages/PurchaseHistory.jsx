import React, { useState, useEffect } from 'react';
import '../styles/PurchaseHistory.css';

const PurchaseHistory = () => {
    const [purchaseHistory, setPurchaseHistory] = useState([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('purchaseHistory');
        if (savedHistory) {
            setPurchaseHistory(JSON.parse(savedHistory));
        }
    }, []);

    const handleDeleteHistory = (purchaseId) => {
        if (window.confirm('Hapus dari riwayat belanja?')) {
            const updated = purchaseHistory.filter(p => p.id !== purchaseId);
            setPurchaseHistory(updated);
            localStorage.setItem('purchaseHistory', JSON.stringify(updated));
            alert('Riwayat belanja dihapus!');
        }
    };

    const getTotalPrice = () => {
        return purchaseHistory.reduce((sum, purchase) => {
            const itemTotal = purchase.items.reduce((itemSum, item) => {
                // Handle multiple price field names
                const price = item.priceValue || item.price || item.unit_price || 0;
                return itemSum + (parseFloat(price) * item.quantity);
            }, 0);
            return sum + itemTotal;
        }, 0);
    };
    
    const getPurchaseTotal = (purchase) => {
        // If totalAmount exists and is greater than 0, use it
        if (purchase.totalAmount && purchase.totalAmount > 0) {
            return purchase.totalAmount;
        }
        // Otherwise calculate from items
        return purchase.items.reduce((sum, item) => {
            const price = item.priceValue || item.price || item.unit_price || 0;
            return sum + (parseFloat(price) * item.quantity);
        }, 0);
    };

    const getTotalItems = () => {
        return purchaseHistory.reduce((sum, purchase) => {
            return sum + purchase.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
    };

    return (
        <div className="purchase-history-container">
            <div className="history-header">
                <h2>📋 Riwayat Belanja</h2>
                <p>Total Pembelian: {purchaseHistory.length} | Total Belanja: Rp {getTotalPrice().toLocaleString('id-ID')}</p>
            </div>

            {purchaseHistory.length === 0 ? (
                <div className="empty-history">
                    <p>Belum ada riwayat belanja</p>
                    <p>Lakukan checkout untuk mencatat pembelian</p>
                </div>
            ) : (
                <div className="history-list">
                    {purchaseHistory.map((purchase) => (
                        <div key={purchase.id} className="purchase-card">
                            <div className="purchase-header">
                                <div className="purchase-info">
                                    <h3>📦 Transaksi #{purchase.id}</h3>
                                    <p className="purchase-date">Tanggal: {new Date(purchase.purchaseDate).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                </div>
                                <button 
                                    className="btn-delete-history"
                                    onClick={() => handleDeleteHistory(purchase.id)}
                                    title="Hapus Riwayat"
                                >
                                    🗑️
                                </button>
                            </div>

                            <div className="purchase-items">
                                <table className="items-table">
                                    <thead>
                                        <tr>
                                            <th>Buku</th>
                                            <th>Harga Satuan</th>
                                            <th>Qty</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchase.items.map((item, idx) => {
                                            const itemPrice = item.priceValue || item.price || item.unit_price || 0;
                                            return (
                                            <tr key={idx}>
                                                <td className="item-name">{item.bookTitle || item.title || 'Buku'}</td>
                                                <td className="item-price">Rp {parseFloat(itemPrice).toLocaleString('id-ID')}</td>
                                                <td className="item-qty">{item.quantity}</td>
                                                <td className="item-subtotal">
                                                    Rp {(itemPrice * item.quantity).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="purchase-footer">
                                <div className="purchase-total">
                                    <span>Total Belanja:</span>
                                    <strong>Rp {getPurchaseTotal(purchase).toLocaleString('id-ID')}</strong>
                                </div>
                                <div className="purchase-stats">
                                    <span className="stat">📚 {purchase.items.length} Buku</span>
                                    <span className="stat">📦 {purchase.items.reduce((sum, item) => sum + item.quantity, 0)} Item</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {purchaseHistory.length > 0 && (
                <div className="history-summary">
                    <div className="summary-card">
                        <h4>📊 Ringkasan Belanja</h4>
                        <div className="summary-content">
                            <div className="summary-item">
                                <span>Total Transaksi:</span>
                                <strong>{purchaseHistory.length}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Total Buku Dibeli:</span>
                                <strong>{purchaseHistory.reduce((sum, p) => sum + p.items.length, 0)}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Total Item:</span>
                                <strong>{getTotalItems()}</strong>
                            </div>
                            <div className="summary-item highlight">
                                <span>Total Pengeluaran:</span>
                                <strong>Rp {getTotalPrice().toLocaleString('id-ID')}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseHistory;
