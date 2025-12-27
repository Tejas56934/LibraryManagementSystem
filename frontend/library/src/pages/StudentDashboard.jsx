import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Loader from '../components/Loader';
import {
    FaBookOpen,
    FaExclamationCircle,
    FaHourglassHalf,
    FaSearch,
    FaMapMarkedAlt,
    FaHistory,
    FaWallet,
    FaBell,
    FaArrowRight,
    FaCheckCircle
} from 'react-icons/fa';

// --- STYLED COMPONENTS & ANIMATIONS ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: #f1f5f9;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  animation: ${fadeIn} 0.5s ease-out;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);

  .welcome-text {
    h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 800;
      color: #1e293b;
      background: -webkit-linear-gradient(45deg, #1e293b, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { margin: 5px 0 0; color: #64748b; font-size: 0.95rem; }
  }

  .id-badge {
    background: #eff6ff;
    color: #2563eb;
    padding: 8px 16px;
    border-radius: 99px;
    font-weight: 600;
    font-size: 0.9rem;
    border: 1px solid #dbeafe;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border-left: 5px solid ${props => props.$color};
  transition: transform 0.2s;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .icon-bg {
    position: absolute;
    right: -10px;
    bottom: -10px;
    font-size: 5rem;
    opacity: 0.05;
    color: ${props => props.$color};
    transform: rotate(-15deg);
  }

  h3 { font-size: 0.9rem; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
  .value { font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; }
  .sub-text { font-size: 0.85rem; color: ${props => props.$alert ? '#ef4444' : '#64748b'}; margin-top: 8px; display: flex; align-items: center; gap: 5px; font-weight: 500; }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const ActionCard = styled.div`
  background: ${props => props.$bg};
  color: white;
  padding: 2rem;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);

    .arrow-icon { transform: translateX(5px); }
  }

  .content { position: relative; z-index: 2; }
  h4 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
  p { font-size: 0.95rem; opacity: 0.9; line-height: 1.5; margin-bottom: 1.5rem; }

  .icon-overlay {
    position: absolute;
    right: -20px;
    top: -20px;
    font-size: 8rem;
    opacity: 0.2;
    transform: rotate(10deg);
  }

  .cta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 0.9rem;
    background: rgba(255,255,255,0.2);
    width: fit-content;
    padding: 8px 16px;
    border-radius: 8px;
    backdrop-filter: blur(5px);
  }
`;

const NotificationPanel = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  .panel-header {
    background: #f8fafc;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600;
    color: #475569;
  }

  .panel-body { padding: 1.5rem; }
`;

const AlertBox = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 1rem;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  color: #991b1b;
  margin-bottom: 1rem;

  &:last-child { margin-bottom: 0; }
`;

// --- COMPONENT LOGIC ---

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user: loggedInUser } = useSelector(state => state.auth);

    // Dynamic Greeting Logic
    const [greeting, setGreeting] = useState('Welcome');
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // --- Placeholder Data (Replace with API data later) ---
    const summaryData = {
        activeLoans: 2,
        overdueBooks: 1, // Set to 1 to demonstrate the Alert UI
        pendingReservations: 3,
        nextDueDate: '2026-01-15',
        fines: 0.00
    };

    const studentName = loggedInUser?.name || 'Student';
    const isLoading = false;

    if (isLoading) return <Loader />;

    return (
        <DashboardContainer>
            {/* 1. Header Section */}
            <HeaderSection>
                <div className="welcome-text">
                    <h1>{greeting}, {studentName.split(' ')[0]}!</h1>
                    <p>Here is what's happening with your library account today.</p>
                </div>
                <div className="id-badge">
                    ID: {loggedInUser?.studentId || 'ST-0000'}
                </div>
            </HeaderSection>

            {/* 2. Key Metrics (Stats Grid) */}
            <SectionTitle><FaBookOpen /> Your Activity</SectionTitle>
            <StatsGrid>
                <StatCard $color="#3b82f6">
                    <FaBookOpen className="icon-bg" />
                    <h3>Active Loans</h3>
                    <div className="value">{summaryData.activeLoans}</div>
                    <div className="sub-text">Next Due: {summaryData.nextDueDate}</div>
                </StatCard>

                <StatCard $color="#ef4444" $alert={summaryData.overdueBooks > 0}>
                    <FaExclamationCircle className="icon-bg" />
                    <h3>Overdue</h3>
                    <div className="value" style={{ color: summaryData.overdueBooks > 0 ? '#ef4444' : '#0f172a' }}>
                        {summaryData.overdueBooks}
                    </div>
                    <div className="sub-text">
                        {summaryData.overdueBooks > 0 ? 'Action Required Immediately' : 'You are all clear!'}
                    </div>
                </StatCard>

                <StatCard $color="#f59e0b">
                    <FaHourglassHalf className="icon-bg" />
                    <h3>Active Holds</h3>
                    <div className="value">{summaryData.pendingReservations}</div>
                    <div className="sub-text">Waiting for pickup</div>
                </StatCard>

                <StatCard $color="#64748b">
                    <FaWallet className="icon-bg" />
                    <h3>Total Fines</h3>
                    <div className="value">${summaryData.fines.toFixed(2)}</div>
                    <div className="sub-text">Outstanding balance</div>
                </StatCard>
            </StatsGrid>

            {/* 3. Quick Actions (Hero Cards) */}
            <SectionTitle>🚀 Quick Actions</SectionTitle>
            <ActionsGrid>
                <ActionCard
                    $bg="linear-gradient(135deg, #059669 0%, #10b981 100%)"
                    onClick={() => navigate('/student/books')}
                >
                    <FaSearch className="icon-overlay" />
                    <div className="content">
                        <h4>Browse Catalog</h4>
                        <p>Search thousands of titles, check availability, and reserve books instantly.</p>
                        <div className="cta">Search Now <FaArrowRight className="arrow-icon"/></div>
                    </div>
                </ActionCard>

                <ActionCard
                    $bg="linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                    onClick={() => navigate('/student/find-book')}
                >
                    <FaMapMarkedAlt className="icon-overlay" />
                    <div className="content">
                        <h4>Locate on Map</h4>
                        <p>Lost? Use our interactive digital map to find the exact shelf location.</p>
                        <div className="cta">Open Map <FaArrowRight className="arrow-icon"/></div>
                    </div>
                </ActionCard>

                <ActionCard
                    $bg="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"
                    onClick={() => navigate('/student/reservations')}
                >
                    <FaHistory className="icon-overlay" />
                    <div className="content">
                        <h4>My History</h4>
                        <p>View your reading log, check status of your holds, and renew loans.</p>
                        <div className="cta">View Activity <FaArrowRight className="arrow-icon"/></div>
                    </div>
                </ActionCard>
            </ActionsGrid>

            {/* 4. Notifications Panel */}
            <NotificationPanel>
                <div className="panel-header">
                    <FaBell style={{ marginRight: '8px' }} /> Recent Notifications
                </div>
                <div className="panel-body">
                    {summaryData.overdueBooks > 0 ? (
                        <AlertBox>
                            <FaExclamationCircle size={24} />
                            <div>
                                <strong>Overdue Item Alert</strong><br/>
                                You have {summaryData.overdueBooks} book(s) that are past the return date. Please return them to avoid further fines.
                            </div>
                        </AlertBox>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>
                            <FaCheckCircle size={30} style={{ marginBottom: '10px', opacity: 0.5 }} />
                            <p>You're all caught up! No new alerts.</p>
                        </div>
                    )}

                    {/* Example of a standard notification */}
                    <div style={{ display: 'flex', gap: '15px', padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '10px', borderRadius: '50%', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaMapMarkedAlt />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', color: '#334155' }}>New Feature: Shelf Map</div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>You can now locate books physically using the new "Locate on Map" button.</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Today at 9:00 AM</div>
                        </div>
                    </div>
                </div>
            </NotificationPanel>
        </DashboardContainer>
    );
};

export default StudentDashboard;