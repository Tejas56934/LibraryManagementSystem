import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaWallet, FaBook, FaHistory } from 'react-icons/fa';

// --- Styled Components (CSS) ---
const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Title = styled.h1`
  color: #1e293b;
  margin-bottom: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

// This matches the syntax you shared ($color prop)
const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-left: 5px solid ${props => props.$color || "#3b82f6"};
  position: relative;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }

  h3 {
    margin: 0;
    font-size: 0.9rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0.5rem 0;
  }

  .icon-bg {
    position: absolute;
    right: 1.5rem;
    top: 1.5rem;
    font-size: 2.5rem;
    opacity: 0.1;
    color: ${props => props.$color || "#3b82f6"};
  }

  .sub-text {
    font-size: 0.85rem;
    color: ${props => props.$color || "#64748b"};
    font-weight: 600;
    margin-top: 0.5rem;
  }
`;

// --- Main Component ---
const UserDashboard = () => {
  // Mock Data (Replace this with API call later)
  const [summaryData, setSummaryData] = useState({
    booksIssued: 3,
    fines: 15.00, // <--- This is the data used in your snippet
    totalHistory: 12
  });

  // Handle the Payment Click
  const handlePayment = (amount) => {
    if (amount <= 0) {
      alert("No fines to pay! Great job.");
      return;
    }
    // Logic to open Payment Modal or redirect to Payment Gateway
    alert(`Initiating Payment Gateway for $${amount.toFixed(2)}...`);
  };

  return (
    <DashboardContainer>
      <Title>Member Dashboard</Title>

      <Grid>
        {/* Card 1: Books Issued */}
        <StatCard $color="#3b82f6">
          <FaBook className="icon-bg" />
          <h3>Books Issued</h3>
          <div className="value">{summaryData.booksIssued}</div>
          <div className="sub-text">Currently borrowed</div>
        </StatCard>

        {/* Card 2: YOUR FINE CARD (The snippet you asked about) */}
        <StatCard
            $color="#ef4444"
            style={{ cursor: 'pointer' }}
            onClick={() => handlePayment(summaryData.fines)}
        >
            <FaWallet className="icon-bg" />
            <h3>Fines Due</h3>
            <div className="value">${summaryData.fines.toFixed(2)}</div>
            <div className="sub-text">Tap to Pay Now ➡</div>
        </StatCard>

        {/* Card 3: History */}
        <StatCard $color="#10b981">
          <FaHistory className="icon-bg" />
          <h3>Reading History</h3>
          <div className="value">{summaryData.totalHistory}</div>
          <div className="sub-text">Total books read</div>
        </StatCard>
      </Grid>

    </DashboardContainer>
  );
};

export default UserDashboard;