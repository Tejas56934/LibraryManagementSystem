import React from 'react';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux';

const StudentIDCard = () => {
    // Get current user data from Redux
    const { user } = useSelector((state) => state.auth);

    if (!user) return null;

    // We encode the Student ID (or Username) into the QR
    // This is what the scanner will "read"
    const qrValue = user.username || user.id;

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <h3>🎓 Student Digital ID</h3>
            </div>

            <div style={styles.content}>
                {/* The QR Code */}
                <div style={styles.qrContainer}>
                    <QRCode
                        value={qrValue}
                        size={150}
                        fgColor="#2d3748"
                        bgColor="#ffffff"
                    />
                </div>

                {/* Student Details */}
                <div style={styles.details}>
                    <h2 style={styles.name}>{user.username}</h2>
                    <p style={styles.role}>Student Member</p>
                    <p style={styles.id}>ID: {qrValue}</p>
                </div>
            </div>

            <div style={styles.footer}>
                <p>Show this to the Librarian to borrow books.</p>
            </div>
        </div>
    );
};

const styles = {
    card: {
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '350px',
        margin: '0 auto', // Center it
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
    },
    header: {
        background: '#4f46e5',
        color: 'white',
        padding: '15px',
        fontSize: '14px'
    },
    content: {
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
    },
    qrContainer: {
        padding: '10px',
        border: '2px dashed #cbd5e0',
        borderRadius: '10px'
    },
    details: {
        marginTop: '10px'
    },
    name: {
        margin: '0',
        fontSize: '22px',
        color: '#2d3748'
    },
    role: {
        margin: '5px 0',
        color: '#718096',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    id: {
        fontFamily: 'monospace',
        background: '#edf2f7',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '14px'
    },
    footer: {
        background: '#f7fafc',
        padding: '15px',
        fontSize: '12px',
        color: '#718096',
        borderTop: '1px solid #e2e8f0'
    }
};

export default StudentIDCard;