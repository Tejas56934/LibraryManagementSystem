// frontend/src/pages/StudentDashboard.jsx

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import Loader from '../components/Loader';
// Assuming you have slices for borrow, reservation, and notifications
// import { getDashboardSummary } from '../features/reports/ReportSlice';
// import { getReservations } from '../features/borrow/ReservationSlice';

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const { user: loggedInUser } = useSelector(state => state.auth);

    // --- Placeholder Data & State ---
    const studentName = loggedInUser?.name || 'Student User';
    const isLoading = false; // Replace with actual loading state
    const summaryData = {
        activeLoans: 2,
        overdueBooks: 0,
        pendingReservations: 3, // Count from the ReservationSlice
        nextDueDate: '2026-01-15',
    };
    // ----------------------------------

    useEffect(() => {
        // Fetch core summary data here (e.g., from a ReportService endpoint)
        // dispatch(getDashboardSummary(loggedInUser.studentId));
        // dispatch(getReservations(loggedInUser.studentId));
    }, [dispatch, loggedInUser]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="student-dashboard">
            <h2 className="mb-4">👋 Welcome back, {studentName}!</h2>

            <div className="row">
                {/* Active Loans Summary */}
                <div className="col-md-6 col-lg-3 mb-4">
                    <Card title="Active Loans 📚" value={summaryData.activeLoans} icon="FaBook" color="#007bff">
                        <p className="small text-muted">Next Due: {summaryData.nextDueDate}</p>
                    </Card>
                </div>

                {/* Overdue Books Summary */}
                <div className="col-md-6 col-lg-3 mb-4">
                    <Card title="Overdue Books 🚨" value={summaryData.overdueBooks} icon="FaExclamationTriangle" color="#dc3545">
                        <p className="small text-muted">{summaryData.overdueBooks > 0 ? 'Return immediately!' : 'All clear!'}</p>
                    </Card>
                </div>

                {/* Pending Reservations Summary */}
                <div className="col-md-6 col-lg-3 mb-4">
                    <Card title="Pending Holds ⏳" value={summaryData.pendingReservations} icon="FaClock" color="#ffc107">
                        <p className="small text-muted">Waiting for {summaryData.pendingReservations} book(s).</p>
                    </Card>
                </div>

                {/* Quick Link to Browse Books */}
                <div className="col-md-6 col-lg-3 mb-4">
                    <Card title="Find Books" isLink={true} to="/student/books" icon="FaSearch" color="#28a745">
                        <p className="small text-muted">Browse catalog and place holds.</p>
                    </Card>
                </div>
            </div>

            {/* Add sections for reservation alerts (Ready for Pickup) */}
            <div className="row">
                <div className="col-12">
                    <Card title="Recent Activity & Notifications">
                        <p>Latest alerts and reading log entries go here.</p>
                        {/* Placeholder for rendering alerts from the NotificationSlice */}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;