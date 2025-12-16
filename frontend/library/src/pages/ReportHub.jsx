import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaUserGraduate, FaClipboardList, FaClock, FaRobot, FaChevronRight } from 'react-icons/fa';

// --- Styled Components ---
const HubContainer = styled.div`
    padding: var(--spacing-xl);
`;

const HubHeader = styled.h2`
    font-size: 2rem;
    color: var(--color-text);
    margin-bottom: var(--spacing-xl);
    font-weight: 800;
`;

const ReportSection = styled.div`
    margin-bottom: var(--spacing-2xl);
    border: 1px solid rgba(140, 158, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: var(--spacing-lg);
    background: linear-gradient(90deg, rgba(140, 158, 255, 0.1) 0%, transparent 100%);
    color: var(--color-primary);
    font-size: 1.2rem;
    font-weight: 700;
    border-bottom: 2px solid rgba(140, 158, 255, 0.2);
`;

// --- NEW TABLE STYLES ---
const ReportTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    th, td {
        padding: var(--spacing-md) var(--spacing-lg);
        text-align: left;
        border-bottom: 1px solid rgba(140, 158, 255, 0.05);
    }

    th {
        background-color: rgba(140, 158, 255, 0.05);
        font-weight: 700;
        color: var(--color-primary);
        font-size: 0.95rem;
    }

    tbody tr {
        cursor: pointer;
        transition: background-color 0.2s ease, transform 0.1s ease;

        &:hover {
            background-color: rgba(140, 158, 255, 0.1);
        }
    }
`;

const ReportTitleCell = styled.td`
    font-weight: 600;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ReportDescriptionCell = styled.td`
    color: var(--color-secondary);
    font-size: 0.9rem;
`;

// --- DATA MAPPING (Remains the same) ---
const ReportKeyMap = [
    {
        icon: FaClipboardList,
        title: "I. Core Administrative Reports",
        reports: [
            { key: 'inventory-stock', name: 'Inventory Stock Status Report', desc: 'Granular view of all books and their current status (available, issued, missing).' },
            { key: 'low-stock', name: 'Low-Stock Alert Report', desc: 'Identifies books below a critical reorder threshold.' },
            { key: 'purchase-order-history', name: 'Purchase Order History Report', desc: 'Detailed log of all vendor purchase orders.' }
        ]
    },
    {
        icon: FaUserGraduate,
        title: "II. Student Activity & Behavior Reports",
        reports: [
            { key: 'late-returns', name: 'Student Late Return Pattern Report', desc: 'Analyzes late return frequency, average delay, and fines by student.' },
            { key: 'top-borrowers', name: 'Top Borrowers Report', desc: 'Ranks students by volume of books borrowed over a period.' },
            { key: 'inactive-students', name: 'Inactive Students Report', desc: 'Identifies students with zero borrowing activity in the last 6 months.' }
        ]
    },
    {
        icon: FaRobot,
        title: "VI. AI-based Advanced Analytical Reports",
        reports: [
            { key: 'demand-forecast', name: 'AI Book Demand Forecast Report', desc: 'Predicts future book popularity based on trends and curriculum.' },
            { key: 'replacement-damage-forecast', name: 'AI Replacement & Damage Forecast', desc: 'Predicts which assets will need replacement soon.' }
        ]
    },
    // ... Other sections (Loan, Timer-based, Vendor) would follow here
];

const ReportHub = () => {
    const navigate = useNavigate();

    // Handler to navigate to the dynamic report detail page
    const handleReportClick = (reportKey) => {
        // Example: Navigates to /admin/reports/detail/late-returns
        navigate(`/admin/reports/detail/${reportKey}`);
    };

    return (
        <HubContainer>
            <HubHeader>📊 LMS-AI Professional Report Generation Hub</HubHeader>

            {ReportKeyMap.map((section, sectionIndex) => (
                <ReportSection key={sectionIndex}>
                    <SectionHeader>
                        <section.icon />
                        {section.title}
                    </SectionHeader>

                    <ReportTable>
                        <thead>
                            <tr>
                                <th style={{ width: '30%' }}>Report Name</th>
                                <th style={{ width: '60%' }}>Description</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {section.reports.map((report) => (
                                <tr key={report.key} onClick={() => handleReportClick(report.key)}>
                                    <ReportTitleCell>
                                        <FaChartBar style={{ color: 'var(--color-accent)', opacity: 0.8 }} />
                                        {report.name}
                                    </ReportTitleCell>
                                    <ReportDescriptionCell>
                                        {report.desc}
                                    </ReportDescriptionCell>
                                    <td style={{ textAlign: 'center' }}>
                                        <FaChevronRight style={{ color: 'var(--color-secondary)' }} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </ReportTable>
                </ReportSection>
            ))}
        </HubContainer>
    );
};

export default ReportHub;