import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginFailure, loginPending, loginSuccess } from './AuthSlice';
import authApi from '../../api/authApi';
import Button from '../../components/Button';
import { FaBookOpen } from 'react-icons/fa';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-primary); /* Use primary color for dramatic background */
`;

const LoginForm = styled.div`
  background-color: var(--color-card);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.h1`
  font-size: 2rem;
  margin-bottom: var(--spacing-lg);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
`;

const InputGroup = styled.div`
  margin-bottom: var(--spacing-md);
  text-align: left;
`;

const ErrorMessage = styled.p`
  color: var(--color-danger);
  margin-top: var(--spacing-sm);
`;

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginPending());
    try {
      const user = await authApi.login(username, password);
      dispatch(loginSuccess(user));

      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STUDENT') {
        navigate('/student/dashboard');
      }
    } catch (err) {
      const message = err.response?.data || 'Login failed. Check credentials.';
      dispatch(loginFailure(message));
    }
  };

  return (
    <LoginContainer>
      <LoginForm>
        <Logo>
          <FaBookOpen /> LMS Pro
        </Logo>
        <p>Welcome, please sign in to access the system.</p>
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
          </Button>
        </form>
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginPage;