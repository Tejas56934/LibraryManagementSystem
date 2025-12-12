import axios from 'axios';

// Base URL for the backend API
const API_URL = '/api/v1/admin/acquisitions';

// Assuming you have an instance of Axios configured with headers (like JWT/Auth)
// If not, you'll need to configure it or use a default instance.
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}`
    }
});

// --- Vendor Endpoints ---

/**
 * Fetches all vendors available for purchasing books.
 */
export const fetchAllVendors = async () => {
    try {
        const response = await apiClient.get('/vendors');
        return response.data;
    } catch (error) {
        throw error.response.data || error.message;
    }
};

/**
 * Creates a new vendor.
 */
export const createNewVendor = async (vendorData) => {
    try {
        const response = await apiClient.post('/vendors', vendorData);
        return response.data;
    } catch (error) {
        throw error.response.data || error.message;
    }
};


// --- Purchase Order Endpoints ---

/**
 * Creates a new purchase order.
 */
export const createPurchaseOrder = async (orderData) => {
    try {
        const response = await apiClient.post('/orders', orderData);
        return response.data;
    } catch (error) {
        throw error.response.data || error.message;
    }
};

/**
 * Fetches all purchase orders.
 */
export const fetchAllPurchaseOrders = async () => {
    try {
        const response = await apiClient.get('/orders');
        return response.data;
    } catch (error) {
        throw error.response.data || error.message;
    }
};

/**
 * Marks a specific purchase order as received, triggering the backend stock update.
 */
export const markOrderAsReceived = async (orderId) => {
    try {
        // Using PUT to update the status to 'RECEIVED'
        const response = await apiClient.put(`/orders/${orderId}/receive`);
        return response.data;
    } catch (error) {
        throw error.response.data || error.message;
    }
};