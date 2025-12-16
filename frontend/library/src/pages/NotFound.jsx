import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
    text-align: center;
    padding: 50px;
    margin-top: 100px;
`;

const NotFound = ({ message = "The page you are looking for doesn't exist." }) => {
    return (
        <ErrorContainer>
            <h1>404 Error</h1>
            <p>{message}</p>
        </ErrorContainer>
    );
};

export default NotFound;