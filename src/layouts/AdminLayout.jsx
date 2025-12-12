import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const ContentWrapper = styled.div`
  margin-left: 250px; /* Offset content area by sidebar width */
  padding-bottom: var(--spacing-xl); /* Padding at the bottom */
`;

const MainContent = styled.main`
  padding: var(--spacing-lg);
`;

const AdminLayout = () => {
  return (
    <>
      <Sidebar />
      <ContentWrapper>
        <Navbar />
        <MainContent>
          <Outlet /> {/* Renders the specific page (e.g., Dashboard, BookList) */}
        </MainContent>
      </ContentWrapper>
    </>
  );
};

export default AdminLayout;