// frontend/src/features/borrow/ReservationPage.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getReservations, cancelHold } from './ReservationSlice';
import { format, formatDistanceToNow } from 'date-fns';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Loader from '../../components/Loader';

// --- FIX: Removed INCORRECT Reducer Imports ---
// The following lines were causing compilation errors and confusion:
// import reservationReducer from '../features/borrow/ReservationSlice';
// import feedbackReducer from '../features/feedback/FeedbackSlice';

const ReservationPage = () => {
    const dispatch = useDispatch();

    // Assuming the store key is 'reservation' and Auth slice is 'auth'
    // NOTE: This assumes the 'reservation' slice has been correctly added to store.js
    const { list: reservations, loading, error } = useSelector(state => state.reservation);
    const { user: loggedInUser } = useSelector(state => state.auth);

    // Use the logged-in student's ID (replace with actual field name if different)
    const studentId = loggedInUser?.studentId;
    // If your user object uses 'id' instead of 'studentId', change the line above.
    // Example: const studentId = loggedInUser?.id;

    useEffect(() => {
        if (studentId) {
            // Fetch reservations when the component mounts
            dispatch(getReservations(studentId));
        }
    }, [dispatch, studentId]);

    const handleCancelHold = (reservationId) => {
        if (window.confirm("Are you sure you want to cancel this reservation?")) {
            dispatch(cancelHold(reservationId))
                .unwrap()
                .then(() => {
                    // Success toast (You should implement a notification system here)
                    console.log(`Reservation ${reservationId} cancelled successfully.`);
                })
                .catch(err => {
                    console.error("Cancellation failed:", err);
                    // Error toast
                });
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'WAITING': return { color: '#007bff', fontWeight: 'bold' }; // var(--color-info)
            case 'READY_FOR_PICKUP': return { color: '#28a745', fontWeight: 'bold' }; // var(--color-success)
            case 'EXPIRED':
            case 'CANCELLED': return { color: '#dc3545' }; // var(--color-danger)
            default: return {};
        }
    };

    const reservationColumns = [
        // NOTE: Book details (Title/Author) will require additional state/API logic to look up
        // the book details using reservation.bookId if the backend doesn't join the data.
        { header: 'Book ID', accessor: 'bookId' },
        { header: 'Date Placed', render: (res) => format(new Date(res.reservationDate), 'MMM dd, yyyy') },
        { header: 'Queue Position', accessor: 'queuePosition', render: (res) => (
            <span style={getStatusStyle(res.status)}>
                {res.status === 'READY_FOR_PICKUP' ? 'READY! (Pickup Due)' : `${res.queuePosition} in line`}
            </span>
        )},
        {
            header: 'Time Left',
            render: (res) => (
                res.status === 'READY_FOR_PICKUP' && res.expiryDate
                    ? `Expires ${formatDistanceToNow(new Date(res.expiryDate), { addSuffix: true })}`
                    : 'N/A'
            )
        },
        { header: 'Status', render: (res) => (
            <span style={getStatusStyle(res.status)}>{res.status}</span>
        )},
        {
            header: 'Action',
            render: (res) => (
                (res.status === 'WAITING' || res.status === 'READY_FOR_PICKUP') ? (
                    <Button
                        variant="danger" // Assuming this variant exists in your Button component
                        size="sm"
                        onClick={() => handleCancelHold(res.id)}
                        disabled={loading === 'pending'}
                    >
                        Cancel Hold
                    </Button>
                ) : (
                    <span>—</span>
                )
            )
        },
    ];

    if (loading === 'pending' && reservations.length === 0) {
        return <Loader />;
    }

    if (error) {
        return <div className="text-danger">Error loading reservations: {error.message || 'An error occurred'}</div>;
    }

    return (
        <div className="reservation-page">
            <h2 className="mb-4">⏳ My Book Reservations (Holds)</h2>
            <Card title="Active Holds">
                {reservations.length === 0 && loading === 'succeeded' ? (
                    <p>You currently have no active reservations. Browse the library to place a hold!</p>
                ) : (
                    <Table columns={reservationColumns} data={reservations} />
                )}
            </Card>

            <div className="mt-4">
                {/* Button to navigate to the book browsing section */}
                <Button variant="info" onClick={() => console.log('Navigate to Book List: /student/books')}>
                    Browse Books to Place a Hold
                </Button>
            </div>
        </div>
    );
};

export default ReservationPage;