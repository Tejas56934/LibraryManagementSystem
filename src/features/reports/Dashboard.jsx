import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaBookOpen, FaUserGraduate, FaExchangeAlt, FaClock, FaCalendarTimes, FaTags, FaChartLine, FaRobot } from 'react-icons/fa';
import Card from '../../components/Card';
import reportApi from '../../api/reportApi';
import Button from '../../components/Button';

// --- STYLED COMPONENTS ---
const DashboardContainer = styled.div`
  animation: fadeIn 0.5s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(140, 158, 255, 0.1) 0%, rgba(0, 176, 255, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(140, 158, 255, 0.2);

  h2 {
    color: var(--color-text);
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #8c9eff 0%, #00b0ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    color: var(--color-secondary);
    font-weight: 600;
  }
`;

const KeyMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
`;

const SectionTitle = styled.h3`
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, #8c9eff 0%, #00b0ff 100%);
    border-radius: 2px;
  }
`;

const TableContainer = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  padding: var(--spacing-xl);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(140, 158, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #8c9eff 0%, #00b0ff 100%);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(140, 158, 255, 0.15);
  }

  h4 {
    padding-bottom: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    color: var(--color-text);
    font-size: 1.1rem;
    font-weight: 700;
    border-bottom: 2px solid rgba(140, 158, 255, 0.2);
  }
`;

