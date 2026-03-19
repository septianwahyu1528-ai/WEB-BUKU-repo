/**
 * Centralized API configuration and utilities
 * Handles all API requests with proper error handling and fallbacks
 */

// Determine API base URL
const getAPIBaseURL = () => {
    // In development with Vite proxy: use relative path
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        const isViteServer = window.location.port === '5173' || window.location.port === '5174';
        if (isViteServer) {
            return ''; // Use relative paths for Vite proxy
        }
    }
    // Fallback to direct backend URL
    return 'http://localhost:5000';
};

export const API_BASE_URL = getAPIBaseURL();

/**
 * Make API request with automatic fallback
 */
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API] Error on ${endpoint}:`, error.message);
        throw error;
    }
};

/**
 * Check if backend is available
 */
export const checkBackendStatus = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`, {
            timeout: 2000,
            signal: AbortSignal.timeout(2000),
        });
        return response.ok;
    } catch (error) {
        console.log('[API] Backend check failed:', error.message);
        return false;
    }
};

/**
 * Login API call
 */
export const loginAPI = async (email, password) => {
    return apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

/**
 * Register API call
 */
export const registerAPI = async (name, email, password) => {
    return apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
};

/**
 * Get books API call
 */
export const getBooksAPI = async () => {
    return apiRequest('/api/books', {
        method: 'GET',
    });
};

/**
 * Get customers API call
 */
export const getCustomersAPI = async (headers = {}) => {
    return apiRequest('/api/customers', {
        method: 'GET',
        headers,
    });
};

/**
 * Get orders API call
 */
export const getOrdersAPI = async (headers = {}) => {
    return apiRequest('/api/orders', {
        method: 'GET',
        headers,
    });
};
