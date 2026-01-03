import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginFailure, loginPending, loginSuccess } from './AuthSlice';
import authApi from '../../api/authApi';
import { FaBookOpen, FaUser, FaLock } from 'react-icons/fa';

// --- ANIMATIONS ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- STYLED COMPONENTS ---
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  // Deep professional gradient background
  background: linear-gradient(135deg, #1a1d29 0%, #252a40 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;

  // Abstract background shapes (Optional visual flair)
  &::before {
    content: '';
    position: absolute;
    top: -10%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(140, 158, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
`;

const LoginForm = styled.div`
  background: rgba(30, 33, 45, 0.7); // Semi-transparent dark bg
  backdrop-filter: blur(12px); // Glass effect
  -webkit-backdrop-filter: blur(12px);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: 100%;
  max-width: 420px;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Logo = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 800;
  letter-spacing: 1px;

  svg {
    color: #8c9eff; // Accent color
  }
`;

const Subtitle = styled.p`
  color: #a0aec0;
  margin-bottom: 2.5rem;
  font-size: 0.95rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
  position: relative;
`;

const Label = styled.label`
  display: block;
  color: #e2e8f0;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: 4px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 14px;
  color: #718096;
  font-size: 1rem;
  transition: color 0.3s ease;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 42px; // Left padding accounts for icon
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: #718096;
  }

  &:focus {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: #8c9eff;
    box-shadow: 0 0 0 4px rgba(140, 158, 255, 0.1);
  }

  // When input is focused, change the sibling icon color
  &:focus + ${IconWrapper}, &:focus ~ ${IconWrapper} {
    color: #8c9eff;
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  text-align: left;
`;

// Enhanced Button Component (Inline for this file to ensure style match)
const LoginButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #8c9eff 0%, #5c7cfa 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 14px 0 rgba(92, 124, 250, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px 0 rgba(92, 124, 250, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
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
        <Subtitle>Welcome back! Please sign in to continue.</Subtitle>

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="username">Username</Label>
            <InputWrapper>
              <IconWrapper>
                <FaUser />
              </IconWrapper>
              <StyledInput
                type="text"
                id="username"
                placeholder="Enter your Student ID or Admin ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <IconWrapper>
                <FaLock />
              </IconWrapper>
              <StyledInput
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </InputWrapper>
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </LoginButton>
        </form>
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginPage;