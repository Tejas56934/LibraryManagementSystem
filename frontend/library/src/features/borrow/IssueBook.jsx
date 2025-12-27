import React, { useState } from 'react';
import styled from 'styled-components';
import borrowApi from '../../api/borrowApi';
import Button from '../../components/Button';
import { FaBookMedical, FaCalendarAlt, FaIdCard, FaBarcode } from 'react-icons/fa';

// --- Styled Components ---

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  min-height: calc(100vh - 100px);
  background-color: var(--color-background);
`;

const FormContainer = styled.div`
  background-color: #ffffff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 550px;
  border: 1px solid #eaeaea;
`;

const HeaderArea = styled.div`
  margin-bottom: 30px;
  text-align: center;

  h2 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 1.75rem;
    color: #1a1a1a;
    margin-bottom: 8px;
  }

  p {
    color: #666;
    font-size: 0.95rem;
  }
`;

const FormRow = styled.div`
  margin-bottom: 24px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #444;
    font-size: 0.9rem;
  }

  input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    font-size: 1rem;
    background-color: #f9fafb;
    transition: all 0.2s ease-in-out;

    &:focus {
      background-color: #ffffff;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.1);
      outline: none;
    }

    &::placeholder {
      color: #9ca3af;
    }
  }
`;

const ActionWrapper = styled.div`
  margin-top: 32px;

  button {
    width: 100%;
    padding: 14px;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    transition: transform 0.1s active;

    &:active {
      transform: scale(0.98);
    }
  }
`;

// --- Component ---

const IssueBook = () => {
  const [formData, setFormData] = useState({
    bookId: '',
    studentId: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isoDueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : null;

    try {
      await borrowApi.issueBook({
        ...formData,
        dueDate: isoDueDate,
      });

      alert(`Book ${formData.bookId} issued successfully to ${formData.studentId}.`);
      setFormData({ bookId: '', studentId: '', dueDate: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to issue book. Check IDs and stock.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <FormContainer>
        <HeaderArea>
          <h2><FaBookMedical color="var(--color-primary)" /> Issue New Loan</h2>
          <p>Assign a book to a student and set the return deadline.</p>
        </HeaderArea>

        <form onSubmit={handleSubmit}>
          <FormRow>
            <label htmlFor="bookId">
              <FaBarcode color="var(--color-primary)" /> Book ID / Barcode
            </label>
            <input
              type="text"
              id="bookId"
              name="bookId"
              value={formData.bookId}
              onChange={handleChange}
              required
              placeholder="Scan or type BK-ID"
            />
          </FormRow>

          <FormRow>
            <label htmlFor="studentId">
              <FaIdCard color="var(--color-primary)" /> Student ID
            </label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              placeholder="e.g., S-98765"
            />
          </FormRow>

          <FormRow>
            <label htmlFor="dueDate">
              <FaCalendarAlt color="var(--color-primary)" /> Due Date & Time
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </FormRow>

          <ActionWrapper>
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Validating Transaction...' : 'Confirm Loan & Issue Book'}
            </Button>
          </ActionWrapper>
        </form>
      </FormContainer>
    </PageWrapper>
  );
};

export default IssueBook;