// frontend/src/api/feedbackApi.js

import axios from 'axios';

const API_URL = 'https://lms-backend-tejas.onrender.com/api/v1/admin/feedback';

// Assuming apiClient is configured for authentication
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}`
    }
});

/**
 * Fetches all Acquisition Requests for the Librarian review panel.
 */
export const fetchAcquisitionRequests = async () => {
    try {
        // Calls GET /api/v1/feedback/requests
        const response = await apiClient.get('/requests');
        return response.data;
    } catch (error) {
        throw error.response.data || error.message;
    }
};

/**
 * Updates the status of a specific Acquisition Request (e.g., to APPROVED_FOR_PURCHASE).
 */
export const updateRequestStatus = async (requestId, newStatus) => {
    try {
        // Calls PUT /api/v1/feedback/requests/{id}/status?status={newStatus}
        const response = await apiClient.put(`/requests/${requestId}/status`, null, {
            params: {
                status: newStatus
            }
        });
        return response.data;
    } catch (error) {
        throw error.response.data || error.message;
    }
};

/**
 * [Future Student Endpoint] Allows a student to submit a new acquisition request.
 */
export const submitNewFeedback = async (feedbackData) => {
    try {
        // Calls POST /api/v1/feedback
        const response = await apiClient.post('/', feedbackData);
        return response.data;
    } catch (error) {
        throw error.response.data || error.message;
    }
};
