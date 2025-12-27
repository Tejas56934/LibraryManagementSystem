import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardAI = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <h3>✨ AI Assistant</h3>
                <span style={styles.badge}>New</span>
            </div>
            <p style={styles.text}>
                Your AI agent is ready to analyze data. What would you like to know?
            </p>

            <div style={styles.buttonGrid}>
                <button style={styles.btn} onClick={() => navigate('/admin/analytics')}>
                    💰 Check Fines
                </button>
                <button style={styles.btn} onClick={() => navigate('/admin/analytics')}>
                    📦 Low Stock
                </button>
                <button style={styles.btn} onClick={() => navigate('/admin/analytics')}>
                    🧹 Clean Data
                </button>
            </div>
        </div>
    );
};

const styles = {
    card: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '15px',
        padding: '20px',
        marginTop: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    badge: {
        background: '#ff4b2b',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    text: {
        fontSize: '14px',
        marginBottom: '15px',
        opacity: 0.9
    },
    buttonGrid: {
        display: 'flex',
        gap: '10px'
    },
    btn: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '13px',
        transition: '0.3s'
    }
};

export default DashboardAI;