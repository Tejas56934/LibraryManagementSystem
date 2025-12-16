import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/AuthSlice';
import bookReducer from '../features/books/BookSlice';
// Import other slices as you create them

const rootReducer = combineReducers({
  auth: authReducer,
  books: bookReducer,
  // ... other feature reducers
});

export default rootReducer;