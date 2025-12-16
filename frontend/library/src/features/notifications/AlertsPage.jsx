import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import notificationApi from '../../api/notificationApi';
import Button from '../../components/Button';
import { FaExclamationTriangle, FaCheckCircle, FaBook, FaCalendarTimes, FaUserGraduate, FaBell } from 'react-icons/fa';

const AlertsContainer = styled.div`
    padding: var(--spacing-lg);
`;

const AlertCard = styled.div`
    background-color: var(--color-card);
    border-left: 5px solid ${(props) => props.$color || 'var(--color-primary)'};
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const AlertContent = styled.div`
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
`;

const IconWrapper = styled.div`
    font-size: 1.5rem;
    color: ${(props) => props.$color || 'var(--color-primary)'};
`;

const getAlertDetails = (type) => {
    switch (type) {
        case 'OVERDUE':
            return { color: 'var(--color-danger)', icon: FaCalendarTimes };
        case 'LOW_STOCK':
            return { color: '#ffc107', icon: FaBook };
        case 'RESERVATION_READY':
            return { color: 'var(--color-accent)', icon: FaUserGraduate };
        default:
            return { color: 'var(--color-secondary)', icon: FaExclamationTriangle };
    }
};

const AlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const data = await notificationApi.getUnreadAlerts();
            setAlerts(data);
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleMarkRead = async (alertId) => {
        try {
            await notificationApi.markAlertRead(alertId);
            // Optimistically update the UI
            setAlerts(alerts.filter(alert => alert.id !== alertId));
        } catch (error) {
            console.error("Failed to mark alert as read:", error);
        }
    };

    if (loading) return <h2>Loading Alerts...</h2>;

    return (
        <AlertsContainer>
            <h2><FaBell style={{ marginRight: '10px' }} /> Unread System Notifications</h2>
            <p>You have {alerts.length} urgent item(s) requiring attention.</p>

            {alerts.length === 0 ? (
                <p style={{ marginTop: '20px', color: 'var(--color-accent)' }}>🎉 No unread alerts at this time. Everything looks good!</p>
            ) : (
                alerts.map((alert) => {
                    const details = getAlertDetails(alert.type);
                    return (
                        <AlertCard key={alert.id} $color={details.color}>
                            <AlertContent>
                                <IconWrapper $color={details.color}>
                                    <details.icon />
                                </IconWrapper>
                                <div>
                                    <strong>{alert.type.replace('_', ' ')}:</strong> {alert.message}
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>
                                        — {new Date(alert.timestamp).toLocaleString()} (Related ID: {alert.relatedId || 'N/A'})
                                    </p>
                                </div>
                            </AlertContent>
                            <Button
                                onClick={() => handleMarkRead(alert.id)}
                                style={{ backgroundColor: 'var(--color-accent)', padding: '5px 10px' }}
                            >
                                <FaCheckCircle /> Mark Read
                            </Button>
                        </AlertCard>
                    );
                })
            )}
        </AlertsContainer>
    );
};

export default AlertsPage;