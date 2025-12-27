import React, { useState } from 'react';
import styled from 'styled-components';
import borrowApi from '../../api/borrowApi';
import Button from '../../components/Button';
import { FaSignInAlt, FaSignOutAlt, FaClock, FaBookOpen, FaUserGraduate, FaTicketAlt } from 'react-icons/fa';

// --- Styled Components ---

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #f8fafc;
  min-height: calc(100vh - 80px); /* Adjust based on your header height */
`;

const LogCard = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const HeaderSection = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding: 30px;
  text-align: center;
  color: white;

  h2 {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 1.5rem;
  }

  p {
    margin: 8px 0 0;
    opacity: 0.8;
    font-size: 0.9rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background-color: #f1f5f9;
  padding: 6px;
  margin: 20px;
  border-radius: 12px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  /* Conditional Styling based on active state */
  background-color: ${props => props.$active ? '#ffffff' : 'transparent'};
  color: ${props => props.$active ? (props.$mode === 'in' ? '#059669' : '#d97706') : '#64748b'};
  box-shadow: ${props => props.$active ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    color: ${props => props.$active ? '' : '#334155'};
  }
`;

const FormBody = styled.div`
  padding: 0 30px 30px 30px;
`;

const FormRow = styled.div`
  margin-bottom: 20px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 8px;
  }

  input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    background: #f8fafc;

    &:focus {
      outline: none;
      border-color: ${props => props.$mode === 'in' ? '#10b981' : '#f59e0b'};
      box-shadow: 0 0 0 3px ${props => props.$mode === 'in' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'};
      background: white;
    }
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  background-color: ${props => props.$mode === 'in' ? '#059669' : '#d97706'};

  &:hover {
    filter: brightness(110%);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// --- Main Component ---

const ReadingLog = () => {
  const [activeTab, setActiveTab] = useState('in'); // 'in' or 'out'
  const [logInForm, setLogInForm] = useState({ bookId: '', studentId: '' });
  const [logOutId, setLogOutId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogInChange = (e) => {
    setLogInForm({ ...logInForm, [e.target.name]: e.target.value });
  };

  const handleLogInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const record = await borrowApi.logReadIn(logInForm.bookId, logInForm.studentId);
      alert(`Entry Logged! Use Record ID: ${record.id} for checkout.`);
      setLogInForm({ bookId: '', studentId: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to log in-time.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogOutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await borrowApi.logReadOut(logOutId);
      alert(`Exit logged successfully!`);
      setLogOutId('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to log out-time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <LogCard>
        <HeaderSection>
          <h2><FaClock /> In-Office Reading Log</h2>
          <p>Track library usage for students reading on-premise.</p>
        </HeaderSection>

        <TabContainer>
          <TabButton
            $active={activeTab === 'in'}
            $mode="in"
            onClick={() => setActiveTab('in')}
          >
            <FaSignInAlt /> Log Entry
          </TabButton>
          <TabButton
            $active={activeTab === 'out'}
            $mode="out"
            onClick={() => setActiveTab('out')}
          >
            <FaSignOutAlt /> Log Exit
          </TabButton>
        </TabContainer>

        <FormBody>
          {activeTab === 'in' ? (
            <form onSubmit={handleLogInSubmit}>
              <FormRow $mode="in">
                <label htmlFor="bookId"><FaBookOpen className="text-muted"/> Book Barcode / ID</label>
                <input
                  type="text"
                  name="bookId"
                  value={logInForm.bookId}
                  onChange={handleLogInChange}
                  required
                  placeholder="Scan Book ID..."
                  autoFocus
                />
              </FormRow>
              <FormRow $mode="in">
                <label htmlFor="studentId"><FaUserGraduate className="text-muted"/> Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={logInForm.studentId}
                  onChange={handleLogInChange}
                  required
                  placeholder="Enter Student ID..."
                />
              </FormRow>
              <SubmitButton type="submit" disabled={loading} $mode="in">
                {loading ? 'Logging Entry...' : 'Confirm Entry Log'}
              </SubmitButton>
            </form>
          ) : (
            <form onSubmit={handleLogOutSubmit}>
              <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', color: '#9a3412', border: '1px solid #ffedd5' }}>
                ℹ️ Use the Record ID generated during check-in to close the session.
              </div>
              <FormRow $mode="out">
                <label htmlFor="logOutId"><FaTicketAlt className="text-muted"/> Reading Record ID</label>
                <input
                  type="text"
                  value={logOutId}
                  onChange={(e) => setLogOutId(e.target.value)}
                  required
                  placeholder="Paste Record ID here..."
                  autoFocus
                />
              </FormRow>
              <SubmitButton type="submit" disabled={loading} $mode="out">
                {loading ? 'Logging Exit...' : 'Confirm Exit Log'}
              </SubmitButton>
            </form>
          )}
        </FormBody>
      </LogCard>
    </PageWrapper>
  );
};

export default ReadingLog;