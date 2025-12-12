import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import studentApi from '../../api/studentApi';
import borrowApi from '../../api/borrowApi'; // To fetch student's history
import Button from '../../components/Button';
import { FaUserGraduate, FaSave, FaRegEdit, FaTimesCircle, FaHistory } from 'react-icons/fa';
// import { toast } from 'react-toastify';

const DetailContainer = styled.div`
  background-color: var(--color-card);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  max-width: 800px;
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

const SectionHeader = styled.h3`
    margin-top: var(--spacing-xl);
    border-bottom: 2px solid var(--color-primary);
    padding-bottom: var(--spacing-sm);
    color: var(--color-primary);
`;

const StatusPill = styled.span`
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    color: white;
    background-color: ${(props) => {
        if (props.$status === 'OVERDUE') return 'var(--color-danger)';
        if (props.$status === 'ISSUED') return 'var(--color-primary)';
        return 'var(--color-secondary)';
    }};
`;

const StudentDetail = ({ isAdding }) => {
    const { studentId } = useParams();
    const navigate = useNavigate();

    // State for CRUD form
    const [student, setStudent] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(!isAdding);
    const [isEditing, setIsEditing] = useState(isAdding);

    // State for history
    const [borrowHistory, setBorrowHistory] = useState([]);

    const initialFormState = {
        name: '', major: '', email: '', phoneNumber: ''
    };

    // --- Fetching Student Details and History ---
    useEffect(() => {
        if (!isAdding && studentId) {
            const fetchData = async () => {
                try {
                    const studentData = await studentApi.getStudentById(studentId);
                    setStudent(studentData);
                    setFormData(studentData);

                    // Fetch Borrow History (Backend endpoint is already defined)
                    const historyData = await borrowApi.getStudentHistory(studentId);
                    setBorrowHistory(historyData);

                } catch (error) {
                    console.error("Failed to load student data or history:", error);
                    alert("Error loading student data. Check API.");
                    navigate('/admin/students');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else if (isAdding) {
            setFormData(initialFormState);
            setLoading(false);
        }
    }, [studentId, isAdding, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- CRUD Actions ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        // The implementation for creating a new user involves a temporary password which
        // should be handled in a dedicated form, but for this generic view:
        if (isAdding) {
            alert("Use the dedicated Add New Student button on the Student List page or ensure password is handled separately.");
            return;
        }

        try {
            const updatedStudent = await studentApi.updateStudent(studentId, formData);
            setStudent(updatedStudent);
            setIsEditing(false);
            // toast.success("Student details updated successfully!");
        } catch (error) {
            alert("Failed to update student details.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete student ID: ${studentId}? This will remove their login account.`)) {
            try {
                await studentApi.deleteStudent(studentId);
                alert("Student deleted successfully.");
                navigate('/admin/students');
            } catch (error) {
                alert(`Error deleting student: ${error.response?.data?.message}`);
            }
        }
    };


    if (loading) return <h2>Loading Student Details...</h2>;

    return (
        <DetailContainer>
            <h2><FaUserGraduate style={{ marginRight: '10px' }} /> Student Profile</h2>
            <p style={{marginBottom: '20px', color: 'var(--color-secondary)'}}>
                {isEditing ? 'Editing Student Details' : `Student ID: ${studentId}`}
            </p>

            {/* --- Student Details Form --- */}
            <form onSubmit={handleSubmit}>
                <FormRow>
                    <label>Student ID</label>
                    <input type="text" value={studentId} disabled />
                </FormRow>

                <FormRow>
                    <label htmlFor="name">Full Name</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} disabled={!isEditing} required />
                </FormRow>

                <FormRow>
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} disabled={!isEditing} required />
                </FormRow>

                <FormRow>
                    <label htmlFor="major">Major / Dept.</label>
                    <input type="text" name="major" value={formData.major || ''} onChange={handleChange} disabled={!isEditing} />
                </FormRow>

                <div style={{ marginTop: '30px' }}>
                    {isEditing ? (
                        <Button type="submit" style={{ backgroundColor: 'var(--color-accent)' }}>
                            <FaSave /> Save Changes
                        </Button>
                    ) : (
                        <>
                            <Button type="button" onClick={() => setIsEditing(true)} style={{ backgroundColor: 'var(--color-primary)' }}>
                                <FaRegEdit /> Edit Details
                            </Button>
                            <Button type="button" onClick={handleDelete} style={{ backgroundColor: 'var(--color-danger)', marginLeft: '10px' }}>
                                <FaTimesCircle /> Delete Student
                            </Button>
                        </>
                    )}
                    <Button type="button" onClick={() => navigate('/admin/students')} style={{ marginLeft: '10px' }}>
                        Back to List
                    </Button>
                </div>
            </form>

            {/* --- Student History Table --- */}
            <SectionHeader><FaHistory style={{ marginRight: '10px' }} /> Borrowing History</SectionHeader>

            {borrowHistory.length === 0 ? (
                <p style={{ marginTop: '10px' }}>This student has no past borrowing history recorded.</p>
            ) : (
                <table style={{ width: '100%', marginTop: '15px' }}>
                    <thead>
                        <tr>
                            <th>Book ID</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Return Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {borrowHistory.map(record => (
                            <tr key={record.id}>
                                <td>{record.bookId}</td>
                                <td>{new Date(record.issueDate).toLocaleDateString()}</td>
                                <td>{new Date(record.dueDate).toLocaleDateString()}</td>
                                <td>{record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '—'}</td>
                                <td><StatusPill $status={record.status}>{record.status}</StatusPill></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </DetailContainer>
    );
};

export default StudentDetail;