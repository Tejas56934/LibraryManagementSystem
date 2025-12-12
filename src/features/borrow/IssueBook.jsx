import React, { useState } from 'react';
import styled from 'styled-components';
import borrowApi from '../../api/borrowApi';
import Button from '../../components/Button';
import { FaBookMedical, FaCalendarAlt } from 'react-icons/fa';
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

const IssueBook = () => {
  const [formData, setFormData] = useState({
    bookId: '',
    studentId: '',
    dueDate: '', // Stored as datetime-local string
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Convert local datetime string to ISO format required by Spring Boot
    const isoDueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : null;

    try {
      await borrowApi.issueBook({
        ...formData,
        dueDate: isoDueDate,
      });

      // toast.success(`Book ${formData.bookId} issued successfully!`);
      alert(`Book ${formData.bookId} issued successfully to ${formData.studentId}.`);
      setFormData({ bookId: '', studentId: '', dueDate: '' }); // Clear form
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to issue book. Check IDs and stock.';
      // toast.error(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <h2><FaBookMedical style={{ marginRight: '10px' }} /> Issue Book</h2>
      <p>Record a book loan and set the return deadline.</p>

      <form onSubmit={handleSubmit}>
        <FormRow>
          <label htmlFor="bookId">Book ID (Barcode Scan/Input)</label>
          <input
            type="text"
            id="bookId"
            name="bookId"
            value={formData.bookId}
            onChange={handleChange}
            required
            placeholder="e.g., BK-12345678"
          />
        </FormRow>

        <FormRow>
          <label htmlFor="studentId">Student ID</label>
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
          <label htmlFor="dueDate">Due Date and Time <FaCalendarAlt /></label>
          <input
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
        </FormRow>

        <Button type="submit" disabled={loading} style={{ backgroundColor: 'var(--color-primary)' }}>
          {loading ? 'Processing...' : 'Issue Book & Start Countdown'}
        </Button>
      </form>
    </FormContainer>
  );
};

export default IssueBook;