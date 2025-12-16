// frontend/src/components/Loader.jsx

import React from 'react';
import styled, { keyframes } from 'styled-components';

// Define the spinning animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled component for the spinner element
const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3); /* Light border */
  border-top: 4px solid var(--color-primary); /* Primary color top border (the spinner part) */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

// Styled component for the container (to center the spinner)
const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px; /* Add some padding/height */
  width: 100%;
  min-height: 200px;
  color: var(--color-secondary-text);
  flex-direction: column;
`;

const LoaderText = styled.p`
  margin-top: 10px;
  font-size: 0.9rem;
`;

// The Loader component with a default export
const Loader = () => {
  return (
    <LoaderContainer>
      <Spinner />
      <LoaderText>Loading data...</LoaderText>
    </LoaderContainer>
  );
};

export default Loader; // Critical: Ensure this is a DEFAULT export!