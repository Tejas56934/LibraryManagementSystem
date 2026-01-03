import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// ✅ CORRECT IMPORT: Default import for the library, Object destructuring later
import {useRazorpay} from "react-razorpay";

import styled, { keyframes, css } from 'styled-components';
import Loader from '../components/Loader';
import StudentIDCard from '../components/StudentIDCard';
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
    FaCheckCircle,
    FaQrcode
} from 'react-icons/fa';

// --- STYLED COMPONENTS ---

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
  margin-bottom: 2rem;
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
    @media (max-width: 1024px) { display: block; }
    display: none;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column-reverse;
  }
`;

const MainContent = styled.div`
  flex: 1;
  width: 100%;
`;

const Sidebar = styled.div`
  min-width: 350px;
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 1024px) {
    width: 100%;
    position: static;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border-left: 5px solid ${props => props.$color};
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  /* Interactive Styling for Clickable Cards */
  ${props => props.$isClickable && css`
    cursor: pointer;
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      background-color: #f8fafc;
    }
    &:active {
      transform: scale(0.98);
    }
  `}

  .icon-bg {
    position: absolute;
    right: -10px;
    bottom: -10px;
    font-size: 5rem;
    opacity: 0.05;
    color: ${props => props.$color};
    transform: rotate(-15deg);
  }

  h3 { font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 700; }
  .value { font-size: 2rem; font-weight: 800; color: #0f172a; line-height: 1; }
  .sub-text { font-size: 0.8rem; color: ${props => props.$alert ? '#ef4444' : '#64748b'}; margin-top: 8px; display: flex; align-items: center; gap: 5px; font-weight: 500; }

  .pay-badge {
    background: #ef4444;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    margin-left: 8px;
    vertical-align: middle;
  }
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const ActionCard = styled.div`
  background: ${props => props.$bg};
  color: white;
  padding: 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 180px;
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
  h4 { font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem; }
  p { font-size: 0.9rem; opacity: 0.9; line-height: 1.5; margin-bottom: 1rem; }

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
    font-size: 0.85rem;
    background: rgba(255,255,255,0.2);
    width: fit-content;
    padding: 6px 12px;
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
`;

const InfoCard = styled.div`
  background: #e0e7ff;
  border-radius: 16px;
  padding: 1.5rem;
  color: #3730a3;
  h4 { margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 8px; }
  p { margin: 0; font-size: 0.9rem; line-height: 1.5; }
`;

// --- MAIN COMPONENT ---

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user: loggedInUser } = useSelector(state => state.auth);

    // 1. Hook for Razorpay (Object Destructuring)
    const { Razorpay, isLoaded } = useRazorpay();

    // 2. Local state to FORCE the button to be ready if the script is found
    const [isPaymentReady, setIsPaymentReady] = useState(false);

    // 3. Effect to detect when Razorpay is actually ready (Solves the gray button issue)
    useEffect(() => {
        if (isLoaded || (window && window.Razorpay)) {
            setIsPaymentReady(true);
            console.log("✅ Payment System Ready");
        }
    }, [isLoaded]);

    // --- MOCK DATA ---
    const summaryData = {
        activeLoans: 2,
        overdueBooks: 1,
        pendingReservations: 3,
        nextDueDate: '2026-01-15',
        fines: 15.00
    };

    // --- PAYMENT HANDLER ---
    const handlePayment = async (amount) => {
        if (amount <= 0) return;

        // Double check safety
        if (!isPaymentReady) {
            alert("Payment system is loading, please try again in a second.");
            return;
        }

        try {
            // 1. Backend: Create Order
            const mockOrder = {
                id: "order_" + Math.random().toString(36).substring(7),
                amount: amount * 100,
                currency: "INR"
            };

            // 2. Razorpay Options
            const options = {
                key: "rzp_test_Rx2z8Glx0uB8lW", // Your Test Key
                amount: mockOrder.amount,
                currency: mockOrder.currency,
                name: "Library LMS",
                description: "Fine Payment",
//                 order_id: mockOrder.id,
                handler: function (response) {
                    console.log("Payment Success:", response);
                    alert(`✅ Payment Successful!\nID: ${response.razorpay_payment_id}`);
                },
                prefill: {
                    name: loggedInUser?.name || "Student",
                    email: loggedInUser?.email || "student@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#3b82f6",
                },
            };

            // 3. Open Gateway
            const rzp1 = new Razorpay(options);
            rzp1.on("payment.failed", function (response) {
                alert(`❌ Payment Failed: ${response.error.description}`);
            });
            rzp1.open();

        } catch (error) {
            console.error("Payment Error:", error);
            alert("Unable to initiate payment.");
        }
    };

    // Dynamic Greeting
    const [greeting, setGreeting] = useState('Welcome');
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    const studentName = loggedInUser?.name || 'Student';

    return (
        <DashboardContainer>
            {/* Header */}
            <HeaderSection>
                <div className="welcome-text">
                    <h1>{greeting}, {studentName.split(' ')[0]}!</h1>
                    <p>Welcome to your digital library space.</p>
                </div>
                <div className="id-badge">ID: {loggedInUser?.studentId || 'ST-0000'}</div>
            </HeaderSection>

            {/* Main Layout */}
            <ContentWrapper>

                {/* LEFT COLUMN */}
                <MainContent>
                    <SectionTitle><FaBookOpen /> Your Activity</SectionTitle>
                    <StatsGrid>

                        {/* 1. Active Loans */}
                        <StatCard $color="#3b82f6">
                            <FaBookOpen className="icon-bg" />
                            <h3>Active Loans</h3>
                            <div className="value">{summaryData.activeLoans}</div>
                            <div className="sub-text">Next Due: {summaryData.nextDueDate}</div>
                        </StatCard>

                        {/* 2. Overdue Books */}
                        <StatCard $color="#ef4444" $alert={summaryData.overdueBooks > 0}>
                            <FaExclamationCircle className="icon-bg" />
                            <h3>Overdue</h3>
                            <div className="value" style={{ color: summaryData.overdueBooks > 0 ? '#ef4444' : '#0f172a' }}>
                                {summaryData.overdueBooks}
                            </div>
                            <div className="sub-text">
                                {summaryData.overdueBooks > 0 ? 'Action Required!' : 'All clear'}
                            </div>
                        </StatCard>

                        {/* 3. Holds */}
                        <StatCard $color="#f59e0b">
                            <FaHourglassHalf className="icon-bg" />
                            <h3>Active Holds</h3>
                            <div className="value">{summaryData.pendingReservations}</div>
                            <div className="sub-text">Ready for pickup</div>
                        </StatCard>

                        {/* 4. FINES (CLICKABLE & INTEGRATED) */}
                        <StatCard
                            $color={summaryData.fines > 0 ? "#ef4444" : "#64748b"}
                            // Uses isPaymentReady to ensure button works
                            $isClickable={summaryData.fines > 0 && isPaymentReady}
                            style={{ opacity: isPaymentReady ? 1 : 0.7 }}
                            onClick={() => {
                                if (!isPaymentReady) return;
                                handlePayment(summaryData.fines);
                            }}
                        >
                            <FaWallet className="icon-bg" />
                            <h3>
                                Fines
                                {summaryData.fines > 0 && (
                                    <span
                                        className="pay-badge"
                                        style={{ backgroundColor: isPaymentReady ? '#ef4444' : '#94a3b8' }}
                                    >
                                        {isPaymentReady ? "PAY NOW" : "LOADING..."}
                                    </span>
                                )}
                            </h3>
                            <div className="value">${summaryData.fines.toFixed(2)}</div>
                            <div className="sub-text">
                                {summaryData.fines > 0
                                    ? (isPaymentReady ? "Click to Pay ➡" : "System initializing...")
                                    : "No Dues Pending"
                                }
                            </div>
                        </StatCard>

                    </StatsGrid>

                    <SectionTitle>🚀 Quick Actions</SectionTitle>
                    <ActionsGrid>
                        <ActionCard $bg="linear-gradient(135deg, #059669 0%, #10b981 100%)" onClick={() => navigate('/student/books')}>
                            <FaSearch className="icon-overlay" />
                            <div className="content">
                                <h4>Browse Catalog</h4>
                                <p>Search titles & reserve books.</p>
                                <div className="cta">Search Now <FaArrowRight className="arrow-icon"/></div>
                            </div>
                        </ActionCard>

                        <ActionCard $bg="linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)" onClick={() => navigate('/student/find-book')}>
                            <FaMapMarkedAlt className="icon-overlay" />
                            <div className="content">
                                <h4>Shelf Map</h4>
                                <p>Locate books physically.</p>
                                <div className="cta">Open Map <FaArrowRight className="arrow-icon"/></div>
                            </div>
                        </ActionCard>

                        <ActionCard $bg="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)" onClick={() => navigate('/student/reservations')}>
                            <FaHistory className="icon-overlay" />
                            <div className="content">
                                <h4>My History</h4>
                                <p>Check logs & renew loans.</p>
                                <div className="cta">View Activity <FaArrowRight className="arrow-icon"/></div>
                            </div>
                        </ActionCard>
                    </ActionsGrid>

                    <NotificationPanel>
                        <div className="panel-header"><FaBell style={{ marginRight: '8px' }} /> Recent Notifications</div>
                        <div className="panel-body">
                            {summaryData.overdueBooks > 0 ? (
                                <AlertBox>
                                    <FaExclamationCircle size={24} />
                                    <div>
                                        <strong>Overdue Item Alert</strong><br/>
                                        You have {summaryData.overdueBooks} book(s) past return date. Return immediately to avoid fines.
                                    </div>
                                </AlertBox>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>
                                    <FaCheckCircle size={30} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                    <p>You're all caught up! No new alerts.</p>
                                </div>
                            )}
                        </div>
                    </NotificationPanel>
                </MainContent>

                {/* RIGHT COLUMN */}
                <Sidebar>
                    <SectionTitle><FaQrcode /> My Digital ID</SectionTitle>
                    <StudentIDCard />
                    <InfoCard>
                        <h4><FaWallet /> Pro Tip</h4>
                        <p>Show this QR code to the librarian to borrow books instantly without carrying a plastic card.</p>
                    </InfoCard>
                </Sidebar>

            </ContentWrapper>
        </DashboardContainer>
    );
};

export default StudentDashboard;