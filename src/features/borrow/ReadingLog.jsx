import React, { useState } from 'react';
import styled from 'styled-components';
import borrowApi from '../../api/borrowApi';
import Button from '../../components/Button';
import { FaSignInAlt, FaSignOutAlt, FaClock } from 'react-icons/fa';
// import { toast } from 'react-toastify';

const LogContainer = styled.div`
  background-color: var(--color-card);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  max-width: 800px;
  margin: 0 auto;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: var(--spacing-lg);
`;

const TabButton = styled(Button)`
  background-color: ${(props) => (props.$active ? 'var(--color-primary)' : '#f0f0f0')};
  color: ${(props) => (props.$active ? 'white' : 'var(--color-text)')};
  border: 1px solid #ccc;
  border-radius: 0;
  margin: 0;
  padding: var(--spacing-md) var(--spacing-lg);

  &:first-child {
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
  }
  &:last-child {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
  }
`;

const FormRow = styled.div`
    margin-bottom: var(--spacing-md);
    label {
        display: block;
        font-weight: 600;
        margin-bottom: 5px;
    }
`;

const ReadingLog = () => {
  const [activeTab, setActiveTab] = useState('in'); // 'in' or 'out'
  const [logInForm, setLogInForm] = useState({ bookId: '', studentId: '' });
  const [logOutId, setLogOutId] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Log In Logic ---
  const handleLogInChange = (e) => {
    setLogInForm({ ...logInForm, [e.target.name]: e.target.value });
  };

  const handleLogInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const record = await borrowApi.logReadIn(logInForm.bookId, logInForm.studentId);
      // toast.success(`In-time logged! Record ID: ${record.id}`);
      alert(`In-time logged! Use Record ID: ${record.id} for checkout.`);
      setLogInForm({ bookId: '', studentId: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to log in-time.';
      // toast.error(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Log Out Logic ---
  const handleLogOutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await borrowApi.logReadOut(logOutId);
      // toast.success(`Out-time logged successfully!`);
      alert(`Out-time logged successfully!`);
      setLogOutId('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to log out-time. Check Record ID.';
      // toast.error(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Rendering Logic ---
  const renderLogForms = () => {
    if (activeTab === 'in') {
      return (
        <form onSubmit={handleLogInSubmit}>
          <FormRow>
            <label htmlFor="bookId">Book ID</label>
            <input
              type="text"
              id="bookId"
              name="bookId"
              value={logInForm.bookId}
              onChange={handleLogInChange}
              required
              placeholder="Book ID being read in office"
            />
          </FormRow>
          <FormRow>
            <label htmlFor="studentId">Student ID</label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={logInForm.studentId}
              onChange={handleLogInChange}
              required
              placeholder="Student ID reading the book"
            />
          </FormRow>
          <Button type="submit" disabled={loading} style={{ backgroundColor: 'var(--color-accent)' }}>
            <FaSignInAlt /> {loading ? 'Logging In...' : 'Log In Time'}
          </Button>
        </form>
      );
    } else {
      return (
        <form onSubmit={handleLogOutSubmit}>
          <FormRow>
            <label htmlFor="logOutId">Active Reading Record ID</label>
            <input
              type="text"
              id="logOutId"
              name="logOutId"
              value={logOutId}
              onChange={(e) => setLogOutId(e.target.value)}
              required
              placeholder="Record ID from the Log In process"
            />
          </FormRow>
          <Button type="submit" disabled={loading} style={{ backgroundColor: 'var(--color-danger)' }}>
            <FaSignOutAlt /> {loading ? 'Logging Out...' : 'Log Out Time'}
          </Button>
        </form>
      );
    }
  };

  return (
    <LogContainer>
      <h2><FaClock style={{ marginRight: '10px' }} /> In-Office Reading Log</h2>
      <p>Track student usage of books within the library premises (Requirement 5).</p>

      <Tabs>
        <TabButton $active={activeTab === 'in'} onClick={() => setActiveTab('in')}>
          Log In Time
        </TabButton>
        <TabButton $active={activeTab === 'out'} onClick={() => setActiveTab('out')}>
          Log Out Time
        </TabButton>
      </Tabs>

      {renderLogForms()}
    </LogContainer>
  );
};

export default ReadingLog;