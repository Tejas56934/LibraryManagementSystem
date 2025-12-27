// frontend/src/features/borrow/ReservationPage.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { getReservations, cancelHold } from './ReservationSlice';
import { format, formatDistanceToNow } from 'date-fns';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Loader from '../../components/Loader';

const ReservationPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize navigation

    const { list: reservations, loading, error } = useSelector(state => state.reservation);
    const { user: loggedInUser } = useSelector(state => state.auth);

    // Get Student ID (Handle both 'id' and 'studentId' formats)
    const studentId = loggedInUser?.studentId || loggedInUser?.id;

    useEffect(() => {
        if (studentId) {
            dispatch(getReservations(studentId));
        }
    }, [dispatch, studentId]);

    const handleCancelHold = (reservationId) => {
        if (window.confirm("Are you sure you want to cancel this reservation?")) {
            dispatch(cancelHold(reservationId))
                .unwrap()
                .then(() => {
                    alert("Reservation cancelled successfully.");
                    // Optional: Refresh list
                    dispatch(getReservations(studentId));
                })
                .catch(err => {
                    console.error("Cancellation failed:", err);
                    alert("Failed to cancel reservation.");
                });
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'WAITING': return { color: '#007bff', fontWeight: 'bold' };
            case 'READY_FOR_PICKUP': return { color: '#28a745', fontWeight: 'bold' };
            case 'EXPIRED':
            case 'CANCELLED': return { color: '#dc3545' };
            default: return {};
        }
    };

    const reservationColumns = [
        { header: 'Book ID', accessor: 'bookId' },
        { header: 'Date Placed', render: (res) => format(new Date(res.reservationDate), 'MMM dd, yyyy') },
        { header: 'Queue Position', render: (res) => (
            <span style={getStatusStyle(res.status)}>
                {res.status === 'READY_FOR_PICKUP' ? 'READY! (Pickup Due)' :
                 res.status === 'CANCELLED' ? '-' :
                 `${res.queuePosition} in line`}
            </span>
        )},
        { header: 'Status', render: (res) => (
            <span style={getStatusStyle(res.status)}>{res.status}</span>
        )},
        {
            header: 'Action',
            render: (res) => (
                (res.status === 'WAITING' || res.status === 'READY_FOR_PICKUP') ? (
                    <Button
                        variant="danger" // Ensure your Button component accepts variant="danger" or style={{backgroundColor: 'red'}}
                        onClick={() => handleCancelHold(res.id)}
                        disabled={loading === 'pending'}
                    >
                        Cancel Hold
                    </Button>
                ) : (
                    <span className="text-muted">Closed</span>
                )
            )
        },
    ];

    if (loading === 'pending' && reservations.length === 0) return <Loader />;
    if (error) return <div className="text-danger">Error: {error.message || 'Failed to load'}</div>;

    return (
        <div className="reservation-page" style={{ padding: '20px' }}>
            <h2 className="mb-4">⏳ My Book Reservations</h2>

            <Card title="Active Holds">
                {reservations.length === 0 ? (
                    <div className="text-center p-4">
                        <p>You currently have no active reservations.</p>
                    </div>
                ) : (
                    <Table columns={reservationColumns} data={reservations} />
                )}
            </Card>

            <div className="mt-4">
                <Button
                    variant="primary"
                    onClick={() => navigate('/student/books')} // - Navigates to book list
                    style={{ marginTop: '20px' }}
                >
                    Browse Books to Place a Hold
                </Button>
            </div>
        </div>
    );
};

export default ReservationPage;