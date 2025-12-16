import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background-color: var(--color-card);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 5px solid ${(props) => props.$color || 'var(--color-primary)'}; /* Color accent */
`;

const Title = styled.h4`
  color: var(--color-secondary);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
`;

const Value = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
`;

const Card = ({ title, value, color, icon: Icon }) => {
  return (
    <CardContainer $color={color}>
      <Title>{title}</Title>
      <Value>
        {Icon && <Icon style={{ marginRight: '8px', fontSize: '1.8rem', color: color }} />}
        {value}
      </Value>
    </CardContainer>
  );
};

export default Card;