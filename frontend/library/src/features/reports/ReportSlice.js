import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportApi from '../../api/reportApi'; // Import your default export

// =====================================================================
// 1. ASYNC THUNKS (Connects Redux to your API)
// =====================================================================

// Fetch Dashboard Stats
export const fetchBasicStats = createAsyncThunk(
    'reports/fetchBasicStats',
    async (_, { rejectWithValue }) => {
        try {
            return await reportApi.getBasicReport();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch basic stats');
        }
    }
);

// Fetch Inventory Stock Status
export const fetchStockStatus = createAsyncThunk(
    'reports/fetchStockStatus',
    async (filters, { rejectWithValue }) => {
        try {
            return await reportApi.getInventoryStockStatus(filters);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock status');
        }
    }
);

// Fetch Low Stock Alerts
export const fetchLowStock = createAsyncThunk(
    'reports/fetchLowStock',
    async (filters, { rejectWithValue }) => {
        try {
            return await reportApi.getLowStockAlerts(filters);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock alerts');
        }
    }
);

// Fetch Purchase History (Audit)
export const fetchPurchaseHistory = createAsyncThunk(
    'reports/fetchPurchaseHistory',
    async (filters, { rejectWithValue }) => {
        try {
            return await reportApi.getPurchaseOrderHistory(filters);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase history');
        }
    }
);

// =====================================================================
// 2. SLICE DEFINITION (State Management)
// =====================================================================

const reportSlice = createSlice({
    name: 'reports',
    initialState: {
        // Data Holders
        basicStats: null,
        stockData: [],
        lowStockData: [],
        purchaseHistory: [],

        // Loading States (Granular control)
        loadingStats: false,
        loadingStock: false,
        loadingHistory: false,

        // Error State
        error: null,
    },
    reducers: {
        clearReportErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Basic Stats ---
            .addCase(fetchBasicStats.pending, (state) => { state.loadingStats = true; state.error = null; })
            .addCase(fetchBasicStats.fulfilled, (state, action) => {
                state.loadingStats = false;
                state.basicStats = action.payload;
            })
            .addCase(fetchBasicStats.rejected, (state, action) => {
                state.loadingStats = false;
                state.error = action.payload;
            })

            // --- Stock Status ---
            .addCase(fetchStockStatus.pending, (state) => { state.loadingStock = true; state.error = null; })
            .addCase(fetchStockStatus.fulfilled, (state, action) => {
                state.loadingStock = false;
                state.stockData = action.payload;
            })
            .addCase(fetchStockStatus.rejected, (state, action) => {
                state.loadingStock = false;
                state.error = action.payload;
            })

            // --- Low Stock Alerts ---
            .addCase(fetchLowStock.pending, (state) => { state.loadingStock = true; state.error = null; })
            .addCase(fetchLowStock.fulfilled, (state, action) => {
                state.loadingStock = false;
                state.lowStockData = action.payload;
            })
            .addCase(fetchLowStock.rejected, (state, action) => {
                state.loadingStock = false;
                state.error = action.payload;
            })

            // --- Purchase History ---
            .addCase(fetchPurchaseHistory.pending, (state) => { state.loadingHistory = true; state.error = null; })
            .addCase(fetchPurchaseHistory.fulfilled, (state, action) => {
                state.loadingHistory = false;
                state.purchaseHistory = action.payload;
            })
            .addCase(fetchPurchaseHistory.rejected, (state, action) => {
                state.loadingHistory = false;
                state.error = action.payload;
            });
    },
});

export const { clearReportErrors } = reportSlice.actions;
export default reportSlice.reducer;