import React, { useState, useEffect } from 'react';
import { checkBackendStatus } from '../utils/api';
import '../styles/ServerStatus.css';

const ServerStatus = () => {
    const [isServerRunning, setIsServerRunning] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        // Check server status on mount
        const checkStatus = async () => {
            const running = await checkBackendStatus();
            setIsServerRunning(running);
            if (!running) {
                setShowHelp(true);
            }
        };
        
        checkStatus();
        
        // Re-check every 5 seconds if server is down
        const interval = setInterval(() => {
            if (!isServerRunning) {
                checkStatus();
            }
        }, 5000);
        
        return () => clearInterval(interval);
    }, [isServerRunning]);

    if (isServerRunning === null) return null; // Loading
    if (isServerRunning) return null; // Server is running, no need to show

    return (
        <div className="server-status-banner">
            <div className="status-content">
                <span className="status-icon">⚠️</span>
                <div className="status-text">
                    <strong>Backend berjalan di mode Offline</strong>
                    <p>Express server tidak terdeteksi. Beberapa fitur mungkin terbatas.</p>
                </div>
                <button 
                    className="help-toggle"
                    onClick={() => setShowHelp(!showHelp)}
                >
                    {showHelp ? '✕' : '?'}
                </button>
            </div>
            
            {showHelp && (
                <div className="help-content">
                    <h4>📋 Cara mengatasi:</h4>
                    <ol>
                        <li>Buka terminal baru di project folder</li>
                        <li>Jalankan: <code>npm run dev</code></li>
                        <li>Tunggu hingga kedua server siap</li>
                    </ol>
                    <p className="help-note">
                        ℹ️ Frontend: http://localhost:5173<br/>
                        ℹ️ Backend: http://localhost:5000
                    </p>
                    <button 
                        className="help-close"
                        onClick={() => setShowHelp(false)}
                    >
                        Mengerti
                    </button>
                </div>
            )}
        </div>
    );
};

export default ServerStatus;
