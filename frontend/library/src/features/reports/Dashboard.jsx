import React, { useEffect, useState, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaBookOpen, FaUserGraduate, FaExchangeAlt, FaClock, FaCalendarTimes, FaTags, FaChartLine, FaRobot, FaSearch, FaArrowRight } from 'react-icons/fa';
import Card from '../../components/Card';
import reportApi from '../../api/reportApi';
import Button from '../../components/Button';
import aiReportApi from '../../api/aiReportApi'; // <--- NEW IMPORT for the AI section

// --- ANIMATIONS ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

// --- STYLED COMPONENTS ---

const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: #f8fafc; /* Slate-50 */
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  animation: ${fadeIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
`;

const DashboardHeader = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 6px solid #6366f1; /* Indigo-500 */

  h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.025em;
  }

  p {
    margin: 0.5rem 0 0 0;
    color: #64748b;
    font-size: 0.95rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const KeyMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

// Note: Ensure your Card component handles 'color' prop correctly,
// or wrap it in a styled div if needed. Assuming Card works as is.

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: #0f172a;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #6366f1;
  }
`;

const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
  }

  h4 {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
    color: #334155;
    font-weight: 700;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f1f5f9;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px; /* Row spacing */

  thead th {
    text-align: left;
    padding: 0 1rem 0.5rem 1rem;
    color: #64748b;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  tbody tr {
    transition: transform 0.2s;
  }
`;

const DataRow = styled.tr`
  background: #f8fafc;

  td {
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;

    &:first-child {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
      border-right: none;
    }
    &:last-child {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      border-left: none;
    }
  }

  &:hover td {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

const BarContainer = styled.div`
  background: #e2e8f0;
  height: 8px;
  border-radius: 99px;
  width: 100%;
  margin-top: 8px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
  border-radius: 99px;
  position: relative;

  /* Shimmer effect on bar */
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0; right: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
    background-size: 200% 100%;
    animation: ${shimmer} 2s infinite linear;
  }
`;

// --- AI SECTION STYLING ---

const AICard = styled.div`
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); /* Deep Indigo */
  border-radius: 24px;
  padding: 2.5rem;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(49, 46, 129, 0.4);

  /* Decorative circle */
  &::before {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 200px; height: 200px;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
  }
`;

const AIHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 2;

  svg {
    font-size: 2rem;
    color: #818cf8; /* Indigo-400 */
    filter: drop-shadow(0 0 8px rgba(129, 140, 248, 0.6));
  }

  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(to right, #ffffff, #c7d2fe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const AIDescription = styled.p`
  color: #c7d2fe; /* Indigo-200 */
  margin-bottom: 2rem;
  font-size: 1rem;
  max-width: 600px;
  position: relative;
  z-index: 2;
`;

const QueryInput = styled.div`
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
  position: relative;
  z-index: 2;

  &:focus-within {
    background: rgba(255, 255, 255, 0.15);
    border-color: #818cf8;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 0.8rem 1rem;
    color: white;
    font-size: 1.1rem;

    &::placeholder {
      color: #818cf8;
    }
    &:focus {
      outline: none;
    }
  }

  button {
    background: #4f46e5;
    color: white;
    border: none;
    padding: 0 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;

    &:hover { background: #4338ca; }
    &:disabled { background: #3730a3; cursor: not-allowed; }
  }
`;

const ReportResult = styled.div`
  margin-top: 2rem;
  background: white;
  color: #1e293b;
  border-radius: 16px;
  padding: 1.5rem;
  animation: ${fadeIn} 0.5s ease-out;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
`;

const SummaryText = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.$color || '#334155'};
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AITableWrapper = styled.div`
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;

    th {
      text-align: left;
      padding: 10px;
      background: #f1f5f9;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 700;
      border-radius: 4px;
    }

    td {
      padding: 12px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
      font-size: 0.95rem;
    }

    tr:last-child td { border-bottom: none; }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-size: 1.5rem;
  color: #6366f1;
  font-weight: 600;
  background: #f8fafc;
`;

// --- AI REPORTING SECTION ---
const AIReportingSection = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const summaryColor = aiReport?.tableData?.[0]?.Status === 'Failed'
    ? '#ef4444' // Red-500
    : '#059669'; // Emerald-600

const handleGenerateReport = useCallback(async () => {
    if (!aiQuery) return;
    setAiLoading(true);
    setAiReport(null);
    try {
      // ✅ UPDATE: Use the new API file here
      const data = await aiReportApi.getAIReport(aiQuery);
      setAiReport(data);
    } catch (error) {
      alert('AI Report generation failed. Check server status.');
    } finally {
      setAiLoading(false);
    }
  }, [aiQuery]);

  return (
    <AICard>
      <AIHeader>
        <FaRobot />
        <h3>AI Analytics & Reporting</h3>
      </AIHeader>
      <AIDescription>
        Use natural language to query the library database. Try asking "Who are the top borrowers?" or "Show books read more than 10 times".
      </AIDescription>

      <QueryInput>
        <FaSearch style={{ color: '#818cf8', marginLeft: '10px' }} />
        <input
          type="text"
          placeholder="Ask the AI a question..."
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleGenerateReport()}
        />
        <button onClick={handleGenerateReport} disabled={aiLoading || !aiQuery}>
          {aiLoading ? 'Thinking...' : 'Generate Report'}
        </button>
      </QueryInput>

      {aiReport && (
        <ReportResult>
          <SummaryText $color={summaryColor}>
            ✨ AI Insight: {aiReport.summary}
          </SummaryText>

          {aiReport.tableData && aiReport.tableData.length > 0 && (
            <AITableWrapper>
              <table>
                <thead>
                  <tr>
                    {aiReport.tableHeaders.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {aiReport.tableData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {aiReport.tableHeaders.map((header) => (
                        <td key={header}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </AITableWrapper>
          )}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', fontSize: '0.8rem', color: '#94a3b8' }}>
            Generated at {aiReport.generatedAt}
          </div>
        </ReportResult>
      )}
    </AICard>
  );
};

// --- MAIN DASHBOARD (Unchanged Logic, New Styling) ---
const Dashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modernized Palette
  const cardColors = {
    totalStudents: '#3b82f6',     // Blue-500
    totalBooksInStock: '#10b981', // Emerald-500
    totalAvailableBooks: '#06b6d4', // Cyan-500
    totalBooksIssued: '#8b5cf6',  // Violet-500
    totalBooksOverdue: '#ef4444', // Red-500
    totalPendingReservations: '#f59e0b', // Amber-500
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await reportApi.getBasicReport();
        setReportData(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const getTopN = (map, n) => {
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n);
  };

  const formatTopReadBooks = () => {
    if (!reportData || !reportData.booksReadCount) return [];
    return getTopN(reportData.booksReadCount, 5).map(([bookId, count]) => ({ id: bookId, count }));
  };

  const formatTopActiveStudents = () => {
    if (!reportData || !reportData.studentBorrowCount) return [];
    return getTopN(reportData.studentBorrowCount, 5).map(([studentId, count]) => ({ id: studentId, count }));
  };

  if (loading) {
    return <LoadingSpinner>⏳ Loading Library Analytics...</LoadingSpinner>;
  }

  if (!reportData) {
    return <LoadingSpinner>⚠️ System Offline or Connection Failed.</LoadingSpinner>;
  }

  const topStudents = formatTopActiveStudents();
  const maxBorrowCount = topStudents.length > 0 ? topStudents[0].count : 1;

  return (
    <DashboardContainer>
      <DashboardHeader>
        <div>
          <h2>Librarian Dashboard</h2>
          <p>
            <FaClock />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px 16px', borderRadius: '8px', fontWeight: '600' }}>
          Admin View
        </div>
      </DashboardHeader>

      <KeyMetricsGrid>
        <Card title="Students Registered" value={reportData.totalStudents} color={cardColors.totalStudents} icon={FaUserGraduate} />
        <Card title="Total Inventory" value={reportData.totalBooksInStock} color={cardColors.totalBooksInStock} icon={FaBookOpen} />
        <Card title="Available on Shelf" value={reportData.totalAvailableBooks} color={cardColors.totalAvailableBooks} icon={FaTags} />
        <Card title="Currently Issued" value={reportData.totalBooksIssued} color={cardColors.totalBooksIssued} icon={FaExchangeAlt} />
        <Card title="Overdue Returns" value={reportData.totalBooksOverdue} color={cardColors.totalBooksOverdue} icon={FaCalendarTimes} />
        <Card title="Hold Requests" value={reportData.totalPendingReservations} color={cardColors.totalPendingReservations} icon={FaClock} />
      </KeyMetricsGrid>

      <SectionTitle>
        <FaChartLine /> Performance Overview
      </SectionTitle>

      <ActivityGrid>
        <TableContainer>
          <h4>📚 Most Popular Books</h4>
          <StyledTable>
            <tbody>
              {formatTopReadBooks().map((item, index) => (
                <DataRow key={index}>
                  <td style={{ fontWeight: '700', color: '#475569', width: '80%' }}>
                     {item.id}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: '#3b82f6' }}>
                    {item.count} <span style={{fontSize: '0.8em', color: '#94a3b8', fontWeight: '400'}}>reads</span>
                  </td>
                </DataRow>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>

        <TableContainer>
          <h4>🎓 Top Readers</h4>
          <StyledTable>
            <tbody>
              {topStudents.map((item, index) => (
                <DataRow key={index}>
                  <td style={{ width: '35%', fontWeight: '600', color: '#334155' }}>
                    {item.id}
                  </td>
                  <td style={{ width: '65%', borderLeft: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.count} Books</span>
                    </div>
                    <BarContainer>
                      <ProgressBar $percentage={(item.count / maxBorrowCount) * 100} />
                    </BarContainer>
                  </td>
                </DataRow>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>
      </ActivityGrid>

      <AIReportingSection />
    </DashboardContainer>
  );
};

export default Dashboard;