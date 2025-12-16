import React, { useState } from 'react';
import styled from 'styled-components';
import borrowApi from '../../api/borrowApi';
import Button from '../../components/Button';
import { FaUndoAlt, FaCheckCircle } from 'react-icons/fa';
// import { toast } from 'react-toastify';

const FormContainer = styled.div`
  background-color: var(--color-card);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  max-width: 600px;
  margin: 0 auto;
`;

const FormRow = styled.div`
    margin-bottom: var(--spacing-md);
    label {
        display: block;
        font-weight: 600;
        margin-bottom: 5px;
    }
`;

const ReturnBook = () => {
  const [borrowRecordId, setBorrowRecordId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await borrowApi.returnBook(borrowRecordId);

      // toast.success(`Return recorded successfully! Stock updated.`);
      alert(`Book return recorded successfully! Countdown stopped.`);
      setBorrowRecordId(''); // Clear form
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to record return. Check Borrow Record ID.';
      // toast.error(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <h2><FaUndoAlt style={{ marginRight: '10px' }} /> Record Book Return</h2>
      <p>Enter the Borrow Record ID to register the return and stop the due date countdown.</p>

      <form onSubmit={handleSubmit}>
        <FormRow>
          <label htmlFor="borrowRecordId">Borrow Record ID (System ID)</label>
          <input
            type="text"
            id="borrowRecordId"
            name="borrowRecordId"
            value={borrowRecordId}
            onChange={(e) => setBorrowRecordId(e.target.value)}
            required
            placeholder="e.g., MongoDB ObjectId"
          />
        </FormRow>

        <Button type="submit" disabled={loading} style={{ backgroundColor: 'var(--color-accent)' }}>
          <FaCheckCircle /> {loading ? 'Processing...' : 'Confirm Return'}
        </Button>
      </form>
    </FormContainer>
  );
};

export default ReturnBook;