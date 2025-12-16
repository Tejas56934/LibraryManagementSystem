import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBell } from 'react-icons/fa';

const NavbarWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(140, 158, 255, 0.1);
`;

const Title = styled.h3`
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8c9eff 0%, #00b0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  color: var(--color-text);
  padding: 6px 16px 6px 6px;
  border-radius: 50px;
  background: linear-gradient(135deg, rgba(140, 158, 255, 0.08) 0%, rgba(140, 158, 255, 0.03) 100%);
  border: 1px solid rgba(140, 158, 255, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;

  &:hover {
    background: linear-gradient(135deg, rgba(140, 158, 255, 0.12) 0%, rgba(140, 158, 255, 0.06) 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(140, 158, 255, 0.2);
  }
`;

const ProfileIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8c9eff 0%, #00b0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(140, 158, 255, 0.3);
  flex-shrink: 0;

  svg {
    font-size: 1.5rem;
    color: white;
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: var(--spacing-xs);
  white-space: nowrap;
`;

const NotificationIcon = styled.div`
  position: relative;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(239, 83, 80, 0.08) 0%, rgba(239, 83, 80, 0.03) 100%);
  border: 1px solid rgba(239, 83, 80, 0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: linear-gradient(135deg, rgba(239, 83, 80, 0.15) 0%, rgba(239, 83, 80, 0.08) 100%);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 12px rgba(239, 83, 80, 0.2);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  svg {
    font-size: 1.4rem;
    color: var(--color-danger);
    transition: all 0.3s ease;
    animation: ${props => props.$hasNotifications ? 'ring 2s ease-in-out infinite' : 'none'};
  }

  @keyframes ring {
    0%, 100% { transform: rotate(0deg); }
    10%, 30% { transform: rotate(-15deg); }
    20%, 40% { transform: rotate(15deg); }
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #ff5252 0%, #ef5350 100%);
  color: white;
  border-radius: 50%;
  min-width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.4);
  border: 2px solid white;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const RoleBadge = styled.span`
  background: linear-gradient(135deg, #8c9eff 0%, #00b0ff 100%);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(140, 158, 255, 0.3);
  display: inline-block;
`;

const Navbar = () => {
  const navigate = useNavigate();
  const { user, role } = useSelector((state) => state.auth);
  // Placeholder for notification count (will be fetched later)
  const notificationCount = 3;

  const handleNotificationClick = () => {
    navigate('/admin/alerts');
  };

  return (
    <NavbarWrapper>
      <Title>📚 Librarian Panel</Title>
      <UserInfo>
        <NotificationIcon
          onClick={handleNotificationClick}
          $hasNotifications={notificationCount > 0}
          title="View notifications"
        >
          <FaBell />
          {notificationCount > 0 && (
            <NotificationBadge>{notificationCount}</NotificationBadge>
          )}
        </NotificationIcon>
        <Profile>
          <ProfileIcon>
            <FaUserCircle />
          </ProfileIcon>
          <ProfileInfo>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text)' }}>
              {user?.username || 'Admin'}
            </span>
            <RoleBadge>{role || 'Librarian'}</RoleBadge>
          </ProfileInfo>
        </Profile>
      </UserInfo>
    </NavbarWrapper>
  );
};

export default Navbar;