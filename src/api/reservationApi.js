// frontend/src/api/reservationApi.js

import axios from 'axios';

const API_URL = '/api/v1/reservations';

// Assuming apiClient is configured for authentication
const apiClient = axios.create({
    baseURL: API_URL,
    // Add auth headers here if needed
});

/**
 * Fetches all pending reservations for the logged-in student.
 * [GET /api/v1/reservations/my?studentId={id}]
 */
export const fetchMyReservations = async (studentId) => {
    try {
        // NOTE: In a real app, the backend reads studentId from the JWT, not query param
        const response = await apiClient.get('/my', { params: { studentId } });
        return response.data;
    } catch (error) {
        throw error.response.data || error.message;
    }
};

/**
 * Places a new hold on a book.
 * [POST /api/v1/reservations?bookId={id}&studentId={id}]
 */
export const placeNewReservation = async ({ bookId, studentId }) => {
    try {
        const response = await apiClient.post('/', null, { params: { bookId, studentId } });
        return response.data;
    } catch (error) {
        throw error.response.data || error.message;
    }
};

/**
 * Cancels an existing reservation.
 * [PUT /api/v1/reservations/{id}/cancel]
 */
export const cancelExistingReservation = async (reservationId) => {
    try {
        const response = await apiClient.put(`/${reservationId}/cancel`);
        return response.data;
    } catch (error) {
        throw error.response.data || error.message;
    }
};