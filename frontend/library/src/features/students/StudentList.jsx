import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaUserPlus, FaSearch, FaRegEdit, FaTimesCircle } from 'react-icons/fa';
import Button from '../../components/Button';
import studentApi from '../../api/studentApi';
import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';

// --- STYLED COMPONENTS (No Change) ---
const StudentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const Controls = styled.div`
  display: flex;
  gap: var(--spacing-md);
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  width: 300px;
  position: relative;

  input {
    padding-left: 40px;
    margin-bottom: 0;
  }

  svg {
    position: absolute;
    left: 15px;
    color: var(--color-secondary);
  }
`;

const TableWrapper = styled.div`
  background-color: var(--color-card);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
`;
// --- END STYLED COMPONENTS ---


const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // --- Data Fetching and Filtering Logic ---
  const fetchStudents = useCallback(async (query) => {
    setLoading(true);
    try {
      // 1. Fetch ALL students from the protected endpoint
      const data = await studentApi.getAllStudents();

      let studentsToShow = data;

      // 2. Perform client-side filtering if a query is present
      if (query && query.trim() !== "") {
          const lowerCaseQuery = query.toLowerCase();
          studentsToShow = data.filter(s =>
              s.name.toLowerCase().includes(lowerCaseQuery) ||
              s.studentId.toLowerCase().includes(lowerCaseQuery) ||
              s.email.toLowerCase().includes(lowerCaseQuery)
          );
      }

      // Ensure data is an array before setting state, preventing crashes
      if (Array.isArray(studentsToShow)) {
          setStudents(studentsToShow);
      } else {
          // If data isn't an array (e.g., API returned an object error), fail gracefully
          setStudents([]);
          console.error("API response was not an array of students:", studentsToShow);
      }

    } catch (error) {
      // This catch block executes when the 403 Forbidden error occurs.
      console.error("Failed to fetch student data: Authorization or Network Error:", error);
      // Display empty list on failure, assuming the 403 issue persists until login refresh.
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. useEffect Hook (Triggers data fetch on mount and search term change)
  useEffect(() => {
    fetchStudents(searchTerm);
  }, [fetchStudents, searchTerm]);

  // --- Action Handlers ---

  const handleDelete = async (studentId) => {
    if (window.confirm(`Are you sure you want to delete student ID: ${studentId}?`)) {
        try {
            await studentApi.deleteStudent(studentId);
            // toast.success("Student deleted successfully.");
            fetchStudents(searchTerm); // Refresh the list
        } catch (error) {
            // toast.error("Failed to delete student.");
            console.error(error);
        }
    }
  };

  const handleSearchSubmit = (e) => {
      e.preventDefault();
      // Forces an immediate filter based on the current search term
      fetchStudents(searchTerm);
  };

  if (loading) return <h2>Loading Students...</h2>;

  // The final render check: If students array is empty, show a message
  if (students.length === 0 && !loading) {
      return (
          <>
              <StudentHeader>
                  <h2>Student Records Management</h2>
                  <Controls>
                      <Button onClick={() => navigate('/admin/students/add')} style={{ backgroundColor: 'var(--color-accent)' }}>
                          <FaUserPlus /> Add New Student
                      </Button>
                  </Controls>
              </StudentHeader>
              <p style={{ marginTop: '20px', padding: '20px', border: '1px solid #ffc107', backgroundColor: '#fffbe6' }}>
                 No student records found or authorized access failed. Please ensure you are logged in as an ADMIN and try importing data.
              </p>
          </>
      );
  }

  return (
    <>
      <StudentHeader>
        <h2>Student Records Management</h2>
        <Controls>
          <Button onClick={() => navigate('/admin/students/add')} style={{ backgroundColor: 'var(--color-accent)' }}>
            <FaUserPlus /> Add New Student
          </Button>
        </Controls>
      </StudentHeader>

      <form onSubmit={handleSearchSubmit}>
          <SearchBar>
            <FaSearch />
            <input
              type="text"
              placeholder="Search by Name or Student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" style={{ marginLeft: '10px' }}>Search</Button>
          </SearchBar>
      </form>

      <TableWrapper>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 'var(--spacing-md)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Student ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Major</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.studentId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', fontWeight: '600' }}>{student.studentId}</td>
                <td style={{ padding: '10px' }}>{student.name}</td>
                <td style={{ padding: '10px' }}>{student.major}</td>
                <td style={{ padding: '10px' }}>{student.email}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <Button
                    onClick={() => navigate(`/admin/students/details/${student.studentId}`)}
                    style={{ backgroundColor: 'var(--color-primary)', marginRight: '10px' }}
                  >
                    <FaRegEdit /> Details
                  </Button>
                  <Button
                    onClick={() => handleDelete(student.studentId)}
                    style={{ backgroundColor: 'var(--color-danger)' }}
                  >
                    <FaTimesCircle /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </>
  );
};

export default StudentList;