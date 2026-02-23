import React, { useState } from 'react';
import '../styles/Settings.css';

const Settings = () => {
    const [settings, setSettings] = useState({
        storeName: 'Toko Buku Kami',
        email: 'admin@tokobuku.com',
        phone: '081234567890',
        address: 'Jl. Buku No. 123, Jakarta',
        notifications: true,
        darkMode: false,
        language: 'id',
        currency: 'IDR'
    });

    const [saved, setSaved] = useState(false);

    const handleChange = (field, value) => {
        setSettings({
            ...settings,
            [field]: value
        });
    };

    const handleSave = () => {
        localStorage.setItem('storeSettings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2>⚙️ Pengaturan</h2>
                <p>Kelola pengaturan toko dan preferensi Anda</p>
            </div>

            {saved && <div className="success-message">✅ Pengaturan berhasil disimpan!</div>}

            <div className="settings-content">
                {/* Pengaturan Toko */}
                <div className="settings-section">
                    <h3>🏪 Pengaturan Toko</h3>
                    
                    <div className="form-group">
                        <label>Nama Toko</label>
                        <input
                            type="text"
                            value={settings.storeName}
                            onChange={(e) => handleChange('storeName', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Nomor Telepon</label>
                        <input
                            type="tel"
                            value={settings.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Alamat</label>
                        <textarea
                            rows="3"
                            value={settings.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                        />
                    </div>
                </div>

                {/* Pengaturan Preferensi */}
                <div className="settings-section">
                    <h3>🎨 Preferensi</h3>

                    <div className="form-group">
                        <label>Bahasa</label>
                        <select value={settings.language} onChange={(e) => handleChange('language', e.target.value)}>
                            <option value="id">Indonesia</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Mata Uang</label>
                        <select value={settings.currency} onChange={(e) => handleChange('currency', e.target.value)}>
                            <option value="IDR">IDR (Rp)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                        </select>
                    </div>

                    <div className="form-group checkbox">
                        <input
                            type="checkbox"
                            checked={settings.notifications}
                            onChange={(e) => handleChange('notifications', e.target.checked)}
                            id="notifications"
                        />
                        <label htmlFor="notifications">Aktifkan notifikasi</label>
                    </div>

                    <div className="form-group checkbox">
                        <input
                            type="checkbox"
                            checked={settings.darkMode}
                            onChange={(e) => handleChange('darkMode', e.target.checked)}
                            id="darkMode"
                        />
                        <label htmlFor="darkMode">Mode gelap</label>
                    </div>
                </div>

                <button className="btn-save" onClick={handleSave}>
                    💾 Simpan Pengaturan
                </button>
            </div>
        </div>
    );
};

export default Settings;
