// frontend/src/api/axiosInstance.js

import axios from 'axios';

// The base URL for the backend API controllers
const BASE_URL = 'https://lms-backend-tejas.onrender.com';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    // Note: The /api/v1 prefix is often handled by the specific call in the API files
});

// --- JWT Request Interceptor ---
// This runs before every request is sent.
axiosInstance.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));

        if (user && user.token) {
            // CRITICAL: Inject the Authorization header
            config.headers.Authorization = `Bearer ${user.token}`;
            // Ensure Content-Type is set for POST/PUT requests
            if (config.method !== 'get' && !config.headers['Content-Type']) {
                config.headers['Content-Type'] = 'application/json';
            }
        } else {
            // Clear header if user is logged out
            delete config.headers.Authorization;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
