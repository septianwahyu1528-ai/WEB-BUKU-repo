import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Orders.css';

const Orders = ({ user, onNavigate }) => {
    const [orders, setOrders] = useState([]);
    const [books, setBooks] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [editingOrder, setEditingOrder] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        status: '',
        payment_method: ''
    });

    // Check login status dan admin role untuk Admin Orders page
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        
        if (!storedUser) {
            setError('Anda harus login terlebih dahulu untuk melihat data pesanan.');
            setLoading(false);
            return;
        }
        
        // Admin Orders page - admin only
        if (user.role === 'admin') {
            // Admin dapat mengakses halaman ini
        } else {
            setError('Akses ditolak. Halaman ini hanya untuk admin. Gunakan halaman Riwayat untuk melihat pesanan Anda.');
            setLoading(false);
            return;
        }
    }, []);

    // Fetch orders dari API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Anda harus login terlebih dahulu untuk melihat data pesanan.');
                    setOrders([]);
                    setBooks([]);
                    setCustomers([]);
                    setLoading(false);
                    return;
                }
                const headers = {
                    'Authorization': `Bearer ${token}`
                };

                // Fetch orders
                let ordersResponse;
                try {
                    ordersResponse = await axios.get('/api/orders', { headers, timeout: 3000 });
                } catch (err) {
                    ordersResponse = await axios.get('http://localhost:5000/api/orders', { headers, timeout: 3000 });
                }
                const ordersData = ordersResponse.data.data || ordersResponse.data;
                setOrders(Array.isArray(ordersData) ? ordersData : []);
                setError('');

                // Fetch books
                let booksResponse;
                try {
                    booksResponse = await axios.get('/api/books', { timeout: 3000 });
                } catch (err) {
                    booksResponse = await axios.get('http://localhost:5000/api/books', { timeout: 3000 });
                }
                const booksData = booksResponse.data.data || booksResponse.data;
                setBooks(Array.isArray(booksData) ? booksData : []);

                // Fetch customers
                let customersResponse;
                try {
                    customersResponse = await axios.get('/api/customers', { headers, timeout: 3000 });
                } catch (err) {
                    customersResponse = await axios.get('http://localhost:5000/api/customers', { headers, timeout: 3000 });
                }
                const customersData = customersResponse.data.data || customersResponse.data;
                setCustomers(Array.isArray(customersData) ? customersData : []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Gagal memuat data pesanan. Pastikan Anda sudah login.');
                setOrders([]);
                setBooks([]);
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

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

    const handleEditOrder = (order) => {
        setEditingOrder(order);
        setFormData({
            status: order.status,
            payment_method: order.payment_method || ''
        });
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSaveEdit = () => {
        if (!formData.status) {
            alert('Status harus dipilih!');
            return;
        }

        setOrders(orders.map(order =>
            order.id === editingOrder.id
                ? { 
                    ...order, 
                    status: formData.status,
                    payment_method: formData.payment_method
                }
                : order
        ));
        setShowEditModal(false);
        setEditingOrder(null);
        alert('Pesanan berhasil diperbarui!');
    };

    const handleDeleteOrder = (orderId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
            setOrders(orders.filter(order => order.id !== orderId));
            alert('Pesanan berhasil dihapus!');
        }
    };
        
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

    return (
        <div className="orders-container">
            <div className="orders-header">
                <h2>📦 Daftar Pesanan</h2>
                <p>Kelola dan pantau semua pesanan pelanggan</p>
            </div>

            {error && (
                <div className="error-message" style={{ 
                    marginBottom: '20px', 
                    padding: '20px', 
                    backgroundColor: '#fee', 
                    border: '2px solid #fcc', 
                    borderRadius: '4px', 
                    color: '#c33',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
                        🔐 {error}
                    </p>
                    {!localStorage.getItem('user') && onNavigate && (
                        <button 
                            onClick={() => onNavigate('login')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#e67e22',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                        >
                            ➜ Kembali ke Login
                        </button>
                    )}
                </div>
            )}

            {!error && (
                <>
                    {!loading && orders.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Tidak ada data pesanan yang ditemukan.</div>}

            <div className="orders-stats">
                <div className="stat-card">
                    <h3>{orders.length}</h3>
                    <p>Total Pesanan</p>
                </div>
                <div className="stat-card">
                    <h3>{completedOrders}</h3>
                    <p>Pesanan Selesai</p>
                </div>
                <div className="stat-card">
                    <h3>{formatCurrency(totalRevenue)}</h3>
                    <p>Total Pendapatan</p>
                </div>
            </div>

            <div className="orders-table">
                <table>
                    <thead>
                        <tr>
                            <th>No. Pesanan</th>
                            <th>Pelanggan</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Metode Bayar</th>
                            <th>Tanggal Pesan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            const customer = customers.find(c => c.id === order.customer_id);
                            return (
                            <tr key={order.id}>
                                <td className="order-number">ORD-{String(order.id).padStart(3, '0')}</td>
                                <td>{customer ? customer.name : 'Tidak diketahui'}</td>
                                <td className="price">Rp {parseInt(order.total_amount).toLocaleString('id-ID')}</td>
                                <td>
                                    <span 
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td>{order.payment_method || '-'}</td>
                                <td>{new Date(order.order_date).toLocaleDateString('id-ID')}</td>
                                <td>
                                    <div className="action-buttons" style={{opacity: 0.5, cursor: 'not-allowed'}}>
                                        <button 
                                            className="btn-edit"
                                            disabled
                                            title="Pesanan hanya dapat dibaca"
                                            style={{opacity: 0.5, cursor: 'not-allowed'}}
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            className="btn-delete"
                                            disabled
                                            title="Pesanan hanya dapat dibaca"
                                            style={{opacity: 0.5, cursor: 'not-allowed'}}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
                </>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Pesanan</h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowEditModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Metode Pembayaran</label>
                                <input
                                    type="text"
                                    name="payment_method"
                                    value={formData.payment_method}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan metode pembayaran"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-cancel"
                                onClick={() => setShowEditModal(false)}
                            >
                                Batal
                            </button>
                            <button 
                                className="btn-save"
                                onClick={handleSaveEdit}
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
