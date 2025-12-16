import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: var(--font-size-base);
  margin-top: var(--spacing-md);

  /* Primary Button Style */
  background-color: var(--color-primary);
  color: var(--color-card);

  &:hover {
    background-color: #0056b3; /* Darker Blue */
  }

  &:disabled {
    background-color: var(--color-secondary);
    cursor: not-allowed;
  }
`;

const Button = ({ children, onClick, type = 'button', disabled }) => {
  return (
    <StyledButton onClick={onClick} type={type} disabled={disabled}>
      {children}
    </StyledButton>
  );
};

export default Button;