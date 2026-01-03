import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import reportApi from '../api/reportApi';
import Button from '../components/Button';
import { FaDownload, FaFilter } from 'react-icons/fa';

/* =======================
   STATIC FETCHER CONFIG
   (MUST be outside component)
======================= */

const FETCHERS = {
  'late-returns': {
    api: reportApi.getStudentLateReturns,
    title: 'Student Late Return Pattern Report',
  },
  'inventory-stock': {
    api: reportApi.getInventoryStockStatus,
    title: 'Inventory Stock Status Report',
  },
  'low-stock': {
    api: reportApi.getLowStockAlerts,
    title: 'Low Stock Alert Report',
  },
  'purchase-order-history': {
    api: reportApi.getPurchaseOrderHistory,
    title: 'Purchase Order History Report',
  },
  // --- NEW NAAC REPORTS ---
  'daily-footfall': {
    api: reportApi.getDailyFootfall, // Ensure this exists in reportApi.js
    title: 'Daily Library Usage (NAAC 4.2.4)',
  },
  'category-expenditure': {
    api: reportApi.getCategoryExpenditure, // Ensure this exists in reportApi.js
    title: 'Department-wise Expenditure & Usage',
  },
};

/* =======================
   STYLED COMPONENTS
======================= */

const DetailContainer = styled.div`
  padding: var(--spacing-xl);
`;

const ReportHeader = styled.h3`
  font-size: 1.8rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
`;

const ReportCard = styled.div`
  background: #ffffff;
  padding: var(--spacing-lg);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--spacing-md);
  font-size: 0.95rem;

  th,
  td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }

  th {
    background-color: #f4f7fa;
    font-weight: 700;
  }
`;

/* =======================
   COMPONENT
======================= */

const ReportDetailPage = () => {
  const { reportKey } = useParams();
  const navigate = useNavigate();

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('Loading Report...');

  /* =======================
     FETCH REPORT DATA
  ======================= */

  const fetchReportData = useCallback(async () => {
    const config = FETCHERS[reportKey];

    if (!config) {
      setTitle('Error: Report Not Found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setTitle(config.title);

    try {
      // Pass empty object as filters for now, or extend if needed
      const data = await config.api({});
      setReportData(data || []);
    } catch (error) {
      console.error(`Failed to fetch report: ${reportKey}`, error);
      setReportData([]);
      setTitle(`${config.title} - Failed to Load`);
    } finally {
      setLoading(false);
    }
  }, [reportKey]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  /* =======================
     EXPORT PDF
  ======================= */

  const handleExport = useCallback(async () => {
    const config = FETCHERS[reportKey];
    if (!config) return;

    try {
      setTitle(`Exporting ${config.title}...`);

      const pdfBlob = await reportApi.exportActivitySummaryPdf(
        reportKey,
        {},
        'PDF'
      );

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportKey.toUpperCase()}_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert(`✅ ${config.title} exported successfully`);
    } catch (error) {
      console.error('Export failed', error);
      alert('❌ Export failed. Please try again.');
    } finally {
      setTitle(config.title);
    }
  }, [reportKey]);

  if (loading) {
    return <DetailContainer>Loading {title}...</DetailContainer>;
  }

  /* =======================
     REPORT RENDERERS
  ======================= */

  // 1. Late Returns
  const renderLateReturnsReport = () => (
    <>
      <p>
        <strong>AI Insight:</strong> Students with average delay &gt; 5 days
        require follow-up.
      </p>

      <Table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Total Late Returns</th>
            <th>Avg Days Late</th>
            <th>Total Fines</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr key={index}>
              <td>{item.studentId || `S-${index + 1}`}</td>
              <td>{item.studentName}</td>
              <td>{item.totalLateReturns}</td>
              <td>{item.avgDaysLate?.toFixed(2) || '0.00'}</td>
              <td>{item.totalFines?.toFixed(2) || '0.00'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );

  // 2. Stock Reports (Inventory & Low Stock)
  const renderStockTable = (insight) => (
    <>
      <p>
        <strong>AI Insight:</strong> {insight}
      </p>

      <Table>
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Author</th>
            <th>Total</th>
            <th>Available</th>
            <th>Issued</th>
            <th>Missing</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr
              key={index}
              style={
                item.availableCopies <= 5
                  ? { backgroundColor: '#fff0f0' }
                  : {}
              }
            >
              <td>{item.title}</td>
              <td>{item.author || 'N/A'}</td>
              <td>{item.totalCopies}</td>
              <td>{item.availableCopies}</td>
              <td>{item.issuedCopies}</td>
              <td>{item.missingCopies}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );

  // 3. Purchase Orders
  const renderPurchaseOrders = () => (
    <>
      <p>
        <strong>AI Insight:</strong> Acquisition spending is within budget.
      </p>

      <Table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Vendor</th>
            <th>Order Date</th>
            <th>Items</th>
            <th>Total Cost</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr key={index}>
              <td>{item.orderId}</td>
              <td>{item.vendorName}</td>
              <td>{item.orderDate}</td>
              <td>{item.itemCount}</td>
              <td>₹ {item.totalCost?.toFixed(2) || '0.00'}</td>
              <td
                style={{
                  fontWeight: 'bold',
                  color:
                    item.status === 'PENDING'
                      ? 'orange'
                      : item.status === 'CANCELLED'
                      ? 'red'
                      : 'green',
                }}
              >
                {item.status}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );

  // 4. NAAC: Daily Footfall
  const renderDailyFootfall = () => (
    <>
      <p>
        <strong>NAAC Compliance (4.2.4):</strong> This data validates per-day usage of library by teachers and students.
      </p>

      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Total Books Issued</th>
            <th>Unique Visitors (Footfall)</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.totalIssues}</td>
              <td>{item.studentCount || item.totalIssues /* Fallback if studentCount null */}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );

  // 5. NAAC: Category Stats
  const renderCategoryStats = () => (
    <>
      <p>
        <strong>NAAC Compliance (4.2.3):</strong> Annual expenditure and usage distribution by department.
      </p>
      <Table>
        <thead>
          <tr>
            <th>Department / Category</th>
            <th>Total Usage Count</th>
            <th>% of Total Activity</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr key={index}>
              <td>{item.category}</td>
              <td>{item.usageCount}</td>
              <td>-</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );

  /* =======================
     MAIN RENDER
  ======================= */

  return (
    <DetailContainer>
      <ReportHeader>{title}</ReportHeader>

      <ActionRow>
        <Button onClick={() => navigate('/admin/reports')} className="muted">
          Back to Hub
        </Button>

        <div>
          <Button style={{ marginRight: 10 }}>
            <FaFilter /> Filters
          </Button>
          <Button
            onClick={handleExport}
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <FaDownload /> Export PDF
          </Button>
        </div>
      </ActionRow>

      <ReportCard>
        {reportKey === 'late-returns' && renderLateReturnsReport()}
        {reportKey === 'inventory-stock' &&
          renderStockTable('Inventory levels are stable.')}
        {reportKey === 'low-stock' &&
          renderStockTable(
            'CRITICAL: Below reorder threshold. Immediate procurement required.'
          )}
        {reportKey === 'purchase-order-history' && renderPurchaseOrders()}

        {/* --- NAAC SECTIONS --- */}
        {reportKey === 'daily-footfall' && renderDailyFootfall()}
        {reportKey === 'category-expenditure' && renderCategoryStats()}

        {reportData.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-secondary)' }}>
            No data found for this report.
          </p>
        )}
      </ReportCard>
    </DetailContainer>
  );
};

export default ReportDetailPage;