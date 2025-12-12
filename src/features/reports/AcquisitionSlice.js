import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchAllVendors,
    createNewVendor,
    createPurchaseOrder,
    fetchAllPurchaseOrders,
    markOrderAsReceived
} from '../../api/acquisitionApi';

// --- Async Thunks ---

export const getVendors = createAsyncThunk(
    'acquisition/getVendors',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchAllVendors();
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const addVendor = createAsyncThunk(
    'acquisition/addVendor',
    async (vendorData, { rejectWithValue }) => {
        try {
            return await createNewVendor(vendorData);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const getPurchaseOrders = createAsyncThunk(
    'acquisition/getPurchaseOrders',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchAllPurchaseOrders();
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const placeNewOrder = createAsyncThunk(
    'acquisition/placeNewOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            return await createPurchaseOrder(orderData);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const receiveOrder = createAsyncThunk(
    'acquisition/receiveOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            return await markOrderAsReceived(orderId);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);


// --- Slice Definition ---

const acquisitionSlice = createSlice({
    name: 'acquisition',
    initialState: {
        vendors: [],
        orders: [],
        loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        // You can add synchronous reducers here if needed
    },
    extraReducers: (builder) => {
        builder
            // --- Get Vendors ---
            .addCase(getVendors.pending, (state) => { state.loading = 'pending'; })
            .addCase(getVendors.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.vendors = action.payload;
            })
            .addCase(getVendors.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
            // --- Add Vendor ---
            .addCase(addVendor.fulfilled, (state, action) => {
                state.vendors.push(action.payload);
            })
            // --- Get Orders ---
            .addCase(getPurchaseOrders.pending, (state) => { state.loading = 'pending'; })
            .addCase(getPurchaseOrders.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.orders = action.payload;
            })
            .addCase(getPurchaseOrders.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
            // --- Place New Order ---
            .addCase(placeNewOrder.fulfilled, (state, action) => {
                state.orders.push(action.payload);
            })
            // --- Receive Order ---
            .addCase(receiveOrder.fulfilled, (state, action) => {
                // Find and replace the received order in the state list
                const index = state.orders.findIndex(order => order.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            });
    },
});

export default acquisitionSlice.reducer;