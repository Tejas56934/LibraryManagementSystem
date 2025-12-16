// src/components/LoadingGateWrapper.jsx

import React from "react";
import styled, { keyframes } from "styled-components";

// Simple spinner animation
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
`;

const Spinner = styled.div`
  width: 55px;
  height: 55px;
  border: 6px solid #d3d3d3;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
`;

/**
 * LoadingGateWrapper Component
 *
 * Props:
 * - isLoading (boolean): If true → show loader
 * - children (React nodes): Render after loading completes
 */

const LoadingGateWrapper = ({ isLoading, children }) => {
  if (isLoading) {
    return (
      <LoaderContainer>
        <Spinner />
      </LoaderContainer>
    );
  }

  return <>{children}</>;
};

export default LoadingGateWrapper;
