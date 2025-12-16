import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaClipboardList, FaUndoAlt, FaCalendarTimes, FaCheckCircle, FaPlus } from 'react-icons/fa';
import borrowApi from '../../api/borrowApi';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
    padding: var(--spacing-lg);
`;

const HeaderControls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
`;

const LoansTable = styled.table`
    width: 100%;
    background-color: var(--color-card);
    border-collapse: collapse;
    box-shadow: var(--shadow-sm);
    margin-top: var(--spacing-md);
`;

const StatusPill = styled.span`
    padding: 4px 8px;
    border-radius: var(--border-radius);
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    background-color: ${(props) => {
        if (props.$status === 'OVERDUE') return 'var(--color-danger)';
        if (props.$status === 'ISSUED') return 'var(--color-primary)';
        if (props.$status === 'READ_IN_OFFICE') return '#ffc107'; // Yellow/Warning
        return 'var(--color-secondary)';
    }};
`;

const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && dueDate !== undefined;
};

const ActiveLoans = () => {
    const [activeLoans, setActiveLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchLoans = async () => {
        setLoading(true);
        try {
            // CRITICAL: Call the active endpoint we implemented
            const data = await borrowApi.getActiveTransactions();
            setActiveLoans(data);
        } catch (error) {
            console.error("Failed to fetch active loans:", error);
            // On failure (like a 403), set an empty array
            setActiveLoans([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const handleReturn = async (borrowRecordId) => {
        if (window.confirm("Confirm book return? This will update stock and stop alerts.")) {
            try {
                await borrowApi.returnBook(borrowRecordId);
                // toast.success("Book returned successfully.");
                fetchLoans(); // Refresh the list
            } catch (error) {
                // toast.error("Failed to process return.");
                console.error(error);
            }
        }
    };

    if (loading) return <h2>Loading Active Loans...</h2>;

    return (
        <Container>
            <HeaderControls>
                            <h2><FaClipboardList style={{ marginRight: '10px' }} /> Active Transactions</h2>
                            {/* 1. New Issue Button */}
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <Button
                                    onClick={() => navigate('/admin/borrow/issue')} // <-- NAVIGATE to the IssueBook form
                                    style={{ backgroundColor: 'var(--color-primary)' }}
                                >
                                    <FaPlus style={{ marginRight: '5px' }} /> Issue New Book
                                </Button>
                                {/* 2. Refresh Button (Optional, keep for convenience) */}
                                <Button onClick={fetchLoans} style={{ backgroundColor: 'var(--color-secondary)' }}>
                                    Refresh List
                                </Button>
                            </div>
                        </HeaderControls>

            {activeLoans.length === 0 ? (
                <p>No books are currently issued or overdue. The shelves are full!</p>
            ) : (
                <LoansTable>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th>Record ID</th>
                            <th>Student ID</th>
                            <th>Book ID</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeLoans.map((loan) => (
                            <tr key={loan.id}>
                                <td>{loan.id}</td>
                                <td>{loan.studentId}</td>
                                <td>{loan.bookId}</td>
                                <td>{new Date(loan.issueDate).toLocaleDateString()}</td>
                                <td style={{ color: isOverdue(loan.dueDate) ? 'var(--color-danger)' : 'var(--color-text)', fontWeight: isOverdue(loan.dueDate) ? '600' : 'normal' }}>
                                    {new Date(loan.dueDate).toLocaleDateString()}
                                    {isOverdue(loan.dueDate) && <FaCalendarTimes style={{ marginLeft: '5px' }} />}
                                </td>
                                <td>
                                    <StatusPill $status={loan.status}>
                                        {loan.status}
                                    </StatusPill>
                                </td>
                                <td>
                                    {loan.status !== 'READ_IN_OFFICE' ? (
                                        <Button
                                            onClick={() => handleReturn(loan.id)}
                                            style={{ backgroundColor: 'var(--color-accent)', padding: '5px 10px' }}
                                        >
                                            <FaUndoAlt /> Return
                                        </Button>
                                    ) : (
                                        // For in-office reading, they need to use the dedicated log-out button
                                        <Button
                                            onClick={() => alert(`Use Reading Log Out form for Record ID: ${loan.id}`)}
                                            style={{ backgroundColor: 'var(--color-secondary)', padding: '5px 10px' }}
                                        >
                                            <FaCheckCircle /> Log Out
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </LoansTable>
            )}
        </Container>
    );
};

export default ActiveLoans;