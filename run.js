#!/usr/bin/env node
/**
 * Main Startup Runner for Toko Buku
 * Starts backend and frontend servers properly
 */

import { spawn } from 'child_process';
import fs from 'fs';

const isWindows = process.platform === 'win32';

let backendProcess = null;
let frontendProcess = null;

function startBackend() {
    console.log('🚀 Starting Backend Server...\n');
    return new Promise((resolve) => {
        backendProcess = spawn('node', ['server/index.js'], {
            stdio: 'inherit',
            shell: true
        });

        backendProcess.on('error', (err) => {
            console.error('❌ Backend error:', err);
            resolve(false);
        });

        // Give backend time to fully start
        setTimeout(() => resolve(true), 3000);
    });
}

function startFrontend() {
    console.log('\n🎨 Starting Frontend Server...\n');
    return new Promise((resolve) => {
        frontendProcess = spawn('vite', [], {
            stdio: 'inherit',
            shell: true,
            env: { ...process.env }
        });

        frontendProcess.on('error', (err) => {
            console.error('❌ Frontend error:', err);
            resolve(false);
        });

        // Running indefinitely
        frontendProcess.on('exit', () => {
            console.log('Frontend stopped');
            process.exit(0);
        });

        resolve(true);
    });
}

// Main
(async () => {
    try {
        console.log('\n╔══════════════════════════════════════════╗');
        console.log('║    🚀 TOKO BUKU - STARTUP 🚀    ║');
        console.log('╚══════════════════════════════════════════╝\n');

        const backendOk = await startBackend();
        if (!backendOk) {
            console.error('❌ Failed to start backend');
            process.exit(1);
        }

        const frontendOk = await startFrontend();
        if (!frontendOk) {
            console.error('❌ Failed to start frontend');
            if (backendProcess) backendProcess.kill();
            process.exit(1);
        }

        console.log('\n✅ Both servers started successfully!');
        console.log('\n📍 URLs:');
        console.log('   Frontend: http://localhost:5173');
        console.log('   Backend:  http://localhost:5000');
        console.log('\n💡 Press Ctrl+C to stop\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();

// Graceful shutdown
function shutdown() {
    console.log('\n🛑 Shutting down...');
    
    if (backendProcess) {
        backendProcess.kill('SIGTERM');
        setTimeout(() => backendProcess.kill('SIGKILL'), 2000);
    }
    if (frontendProcess) {
        frontendProcess.kill('SIGTERM');
        setTimeout(() => frontendProcess.kill('SIGKILL'), 2000);
    }

    setTimeout(() => process.exit(0), 3000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
