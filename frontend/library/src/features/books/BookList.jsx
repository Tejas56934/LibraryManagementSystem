// frontend/src/features/books/BookList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaPlus, FaCloudUploadAlt, FaSearch, FaRegEdit, FaMapMarkerAlt, FaLayerGroup } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import bookApi from '../../api/bookApi';
import { useDispatch, useSelector } from 'react-redux'; // Added useSelector
import { placeHold } from '../borrow/ReservationSlice';

// --- STYLED COMPONENTS ---
const PageWrap = styled.div`
  padding: calc(var(--spacing-xl) * 1.2);
  display: flex;
  justify-content: center;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1600px;
`;

const InventoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TitleBlock = styled.div`
  h2 {
    margin: 0;
    font-size: 1.6rem;
    color: #111827;
    font-weight: 800;
  }
  p {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 1rem;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchBar = styled.form`
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  width: 400px;

  input {
    border: none;
    padding: 8px;
    width: 100%;
    outline: none;
    font-size: 0.95rem;
  }

  svg { color: #9ca3af; }
`;

const TableWrapper = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  thead {
    background-color: #f3f4f6;
    border-bottom: 2px solid #e5e7eb;
  }

  thead th {
    text-align: left;
    padding: 16px;
    font-weight: 700;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  tbody td {
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
    color: #374151;
    vertical-align: middle;
  }

  tbody tr:hover {
    background-color: #f9fafb;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$type === 'shelf' ? '#eff6ff' : '#f5f3ff'};
  color: ${props => props.$type === 'shelf' ? '#1d4ed8' : '#6d28d9'};
  border: 1px solid ${props => props.$type === 'shelf' ? '#bfdbfe' : '#ddd6fe'};
`;

const StatusPill = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${props => props.$available > 0 ? '#065f46' : '#991b1b'};
  background: ${props => props.$available > 0 ? '#d1fae5' : '#fee2e2'};
`;

const BookList = ({ viewMode = 'student' }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- 1. Get Logged-in User Data ---
  const { user } = useSelector(state => state.auth);
  // Robustly get student ID from either 'studentId' or 'id' property
  const studentId = user?.studentId || user?.id;

  const isLibrarian = viewMode === 'admin';

  const fetchBooks = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const data = isLibrarian
        ? await bookApi.getAllBooksAdmin(query)
        : await bookApi.getAvailableBooks(query);
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [isLibrarian]);

  useEffect(() => {
    fetchBooks(searchTerm);
  }, [fetchBooks, searchTerm]);

  // --- 2. Dynamic Reservation Handler ---
  const handleReserve = async (bookId) => {
    if (!studentId) {
      alert("You must be logged in as a student to place a hold.");
      return;
    }

    try {
      // Dispatch placeHold with the REAL studentId
      await dispatch(placeHold({ bookId, studentId })).unwrap();
      alert('Book reserved successfully! Check your Reservations page.');
      fetchBooks(searchTerm); // Refresh list to update availability if needed
    } catch (error) {
      alert('Reservation Failed: ' + (error.message || "Unknown error"));
    }
  };

  return (
    <PageWrap>
      <Container>
        <InventoryHeader>
          <TitleBlock>
            <h2>{isLibrarian ? 'Library Inventory Management' : 'Library Catalog'}</h2>
            <p>{isLibrarian ? 'Monitor stock, locations, and pricing.' : 'Explore our collection and reserve your next read.'}</p>
          </TitleBlock>

          <Controls>
            <SearchBar onSubmit={(e) => { e.preventDefault(); fetchBooks(searchTerm); }}>
              <FaSearch />
              <input
                type="text"
                placeholder="Search Title, Author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBar>

            {isLibrarian && (
              <>
                <Button onClick={() => navigate('/admin/books/add')} style={{ backgroundColor: '#10b981', color: 'white' }}>
                  <FaPlus /> Add New
                </Button>
                <Button onClick={() => navigate('/admin/books/import')} style={{ backgroundColor: '#6366f1', color: 'white' }}>
                  <FaCloudUploadAlt /> Import
                </Button>
              </>
            )}
          </Controls>
        </InventoryHeader>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading Inventory...</p>
        ) : (
          <TableWrapper>
            <StyledTable>
              <thead>
                <tr>
                  <th>Book ID</th>
                  <th>Book Details</th>
                  <th>Category</th>
                  <th>Location Mapping</th>
                  <th>Pricing</th>
                  <th style={{ textAlign: 'center' }}>Stock Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.bookId}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4b5563' }}>
                      {book.bookId}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{book.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>by {book.author}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ISBN: {book.isbn || 'N/A'}</div>
                    </td>
                    <td>
                      <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {book.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Badge $type="shelf"><FaMapMarkerAlt size={10} /> {book.shelfCode || 'No Shelf'}</Badge>
                        <Badge $type="rack"><FaLayerGroup size={10} /> {book.rackNumber || 'No Rack'}</Badge>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#059669' }}>
                      ${book.price?.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <StatusPill $available={book.availableStock}>
                          {book.availableStock > 0 ? 'Available' : 'Out of Stock'}
                        </StatusPill>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {book.availableStock} / {book.totalStock} Copies
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isLibrarian ? (
                        <Button
                          onClick={() => navigate(`/admin/books/manage/${book.bookId}`)}
                          style={{ backgroundColor: '#3b82f6', padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          <FaRegEdit /> Manage
                        </Button>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {/* --- 3. Corrected Student Navigation --- */}
                          <Button
                            onClick={() => navigate(`/student/books/${book.bookId}`)}
                            style={{ background: '#10b981', padding: '6px 12px', fontSize: '0.85rem' }}
                          >
                            View
                          </Button>

                          {book.availableStock <= 0 && (
                            <Button
                              onClick={() => handleReserve(book.bookId)}
                              style={{ backgroundColor: '#f59e0b', padding: '6px 12px', fontSize: '0.85rem' }}
                            >
                              Reserve
                            </Button>
                          )}
                        </div>
                      )}
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