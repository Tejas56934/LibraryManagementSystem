// frontend/src/layouts/StudentLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
// CRITICAL: Import the new sidebar
import StudentSidebar from '../components/StudentSidebar';
// Assuming you have a Header component
// import Header from '../components/Header';
import styled from 'styled-components';

// This wrapper handles the space needed for the sidebar
const ContentWrapper = styled.div`
    margin-left: 250px; /* Needs to match the open width of the sidebar */
    padding: var(--spacing-xl);
    width: calc(100% - 250px);
    min-height: 100vh;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const StudentLayout = () => {
    return (
        <>
            {/* 1. Render the Student Sidebar */}
            <StudentSidebar />

            <ContentWrapper>
                {/* 2. Optional: Render a header/navbar here if needed */}
                {/* <Header title="Student Dashboard" /> */}

                {/* 3. Render the nested route component (Dashboard, Reservations, etc.) */}
                <Outlet />
            </ContentWrapper>
        </>
    );
};

export default StudentLayout;