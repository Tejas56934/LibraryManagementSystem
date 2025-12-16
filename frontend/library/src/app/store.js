// frontend/src/app/store.js

import { configureStore } from '@reduxjs/toolkit';

// 1. Import the new acquisition reducer
import acquisitionReducer from '../features/reports/AcquisitionSlice';
// Assuming other reducers are imported here:
import authReducer from '../features/auth/AuthSlice';
import bookReducer from '../features/books/BookSlice';
import feedbackReducer from '../features/feedback/FeedbackSlice';
import reservationReducer from '../features/borrow/ReservationSlice';
// ... other reducers

export const store = configureStore({
  reducer: {
    // 2. Add the acquisition reducer under the key 'acquisition'
    auth: authReducer,
    books: bookReducer,
    // Add the new slice here:
    acquisition: acquisitionReducer, // <-- THIS IS THE CRITICAL LINE
    feedback: feedbackReducer,
    reservation: reservationReducer,
    // The key 'acquisition' must match what your component is destructuring.
    // const { orders, loading, error } = useSelector(state => state.acquisition);
  },
  // You might have middleware settings here, etc.
});