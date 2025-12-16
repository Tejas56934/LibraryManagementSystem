// frontend/src/features/borrow/ReservationSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchMyReservations, placeNewReservation, cancelExistingReservation } from '../../api/reservationApi';

// --- Async Thunks ---

// NOTE: This thunk requires the student ID from the auth slice
export const getReservations = createAsyncThunk(
    'reservation/getReservations',
    async (studentId, { rejectWithValue }) => {
        try {
            return await fetchMyReservations(studentId);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const placeHold = createAsyncThunk(
    'reservation/placeHold',
    async (data, { rejectWithValue }) => {
        try {
            return await placeNewReservation(data);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const cancelHold = createAsyncThunk(
    'reservation/cancelHold',
    async (reservationId, { rejectWithValue }) => {
        try {
            return await cancelExistingReservation(reservationId);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// --- Slice Definition ---

const reservationSlice = createSlice({
    name: 'reservation',
    initialState: {
        list: [], // The student's list of holds
        loading: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // --- Get Reservations ---
            .addCase(getReservations.pending, (state) => { state.loading = 'pending'; })
            .addCase(getReservations.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.list = action.payload;
            })
            .addCase(getReservations.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
            // --- Place Hold ---
            .addCase(placeHold.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })
            // --- Cancel Hold ---
            .addCase(cancelHold.fulfilled, (state, action) => {
                // Remove the cancelled reservation from the list
                state.list = state.list.filter(res => res.id !== action.payload.id);
            })
            // Update the state if a hold is cancelled but returned object is different
            .addCase(cancelHold.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default reservationSlice.reducer;