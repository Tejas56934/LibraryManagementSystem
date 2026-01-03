// frontend/src/features/feedback/FeedbackSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchAcquisitionRequests,
    updateRequestStatus,
    submitNewFeedback // Import this to handle submission via Redux
} from '../../api/feedbackApi';

// --- Async Thunks ---

export const getAcquisitionRequests = createAsyncThunk(
    'feedback/getAcquisitionRequests',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchAcquisitionRequests();
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// 1. ADDED: Handle Submission via Redux for better state management
export const createAcquisitionRequest = createAsyncThunk(
    'feedback/createAcquisitionRequest',
    async (requestData, { rejectWithValue }) => {
        try {
            return await submitNewFeedback(requestData);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const changeRequestStatus = createAsyncThunk(
    'feedback/changeRequestStatus',
    async ({ requestId, newStatus }, { rejectWithValue }) => {
        try {
            const response = await updateRequestStatus(requestId, newStatus);
            // Ensure we return the ID and new status so reducer can update even if API doesn't return full obj
            return { ...response, requestId, newStatus };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// --- Slice Definition ---

const feedbackSlice = createSlice({
    name: 'feedback',
    initialState: {
        requests: [],
        loading: 'idle',
        operationLoading: false, // 2. ADDED: Separate loading state for buttons (Submit/Approve)
        error: null,
    },
    reducers: {
        // Optional: Action to clear errors manually
        clearFeedbackError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Get Requests ---
            .addCase(getAcquisitionRequests.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(getAcquisitionRequests.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.requests = action.payload;
            })
            .addCase(getAcquisitionRequests.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })

            // --- Create Request (New) ---
            .addCase(createAcquisitionRequest.pending, (state) => {
                state.operationLoading = true;
            })
            .addCase(createAcquisitionRequest.fulfilled, (state, action) => {
                state.operationLoading = false;
                // Add the new request to the top of the list instantly
                state.requests.unshift(action.payload);
            })
            .addCase(createAcquisitionRequest.rejected, (state, action) => {
                state.operationLoading = false;
                state.error = action.payload;
            })

            // --- Update Request Status ---
            .addCase(changeRequestStatus.pending, (state) => {
                state.operationLoading = true;
            })
            .addCase(changeRequestStatus.fulfilled, (state, action) => {
                state.operationLoading = false;
                const { requestId, newStatus, ...updatedData } = action.payload;

                const index = state.requests.findIndex(req => req.id === requestId);
                if (index !== -1) {
                    // Safe Merge: Keep existing data, overwrite with new data
                    state.requests[index] = {
                        ...state.requests[index],
                        ...updatedData,
                        status: newStatus
                    };
                }
            })
            .addCase(changeRequestStatus.rejected, (state, action) => {
                state.operationLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearFeedbackError } = feedbackSlice.actions;
export default feedbackSlice.reducer;