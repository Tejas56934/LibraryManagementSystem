import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaPlus, FaCloudUploadAlt, FaSearch, FaBookReader, FaRegEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import bookApi from '../../api/bookApi';
// Import Reservation logic and Redux dispatch
import { useDispatch } from 'react-redux';
import { placeHold } from '../borrow/ReservationSlice';

// --- STYLED COMPONENTS (Retained for consistency) ---
const PageWrap = styled.div`
  padding: calc(var(--spacing-xl) * 1.2);
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1100px;
`;

/* Header & Controls */
const InventoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: calc(var(--spacing-lg) + 6px);
  flex-wrap: wrap;
`;

const TitleBlock = styled.div`
  h2 {
    margin: 0;
    font-size: 1.45rem;
    color: #111827;
    font-weight: 700;
  }
  p {
    margin: 6px 0 0;
    color: #6b7280;
    font-size: 0.95rem;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
`;

/* Search */
const SearchBar = styled.form`
  display: flex;
  align-items: center;
  width: 340px;
  position: relative;
  background: #ffffff;
  border: 1px solid rgba(18,18,20,0.06);
  padding: 6px;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(30, 40, 50, 0.04);

  input {
    border: none;
    padding: 10px 12px 10px 40px;
    width: 100%;
    outline: none;
    font-size: 0.95rem;
    color: #111827;
    background: transparent;
  }

  svg {
    position: absolute;
    left: 12px;
    color: #9ca3af;
    font-size: 0.95rem;
  }

  button {
    margin-left: 8px;
  }

  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 10px;
  width: 320px;
  transition: 0.2s ease;

  &:focus {
    outline: none;
    border-color: #444;
  }

  @media (max-width: 820px) {
    width: 100%;
  }

`;

/* Table wrapper */
const TableWrapper = styled.div`
  background: #ffffff;
  padding: var(--spacing-md);
  border-radius: 12px;
  border: 1px solid rgba(18,18,20,0.06);
  box-shadow: 0 8px 30px rgba(30,40,50,0.04);
  overflow-x: auto;
`;

/* Table */
const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--spacing-md);
  font-size: 0.95rem;
  color: #111827;

  thead th {
    text-align: left;
    padding: 12px;
    font-weight: 700;
    color: #374151;
    border-bottom: 1px solid rgba(18,18,20,0.06);
    position: sticky;
    top: 0;
    background: #ffffff;
  }

  tbody td {
    padding: 12px;
    border-bottom: 1px solid rgba(18,18,20,0.04);
    vertical-align: middle;
  }

  tbody tr:hover {
    background: rgba(15, 23, 42, 0.02);
  }
`;

/* Status pill */
const StatusPill = styled.span`
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(props) => (props.$available > 0 ? '#065f46' : '#7f1d1d')};
  background-color: ${(props) => (props.$available > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)')};
  border: 1px solid ${(props) => (props.$available > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)')};
`;

/* Small action button group */
const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;


const BookList = ({ viewMode = 'student' }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize Redux dispatch

  const isLibrarian = viewMode === 'admin';

  // --- Data Fetching Logic (useCallback relies on these) ---
  const fetchBooks = useCallback(async (query = '') => {
      setLoading(true);
      try {
        let data;
        if (isLibrarian) {
          // ADMIN calls search (returns ALL books)
          data = await bookApi.getAllBooksAdmin(query);
        } else {
          // STUDENT calls available endpoint
          data = await bookApi.getAvailableBooks(query);
        }

        if (Array.isArray(data)) {
            setBooks(data);
        } else {
            setBooks([]);
            console.error("API did not return an array for book list:", data);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
  }, [isLibrarian]);

  useEffect(() => {
    fetchBooks(searchTerm);
  }, [viewMode, fetchBooks, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(searchTerm);
  };

  // --- Student Action: Reservation (Integrated with Redux) ---
  const handleReserve = async (bookId) => {
    // Assuming loggedInUser and studentId are available via useSelector in a real scenario
    // const studentId = useSelector(state => state.auth.user.studentId);
    const placeholderStudentId = 'S-TEST-001'; // Placeholder

    try {
      // Use Redux thunk to place the hold (Req 7)
      await dispatch(placeHold({ bookId, studentId: placeholderStudentId })).unwrap();

      alert('Book reserved successfully! You will be notified when it is available.');
    } catch (error) {
      // The error object comes from the rejected promise payload
      const errorMessage = error.response?.data?.message || "Failed to place reservation. Maybe you already reserved it?";
      alert('Reservation Failed: ' + errorMessage);
    }
  };

  // --- Student Action: View Book Details (CRITICAL FIX) ---
  const handleViewBookDetail = (bookId) => {
      // Navigate to the student detail route
      navigate(`/student/books/${bookId}`);
  };


  return (
    <PageWrap>
      <Container>
        <InventoryHeader>
          <TitleBlock>
            <h2>{isLibrarian ? 'Library Inventory Management' : 'Browse Available Books'}</h2>
            <p>{isLibrarian ? 'Manage library stock and details.' : 'Search and reserve books available to you.'}</p>
          </TitleBlock>

          <Controls>
            <SearchBar onSubmit={handleSearch}>
              <FaSearch />
              <input
                type="text"
                placeholder="Search by Title, Author, or Book ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" style={{ padding: '8px 12px', borderRadius: 8 }}>Search</Button>
            </SearchBar>

            {isLibrarian && (
              <>
                <Button onClick={() => navigate('/admin/books/add')} style={{ backgroundColor: 'var(--color-accent)', padding: '8px 12px', borderRadius: 8 }}>
                  <FaPlus style={{ marginRight: 8 }} /> Add New Book
                </Button>
                <Button onClick={() => navigate('/admin/books/import')} style={{ padding: '8px 12px', borderRadius: 8 }}>
                  <FaCloudUploadAlt style={{ marginRight: 8 }} /> Import Excel
                </Button>
              </>
            )}
          </Controls>
        </InventoryHeader>

        {loading ? (
          <p>Loading book data...</p>
        ) : (
          <TableWrapper>
            <StyledTable className="data-table" role="table" aria-label="Book inventory table">
              <thead>
                <tr>
                  <th>Book ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Available</th>
                  {isLibrarian && <th style={{ textAlign: 'center' }}>Total Stock</th>}
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr key={book.bookId}>
                    <td>{book.bookId}</td>
                    <td style={{ fontWeight: 600 }}>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.category}</td>
                    <td style={{ textAlign: 'center' }}>
                      <StatusPill $available={book.availableStock}>
                        {book.availableStock > 0 ? 'Available' : 'Out of Stock'}
                      </StatusPill>
                    </td>
                    {isLibrarian && <td style={{ textAlign: 'center' }}>{book.totalStock}</td>}
                    <td style={{ textAlign: 'center' }}>
                        <ActionGroup>
                          {isLibrarian ? (
                              // ADMIN: MANAGE Button
                              <Button
                                  onClick={() => navigate(`/admin/books/manage/${book.bookId}`)} // ADMIN CRUD PATH
                                  style={{ backgroundColor: 'var(--color-primary)', padding: '8px 10px', borderRadius: 8 }}
                              >
                                  <FaRegEdit /> Manage
                              </Button>
                          ) : (
                              // STUDENT: RESERVE or VIEW Button
                              book.availableStock <= 0 ? (
                                // Student: Reserve (Req 7)
                                <Button onClick={() => handleReserve(book.bookId)} style={{ padding: '8px 10px', borderRadius: 8, backgroundColor: '#f59e0b' }}>
                                  <FaBookReader /> Reserve
                                </Button>
                              ) : (
                                // Student: View/Borrow (Req 6) - CRITICAL FIX
                                <Button
                                    onClick={() => handleViewBookDetail(book.bookId)} // Navigate to detail page
                                    style={{ padding: '8px 10px', borderRadius: 8, background: '#22c55e', color: '#fff' }}
                                >
                                  View
                                </Button>
                              )
                          )}
                        </ActionGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </TableWrapper>
        )}
      </Container>
    </PageWrap>
  );
};

export default BookList;