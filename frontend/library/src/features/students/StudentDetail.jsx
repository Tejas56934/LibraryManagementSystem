import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import studentApi from '../../api/studentApi';
import borrowApi from '../../api/borrowApi';
import Button from '../../components/Button';
import {
    FaUserGraduate, FaSave, FaRegEdit, FaTimesCircle,
    FaHistory, FaEnvelope, FaIdCard, FaUniversity
} from 'react-icons/fa';

// --- Styled Components ---

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
  background-color: var(--color-background);
  min-height: 100vh;
`;

const DetailContainer = styled.div`
  background-color: #ffffff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 900px;
  border: 1px solid #eaeaea;
`;

const ProfileHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 20px;

    .title-area {
        h2 {
            margin: 0;
            font-size: 1.8rem;
            color: #1a1a1a;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        p {
            margin: 5px 0 0 0;
            color: #666;
            font-weight: 500;
        }
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormRow = styled.div`
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
        padding: 12px 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.2s ease;
        background-color: #fff;

        &:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
            outline: none;
        }

        &:disabled {
            background-color: #f9f9f9;
            color: #888;
            cursor: not-allowed;
            border-style: dashed;
        }
    }
`;

const SectionHeader = styled.h3`
    margin-top: 40px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.3rem;
    color: var(--color-primary);
    background: rgba(var(--color-primary-rgb), 0.05);
    padding: 10px 15px;
    border-radius: 8px;
`;

const TableWrapper = styled.div`
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid #eee;
`;

const HistoryTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;

    thead {
        background-color: #f8f9fa;
        tr th {
            padding: 15px;
            text-align: left;
            color: #555;
            font-weight: 700;
            border-bottom: 2px solid #eee;
        }
    }

    tbody tr {
        border-bottom: 1px solid #f1f1f1;
        transition: background 0.2s;
        &:hover { background-color: #fcfcfc; }

        td { padding: 15px; color: #333; }
    }
`;

const StatusPill = styled.span`
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: white;
    background-color: ${(props) => {
        if (props.$status === 'OVERDUE') return '#e74c3c';
        if (props.$status === 'ISSUED') return '#3498db';
        return '#95a5a6';
    }};
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    padding-top: 20px;
`;

// --- Main Component ---

const StudentDetail = ({ isAdding }) => {
    const { studentId } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(!isAdding);
    const [isEditing, setIsEditing] = useState(isAdding);
    const [borrowHistory, setBorrowHistory] = useState([]);

    const initialFormState = {
        name: '', major: '', email: '', phoneNumber: ''
    };

    useEffect(() => {
        if (!isAdding && studentId) {
            const fetchData = async () => {
                try {
                    const studentData = await studentApi.getStudentById(studentId);
                    setStudent(studentData);
                    setFormData(studentData);
                    const historyData = await borrowApi.getStudentHistory(studentId);
                    setBorrowHistory(historyData);
                } catch (error) {
                    console.error("Failed to load student data:", error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isAdding) {
            alert("Use the dedicated Add New Student button on the Student List page.");
            return;
        }
        try {
            const updatedStudent = await studentApi.updateStudent(studentId, formData);
            setStudent(updatedStudent);
            setIsEditing(false);
        } catch (error) {
            alert("Failed to update student details.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Delete student ID: ${studentId}?`)) {
            try {
                await studentApi.deleteStudent(studentId);
                alert("Student deleted.");
                navigate('/admin/students');
            } catch (error) {
                alert(`Error: ${error.response?.data?.message}`);
            }
        }
    };

    if (loading) return <PageWrapper><h2>Loading Student Details...</h2></PageWrapper>;

    return (
        <PageWrapper>
            <DetailContainer>
                <ProfileHeader>
                    <div className="title-area">
                        <h2><FaUserGraduate color="var(--color-primary)" /> Student Profile</h2>
                        <p>{isEditing ? 'Mode: Editing Details' : `Reference ID: ${studentId}`}</p>
                    </div>
                </ProfileHeader>

                <form onSubmit={handleSubmit}>
                    <FormGrid>
                        <FormRow>
                            <label><FaIdCard /> Student ID</label>
                            <input type="text" value={studentId} disabled />
                        </FormRow>

                        <FormRow>
                            <label htmlFor="name"><FaUserGraduate /> Full Name</label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} disabled={!isEditing} required />
                        </FormRow>

                        <FormRow>
                            <label htmlFor="email"><FaEnvelope /> Email Address</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} disabled={!isEditing} required />
                        </FormRow>

                        <FormRow>
                            <label htmlFor="major"><FaUniversity /> Major / Department</label>
                            <input type="text" name="major" value={formData.major || ''} onChange={handleChange} disabled={!isEditing} />
                        </FormRow>
                    </FormGrid>

                    <ButtonGroup>
                        {isEditing ? (
                            <Button type="submit" style={{ backgroundColor: 'var(--color-accent)', padding: '12px 25px' }}>
                                <FaSave style={{ marginRight: '8px' }} /> Save Changes
                            </Button>
                        ) : (
                            <>
                                <Button type="button" onClick={() => setIsEditing(true)} style={{ backgroundColor: 'var(--color-primary)', padding: '12px 25px' }}>
                                    <FaRegEdit style={{ marginRight: '8px' }} /> Edit Details
                                </Button>
                                <Button type="button" onClick={handleDelete} style={{ backgroundColor: 'var(--color-danger)', padding: '12px 25px' }}>
                                    <FaTimesCircle style={{ marginRight: '8px' }} /> Delete Student
                                </Button>
                            </>
                        )}
                        <Button type="button" onClick={() => navigate('/admin/students')} style={{ backgroundColor: '#666', padding: '12px 25px' }}>
                            Back to List
                        </Button>
                    </ButtonGroup>
                </form>

                <SectionHeader><FaHistory /> Borrowing History</SectionHeader>

                {borrowHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', background: '#f9f9f9', borderRadius: '12px', color: '#888' }}>
                        No past borrowing history recorded for this student.
                    </div>
                ) : (
                    <TableWrapper>
                        <HistoryTable>
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
                                        <td style={{ fontWeight: 'bold' }}>{record.bookId}</td>
                                        <td>{new Date(record.issueDate).toLocaleDateString()}</td>
                                        <td>{new Date(record.dueDate).toLocaleDateString()}</td>
                                        <td>{record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '—'}</td>
                                        <td><StatusPill $status={record.status}>{record.status}</StatusPill></td>
                                    </tr>
                                ))}
                            </tbody>
                        </HistoryTable>
                    </TableWrapper>
                )}
            </DetailContainer>
        </PageWrapper>
    );
};

export default StudentDetail;