// frontend/src/features/feedback/FeedbackSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAcquisitionRequests, updateRequestStatus } from '../../api/feedbackApi';

// --- Async Thunks ---

export const getAcquisitionRequests = createAsyncThunk(
    'feedback/getAcquisitionRequests',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchAcquisitionRequests();
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const changeRequestStatus = createAsyncThunk(
    'feedback/changeRequestStatus',
    async ({ requestId, newStatus }, { rejectWithValue }) => {
        try {
            return await updateRequestStatus(requestId, newStatus);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// --- Slice Definition ---

const feedbackSlice = createSlice({
    name: 'feedback',
    initialState: {
        requests: [], // Holds the list of acquisition requests
        loading: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // --- Get Requests ---
            .addCase(getAcquisitionRequests.pending, (state) => { state.loading = 'pending'; })
            .addCase(getAcquisitionRequests.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.requests = action.payload;
            })
            .addCase(getAcquisitionRequests.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
            // --- Update Request Status ---
            .addCase(changeRequestStatus.fulfilled, (state, action) => {
                // Find and replace the updated request in the state list
                const updatedRequest = action.payload;
                const index = state.requests.findIndex(req => req.id === updatedRequest.id);
                if (index !== -1) {
                    state.requests[index] = updatedRequest;
                }
            });
    },
});

export default feedbackSlice.reducer;