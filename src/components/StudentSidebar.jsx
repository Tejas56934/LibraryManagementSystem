// frontend/src/components/StudentSidebar.jsx
// NOTE: You should place this file in your 'components' directory or 'layouts' directory.

import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FaBook, FaChartBar, FaExchangeAlt, FaBell, FaSignOutAlt, FaBars, FaClock, FaCommentDots } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/AuthSlice';
import { useNavigate } from 'react-router-dom';

// --- STYLED COMPONENTS (Use the same styles as Admin Sidebar for consistency) ---
const SidebarContainer = styled.div`
  width: ${props => props.$isOpen ? '250px' : '70px'};
  background: linear-gradient(180deg, #1a1d29 0%, #13151f 100%);
  color: var(--color-text);
  height: 100vh;
  padding-top: var(--spacing-lg);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isOpen ? 'space-between' : 'center'};
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  cursor: pointer;
  transition: all 0.3s ease;
`;

const Logo = styled.h2`
  font-size: 1.8rem;
  color: #fff;
  font-weight: 800;
  letter-spacing: 1px;
  white-space: nowrap;
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transition: opacity 0.3s ease;

  span {
    background: linear-gradient(135deg, #8c9eff 0%, #00b0ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;
  }
`;

const MenuIcon = styled.div`
  color: var(--color-primary);
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease, color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
`;

const NavList = styled.div`
  flex-grow: 1;
  padding: 0 var(--spacing-sm);
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: ${props => props.$isOpen ? 'var(--spacing-md) var(--spacing-md)' : 'var(--spacing-md) 0'};
  margin: var(--spacing-sm) 0;
  color: var(--color-secondary-text);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  justify-content: ${props => props.$isOpen ? 'flex-start' : 'center'};

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: var(--color-primary);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }

  &.active {
    background: linear-gradient(90deg, rgba(140, 158, 255, 0.15) 0%, rgba(140, 158, 255, 0.05) 100%);
    color: var(--color-primary);
    font-weight: 700;
    box-shadow: inset 0 0 20px rgba(140, 158, 255, 0.1);

    &::before {
      transform: scaleY(1);
    }
  }

  &:hover {
    background: linear-gradient(90deg, rgba(140, 158, 255, 0.08) 0%, rgba(140, 158, 255, 0.03) 100%);
    color: #fff;
    transform: translateX(4px);
  }

  svg {
    min-width: 1.15rem;
    font-size: 1.15rem;
    margin-right: ${props => props.$isOpen ? 'var(--spacing-md)' : '0'};
    transition: all 0.3s ease;
  }

  span {
    white-space: nowrap;
    opacity: ${props => props.$isOpen ? '1' : '0'};
    transition: opacity 0.3s ease;
  }
`;

const LogoutButton = styled(NavItem)`
  margin-top: var(--spacing-lg);
  color: var(--color-danger);
`;

const Tooltip = styled.div`
  position: absolute;
  left: 70px;
  background: rgba(30, 33, 45, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  white-space: nowrap;
  opacity: ${props => props.$show ? '1' : '0'};
  pointer-events: none;
  transition: opacity 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;
// --- END STYLED COMPONENTS ---

const StudentSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Student Navigation Links (Req 6, 7, 8)
  const studentNav = [
    { name: 'Dashboard', path: '/student/dashboard', icon: FaChartBar },
    { name: 'Browse Books', path: '/student/books', icon: FaBook },
    { name: 'My Reservations', path: '/student/reservations', icon: FaClock },
    { name: 'Reading History', path: '/student/reading-log', icon: FaExchangeAlt },
    { name: 'Request Book/Feedback', path: '/student/request-book', icon: FaCommentDots },
    { name: 'Alerts', path: '/student/alerts', icon: FaBell },
  ];

  return (
    <SidebarContainer $isOpen={isOpen}>
      <LogoContainer $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        {isOpen && <Logo $isOpen={isOpen}><span>Student Panel</span></Logo>}
        <MenuIcon>
          <FaBars />
        </MenuIcon>
      </LogoContainer>

      <NavList>
        {studentNav.map((item) => (
          <div
            key={item.name}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredItem(item.name)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavItem
              to={item.path}
              end={item.path === '/student/dashboard'}
              $isOpen={isOpen}
            >
              <item.icon />
              <span>{item.name}</span>
            </NavItem>
            {!isOpen && (
              <Tooltip $show={hoveredItem === item.name}>
                {item.name}
              </Tooltip>
            )}
          </div>
        ))}
      </NavList>

      <div
        style={{ position: 'relative' }}
        onMouseEnter={() => setHoveredItem('logout')}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <LogoutButton
          as="div"
          onClick={handleLogout}
          to="#"
          $isOpen={isOpen}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </LogoutButton>
        {!isOpen && (
          <Tooltip $show={hoveredItem === 'logout'}>
            Logout
          </Tooltip>
        )}
      </div>
    </SidebarContainer>
  );
};

export default StudentSidebar;