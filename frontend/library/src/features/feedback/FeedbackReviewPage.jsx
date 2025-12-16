// frontend/src/features/feedback/FeedbackReviewPage.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAcquisitionRequests, changeRequestStatus } from './FeedbackSlice';
import { format } from 'date-fns';
// Assuming default imports for components:
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Loader from '../../components/Loader';

// Define status options based on the backend enum (for dropdown)
const RequestStatusOptions = [
    'NEW', 'IN_REVIEW', 'APPROVED_FOR_PURCHASE', 'DENIED'
];

const FeedbackReviewPage = () => {
    const dispatch = useDispatch();
    const { requests, loading, error } = useSelector(state => state.feedback);

    useEffect(() => {
        // Fetch requests when the component mounts
        dispatch(getAcquisitionRequests());
    }, [dispatch]);

    /**
     * Handles changing the status of a request via a dropdown.
     */
    const handleStatusChange = (requestId, newStatus) => {
        if (!newStatus || newStatus === 'NEW') return;

        if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            dispatch(changeRequestStatus({ requestId, newStatus }))
                .unwrap()
                .then(() => {
                    // Success toast: Request status updated
                })
                .catch(err => {
                    console.error("Failed to update status:", err);
                    // Error toast
                });
        }
    };

    const requestColumns = [
        { header: 'ID', accessor: 'id', render: (req) => req.id.substring(0, 8) },
        { header: 'Title Requested', accessor: 'requestedBookTitle' },
        { header: 'Author', accessor: 'requestedBookAuthor' },
        { header: 'Submitted By', accessor: 'submitterId' },
        { header: 'Date', render: (req) => format(new Date(req.submissionDate), 'dd-MM-yyyy') },
        {
            header: 'Current Status',
            render: (req) => (
                <span className={`status-${req.status.toLowerCase()}`}>{req.status}</span> // Use class for styling
            )
        },
        {
            header: 'Action',
            render: (req) => (
                <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    disabled={loading === 'pending'}
                >
                    {RequestStatusOptions.map(status => (
                        <option key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                        </option>
                    ))}
                </select>
            )
        },
    ];

    if (loading === 'pending' && requests.length === 0) {
        return <Loader />;
    }

    if (error) {
        return <div className="text-danger">Error loading requests: {error.message || 'An error occurred'}</div>;
    }

    return (
        <div className="feedback-review-page">
            <h2 className="mb-4">📢 Acquisition Requests Review</h2>
            <Card title="Student Book Requests">
                <p className="mb-3">Review requests submitted by students for books not currently in the library. Use the dropdown to **Approve for Purchase** (feeding into the Acquisitions module) or **Deny** the request.</p>
                <Table columns={requestColumns} data={requests} />
            </Card>
        </div>
    );
};

export default FeedbackReviewPage;