import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// --- CORE PAGES & LAYOUTS ---
import LoginPage from '../features/auth/LoginPage';
import NotFound from '../pages/NotFound';
import AdminLayout from '../layouts/AdminLayout';
import StudentLayout from '../layouts/StudentLayout';
import AdminDashboard from '../pages/AdminDashboard';
import StudentDashboard from '../pages/StudentDashboard';
import ShelfMapPage from '../pages/ShelfMapPage';

// --- FEATURE IMPORTS ---
import BookList from '../features/books/BookList';
import BookDetail from '../features/books/BookDetail';
import ExcelImport from '../features/books/ExcelImport';

import StudentList from '../features/students/StudentList';
import StudentDetail from '../features/students/StudentDetail';
import StudentImport from '../features/students/StudentImport';

import ActiveLoans from '../features/borrow/ActiveLoans';
import IssueBook from '../features/borrow/IssueBook';
import ReturnBook from '../features/borrow/ReturnBook';
import ReadingLog from '../features/borrow/ReadingLog';
import ReservationPage from '../features/borrow/ReservationPage';

import AlertsPage from '../features/notifications/AlertsPage';

// --- ACQUISITIONS & FEEDBACK IMPORTS ---
import AcquisitionPage from '../features/reports/AcquisitionPage';
import VendorManagement from '../features/reports/VendorManagement';
import FeedbackReviewPage from '../features/feedback/FeedbackReviewPage';
import FeedbackSubmitPage from '../features/feedback/FeedbackSubmitPage';

// --- REPORTING IMPORTS ---
import ReportHub from '../pages/ReportHub';
import ReportDetailPage from '../pages/ReportDetailPage';

// ==========================================
// 🚀 NEW AI IMPORTS
// ==========================================
import AdminAnalytics from '../pages/AdminAnalytics'; // The Analyst Dashboard
import AIChatWidget from '../components/AIChatWidget'; // The Floating Chatbot

// --- PRIVATE ROUTE COMPONENT (SECURITY GATE) ---
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  return (
    <Router>
      <div className="app-container">
        <Routes>

          {/* === PUBLIC ROUTES & LOGIN REDIRECTION === */}
          <Route
            path="/"
            element={
              isAuthenticated ?
              (role === 'ADMIN' ?
                <Navigate to="/admin/dashboard" replace /> :
                <Navigate to="/student/dashboard" replace />
              ) :
              <LoginPage />
            }
          />
          <Route path="/unauthorized" element={<NotFound message="Access Denied" />} />

          {/* ======================================================================= */}
          {/* === 1. ADMIN PROTECTED ROUTES (Librarian) === */}
          {/* ======================================================================= */}
          <Route
            path="/admin"
            element={<PrivateRoute allowedRoles={['ADMIN']}><AdminLayout /></PrivateRoute>}
          >
            {/* Dashboard */}
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* 🚀 NEW: AI ANALYTICS ROUTE */}
            <Route path="analytics" element={<AdminAnalytics />} />

            {/* Book Management */}
            <Route path="books" element={<BookList viewMode="admin" />} />
            <Route path="books/import" element={<ExcelImport />} />
            <Route path="books/add" element={<BookDetail />} />
            <Route path="books/manage/:bookId" element={<BookDetail />} />
            <Route path="shelf/location" element={<ShelfMapPage />} />
            <Route path="shelf/location/:bookId" element={<ShelfMapPage />} />

            {/* Student Management */}
            <Route path="students" element={<StudentList />} />
            <Route path="students/details/:studentId" element={<StudentDetail />} />
            <Route path="students/add" element={<StudentDetail isAdding={true} />} />
            <Route path="students/import" element={<StudentImport />} />

            {/* Notifications */}
            <Route path="alerts" element={<AlertsPage />} />

            {/* Borrowing Hub */}
            <Route path="borrow" element={<Outlet />}>
                <Route index element={<ActiveLoans />} />
                <Route path="active-loans" element={<ActiveLoans />} />
                <Route path="issue" element={<IssueBook />} />
                <Route path="return" element={<ReturnBook />} />
                <Route path="reading-log" element={<ReadingLog />} />
            </Route>

            {/* Acquisitions & Feedback */}
            <Route path="acquisition" element={<Outlet />}>
                <Route index element={<AcquisitionPage />} />
                <Route path="requests" element={<FeedbackReviewPage />} />
                <Route path="vendors" element={<VendorManagement />} />
            </Route>

            {/* Reporting */}
            <Route path="reports" element={<ReportHub />} />
            <Route path="reports/detail/:reportKey" element={<ReportDetailPage />} />

          </Route>

          {/* ======================================================================= */}
          {/* === 2. STUDENT PROTECTED ROUTES (Self-Service) === */}
          {/* ======================================================================= */}
          <Route
            path="/student"
            element={<PrivateRoute allowedRoles={['STUDENT']}><StudentLayout /></PrivateRoute>}
          >
            {/* Dashboard */}
            <Route path="dashboard" element={<StudentDashboard />} />

            {/* Book Browsing */}
            <Route path="books" element={<BookList viewMode="student" />} />
            <Route path="books/:bookId" element={<BookDetail viewMode="student" />} />
            <Route path="shelf/location" element={<ShelfMapPage />} />
            <Route path="shelf/location/:bookId" element={<ShelfMapPage />} />

            {/* Reservations */}
            <Route path="reservations" element={<ReservationPage />} />
            <Route path="find-book" element={<ShelfMapPage />} />

            {/* Feedback */}
            <Route path="request-book" element={<FeedbackSubmitPage />} />

            {/* Notifications */}
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="reading-log" element={<ReadingLog />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* 🚀 GLOBAL AI CHAT WIDGET
            It renders OUTSIDE of <Routes> but INSIDE <Router>.
            Logic: Only show if the user is logged in.
        */}
        {isAuthenticated && <AIChatWidget />}
      </div>
    </Router>
  );
};

export default AppRoutes;