const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
`;

const DataRow = styled.tr`
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(140, 158, 255, 0.1);

  &:hover {
    background: linear-gradient(90deg, rgba(140, 158, 255, 0.05) 0%, transparent 100%);
    transform: translateX(4px);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const BarContainer = styled.div`
  background: linear-gradient(90deg, rgba(140, 158, 255, 0.1) 0%, rgba(140, 158, 255, 0.05) 100%);
  border-radius: 8px;
  margin-top: 8px;
  overflow: hidden;
  height: 10px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${(props) => props.$percentage}%;
  background: linear-gradient(90deg, #8c9eff 0%, #00b0ff 100%);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const AICard = styled(TableContainer)`
  background: linear-gradient(135deg, rgba(0, 176, 255, 0.08) 0%, rgba(140, 158, 255, 0.05) 100%);
  margin-top: var(--spacing-xl);
  border: 1px solid rgba(0, 176, 255, 0.2);

  &::before {
    background: linear-gradient(90deg, #00b0ff 0%, #8c9eff 100%);
  }
`;

const QueryInput = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);

  input {
    flex-grow: 1;
    padding: var(--spacing-md);
    border-radius: 12px;
    border: 2px solid rgba(140, 158, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text);
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px rgba(140, 158, 255, 0.1);
    }

    &::placeholder {
      color: var(--color-secondary);
    }
  }
`;

const AIHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);

  h3 {
    background: linear-gradient(135deg, #00b0ff 0%, #8c9eff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.4rem;
    font-weight: 800;
  }

  svg {
    font-size: 1.5rem;
    color: var(--color-accent);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
`;

const AIDescription = styled.p`
  color: var(--color-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
  font-style: italic;
`;

const ReportResult = styled.div`
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(140, 158, 255, 0.15);
  animation: slideIn 0.5s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SummaryText = styled.p`
  font-weight: bold;
  color: ${props => props.$color || 'var(--color-accent)'};
  margin-bottom: var(--spacing-md);
  font-size: 1.05rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--spacing-md);

  thead tr {
    background: linear-gradient(90deg, rgba(140, 158, 255, 0.15) 0%, rgba(140, 158, 255, 0.05) 100%);
  }

  th {
    padding: var(--spacing-md);
    text-align: left;
    font-weight: 700;
    color: var(--color-primary);
    border-bottom: 2px solid rgba(140, 158, 255, 0.3);
  }

  td {
    padding: var(--spacing-md);
    color: var(--color-text);
  }

  tbody tr {
    transition: background 0.2s ease;
    border-bottom: 1px solid rgba(140, 158, 255, 0.1);

    &:hover {
      background: rgba(140, 158, 255, 0.05);
    }
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-primary);
  font-size: 1.2rem;
  font-weight: 600;
`;

// --- AI REPORTING SECTION ---
const AIReportingSection = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const summaryColor = aiReport?.tableData?.[0]?.Status === 'Failed'
    ? 'var(--color-danger)'
    : 'var(--color-accent)';

  const handleGenerateReport = useCallback(async () => {
    if (!aiQuery) return;
    setAiLoading(true);
    setAiReport(null);
    try {
      const data = await reportApi.getAIReport(aiQuery);
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
        <h3>AI Dynamic Reporting Console</h3>
      </AIHeader>
      <AIDescription>
        Ask me anything! Try queries like "Show me top reader records" or "money flow record"
      </AIDescription>

      <QueryInput>
        <input
          type="text"
          placeholder="Enter your query..."
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleGenerateReport()}
        />
        <Button onClick={handleGenerateReport} disabled={aiLoading || !aiQuery}>
          {aiLoading ? 'Generating...' : 'Ask AI'}
        </Button>
      </QueryInput>

      {aiReport && (
        <ReportResult>
          <SummaryText $color={summaryColor}>
            📊 Summary: {aiReport.summary}
          </SummaryText>

          {aiReport.tableData && aiReport.tableData.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <StyledTable>
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
              </StyledTable>
            </div>
          )}
          <p style={{ fontSize: '0.85rem', marginTop: '1rem', color: 'var(--color-secondary)', fontStyle: 'italic' }}>
            ⏱️ Generated: {aiReport.generatedAt}
          </p>
        </ReportResult>
      )}
    </AICard>
  );
};

// --- MAIN DASHBOARD ---
const Dashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardColors = {
    totalStudents: '#00B0FF',
    totalBooksInStock: '#66BB6A',
    totalAvailableBooks: '#26A69A',
    totalBooksIssued: '#8C9EFF',
    totalBooksOverdue: '#EF5350',
    totalPendingReservations: '#78909C',
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
    return <LoadingSpinner>⏳ Loading Dashboard...</LoadingSpinner>;
  }

  if (!reportData) {
    return <LoadingSpinner>⚠️ Error loading data. Please check connection.</LoadingSpinner>;
  }

  const topStudents = formatTopActiveStudents();
  const maxBorrowCount = topStudents.length > 0 ? topStudents[0].count : 1;

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h2>Welcome, Librarian! 👋</h2>
        <p>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </DashboardHeader>

      <KeyMetricsGrid>
        <Card title="Total Students" value={reportData.totalStudents} color={cardColors.totalStudents} icon={FaUserGraduate} />
        <Card title="Total Copies (Stock)" value={reportData.totalBooksInStock} color={cardColors.totalBooksInStock} icon={FaBookOpen} />
        <Card title="Available Copies" value={reportData.totalAvailableBooks} color={cardColors.totalAvailableBooks} icon={FaTags} />
        <Card title="Currently Issued" value={reportData.totalBooksIssued} color={cardColors.totalBooksIssued} icon={FaExchangeAlt} />
        <Card title="Overdue Books" value={reportData.totalBooksOverdue} color={cardColors.totalBooksOverdue} icon={FaCalendarTimes} />
        <Card title="Pending Reservations" value={reportData.totalPendingReservations} color={cardColors.totalPendingReservations} icon={FaClock} />
      </KeyMetricsGrid>

      <SectionTitle>
        <FaChartLine /> Library Activity Summary
      </SectionTitle>
      <ActivityGrid>
        <TableContainer>
          <h4>📚 Top 5 Most Read Books</h4>
          <StyledTable>
            <tbody>
              {formatTopReadBooks().map((item, index) => (
                <DataRow key={index}>
                  <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                    #{index + 1} - {item.id}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>
                    {item.count} Reads
                  </td>
                </DataRow>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>

        <TableContainer>
          <h4>🎓 Top 5 Active Students</h4>
          <StyledTable>
            <tbody>
              {topStudents.map((item, index) => (
                <DataRow key={index}>
                  <td style={{ width: '40%', fontWeight: '700', color: 'var(--color-primary)' }}>
                    #{index + 1} - {item.id}
                  </td>
                  <td style={{ width: '60%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600' }}>{item.count} Books</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>
                        {Math.round((item.count / maxBorrowCount) * 100)}%
                      </span>
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