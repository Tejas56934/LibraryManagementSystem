import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaUserPlus, FaSearch, FaRegEdit, FaTimesCircle, FaUsers, FaEnvelope, FaGraduationCap } from 'react-icons/fa';
import Button from '../../components/Button';
import studentApi from '../../api/studentApi';
import { useNavigate } from 'react-router-dom';

// --- ENHANCED STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: 10px;
`;

const StudentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TitleGroup = styled.div`
  h2 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 0.95rem;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
`;

const SearchForm = styled.form`
  display: flex;
  background: white;
  padding: 6px 6px 6px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 450px;
  align-items: center;
  margin-bottom: 2rem;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--color-primary);
  }

  svg {
    color: #94a3b8;
    margin-right: 12px;
  }

  input {
    border: none;
    outline: none;
    flex: 1;
    font-size: 0.95rem;
    background: transparent;
    padding: 8px 0;
  }
`;

const TableWrapper = styled.div`
  background-color: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
  }

  th {
    padding: 16px;
    text-align: left;
    color: #475569;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  tbody tr {
    transition: background-color 0.2s;
    border-bottom: 1px solid #f1f5f9;

    &:hover {
      background-color: #f1f5f9;
    }
  }

  td {
    padding: 16px;
    color: #334155;
    font-size: 0.95rem;
    vertical-align: middle;
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  margin-right: 12px;
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
  color: #64748b;

  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

// --- COMPONENT LOGIC ---

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchStudents = useCallback(async (query) => {
    setLoading(true);
    try {
      const data = await studentApi.getAllStudents();
      let studentsToShow = data;

      if (query && query.trim() !== "") {
          const lowerCaseQuery = query.toLowerCase();
          studentsToShow = data.filter(s =>
              s.name.toLowerCase().includes(lowerCaseQuery) ||
              s.studentId.toLowerCase().includes(lowerCaseQuery) ||
              s.email.toLowerCase().includes(lowerCaseQuery)
          );
      }

      if (Array.isArray(studentsToShow)) {
          setStudents(studentsToShow);
      } else {
          setStudents([]);
      }
    } catch (error) {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(searchTerm);
  }, [fetchStudents, searchTerm]); // Note: Ensure dependency is fetchStudents if that's the name

  const handleDelete = async (studentId) => {
    if (window.confirm(`Are you sure you want to delete student ID: ${studentId}?`)) {
        try {
            await studentApi.deleteStudent(studentId);
            fetchStudents(searchTerm);
        } catch (error) {
            console.error(error);
        }
    }
  };

  const handleSearchSubmit = (e) => {
      e.preventDefault();
      fetchStudents(searchTerm);
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
        <h2>Loading Records...</h2>
    </div>
  );

  return (
    <PageContainer>
      <StudentHeader>
        <TitleGroup>
            <h2><FaUsers /> Student Records</h2>
            <p>Managing {students.length} registered students</p>
        </TitleGroup>
        <Controls>
          <Button onClick={() => navigate('/admin/students/add')} style={{ backgroundColor: 'var(--color-accent)', padding: '10px 20px', borderRadius: '10px' }}>
            <FaUserPlus style={{ marginRight: '8px' }} /> Add New Student
          </Button>
        </Controls>
      </StudentHeader>

      <SearchForm onSubmit={handleSearchSubmit}>
        <FaSearch />
        <input
          type="text"
          placeholder="Search by Name, ID, or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" style={{ borderRadius: '8px' }}>Search</Button>
      </SearchForm>

      {students.length === 0 ? (
        <EmptyState>
            <FaUsers />
            <h3>No Records Found</h3>
            <p>We couldn't find any student matches. Try a different search or add a new record.</p>
        </EmptyState>
      ) : (
        <TableWrapper>
          <StyledTable>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th><FaGraduationCap style={{marginRight: '6px'}}/> Major</th>
                <th><FaEnvelope style={{marginRight: '6px'}}/> Email</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.studentId}>
                  <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{student.studentId}</td>
                  <td>
                    <StudentInfo>
                        <Avatar>{student.name.charAt(0)}</Avatar>
                        {student.name}
                    </StudentInfo>
                  </td>
                  <td>{student.major}</td>
                  <td>{student.email}</td>
                  <td>
                    <ActionGroup>
                      <Button
                        onClick={() => navigate(`/admin/students/details/${student.studentId}`)}
                        style={{ backgroundColor: 'var(--color-primary)', padding: '8px 12px', fontSize: '0.85rem' }}
                      >
                        <FaRegEdit /> Details
                      </Button>
                      <Button
                        onClick={() => handleDelete(student.studentId)}
                        style={{ backgroundColor: 'var(--color-danger)', padding: '8px 12px', fontSize: '0.85rem' }}
                      >
                        <FaTimesCircle /> Delete
                      </Button>
                    </ActionGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableWrapper>
      )}
    </PageContainer>
  );
};

export default StudentList;