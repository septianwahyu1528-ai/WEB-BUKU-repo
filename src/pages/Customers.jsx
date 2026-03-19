import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Customers.css';

const Customers = ({ user, onNavigate }) => {
    const [customers, setCustomers] = useState([]);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        country: ''
    });

    // Check login status dan admin role
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        
        if (!storedUser) {
            setError('Anda harus login terlebih dahulu untuk melihat data pelanggan.');
            setLoading(false);
            return;
        }
        
        if (user.role !== 'admin') {
            setError('Akses ditolak. Hanya admin yang bisa mengakses halaman ini.');
            setLoading(false);
            return;
        }
    }, []);

    // Fetch customers dari API
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                setError('');
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Anda harus login terlebih dahulu untuk melihat data pelanggan.');
                    setCustomers([]);
                    setLoading(false);
                    return;
                }
                let response;
                try {
                    response = await axios.get('/api/customers', {
                        headers: { 'Authorization': `Bearer ${token}` },
                        timeout: 3000
                    });
                } catch (err) {
                    response = await axios.get('http://localhost:5000/api/customers', {
                        headers: { 'Authorization': `Bearer ${token}` },
                        timeout: 3000
                    });
                }
                const customersData = response.data.data || response.data;
                setCustomers(Array.isArray(customersData) ? customersData : []);
            } catch (error) {
                console.error('Error fetching customers:', error);
                setError('Gagal memuat data pelanggan. Pastikan Anda sudah login.');
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCustomers();
    }, []);

    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            totalPurchase: customer.totalPurchase
        });
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSaveEdit = () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.address) {
            alert('Semua field harus diisi!');
            return;
        }

        setCustomers(customers.map(customer =>
            customer.id === editingCustomer.id
                ? { ...customer, ...formData }
                : customer
        ));
        setShowEditModal(false);
        setEditingCustomer(null);
        alert('Data pelanggan berhasil diperbarui!');
    };

    const handleDeleteCustomer = (customerId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
            setCustomers(customers.filter(customer => customer.id !== customerId));
            alert('Pelanggan berhasil dihapus!');
        }
    };

    return (
        <div className="customers-container">
            <div className="customers-header">
                <h2>👥 Daftar Pelanggan</h2>
                <p>Kelola dan lihat informasi pelanggan Anda</p>
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
                    {!loading && customers.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Tidak ada data pelanggan yang ditemukan.</div>}

                    <div className="customers-stats">
                        <div className="stat-card">
                            <h3>{customers.length}</h3>
                            <p>Total Pelanggan</p>
                        </div>
                        <div className="stat-card">
                            <h3>Rp {customers.length > 0 ? parseInt(customers.reduce((sum, c) => sum + (c.total_purchase || 0), 0)).toLocaleString('id-ID') : '0'}</h3>
                            <p>Total Pembelian</p>
                        </div>
                        <div className="stat-card">
                            <h3>{customers.length > 0 ? (customers.reduce((sum, c) => sum + (c.total_orders || 0), 0) / customers.length).toFixed(1) : '0'}</h3>
                            <p>Rata-rata Pesanan</p>
                        </div>
                    </div>

                    <div className="customers-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Telepon</th>
                                    <th>Kota</th>
                                    <th>Total Belanja</th>
                                    <th>Total Pesanan</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>{customer.name}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.phone}</td>
                                        <td>{customer.city}</td>
                                        <td>{customer.total_purchase ? `Rp ${parseInt(customer.total_purchase).toLocaleString('id-ID')}` : 'Rp 0'}</td>
                                        <td>{customer.total_orders || 0} pesanan</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-edit"
                                                    onClick={() => handleEditCustomer(customer)}
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteCustomer(customer.id)}
                                                    title="Hapus"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                            <h2>Edit Pelanggan</h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowEditModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan nama"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan email"
                                />
                            </div>
                            <div className="form-group">
                                <label>No. Telepon</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan nomor telepon"
                                />
                            </div>
                            <div className="form-group">
                                <label>Alamat</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan alamat"
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Total Pembelian</label>
                                <input
                                    type="text"
                                    name="totalPurchase"
                                    value={formData.totalPurchase}
                                    onChange={handleInputChange}
                                    placeholder="Rp 0"
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

export default Customers;
