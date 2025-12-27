import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import bookApi from '../../api/bookApi';
import Button from '../../components/Button';
import { FaBook, FaSave, FaTimesCircle, FaRegEdit, FaExclamationCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { placeHold } from '../borrow/ReservationSlice'; // CRITICAL: Import Req 7 action

// --- STYLED COMPONENTS (No changes needed here) ---
const PageWrap = styled.div`
  padding: calc(var(--spacing-xl) * 1.2);
  display: flex;
  justify-content: center;
`;

const DetailContainer = styled.div`
  background: #ffffff;
  padding: calc(var(--spacing-xl) + 8px);
  border-radius: 12px;
  border: 1px solid rgba(18, 18, 20, 0.06);
  box-shadow: 0 6px 20px rgba(30, 40, 50, 0.06);
  width: 100%;
  max-width: 880px;
  transition: box-shadow 0.2s ease;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);

  h2 {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.4rem;
    margin: 0;
    color: #111827;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.95rem;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;

  & > div {
    flex: 1;
    min-width: 220px;
  }

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    color: #111827;
    font-size: 0.92rem;
  }

  input[type="text"],
  input[type="number"] {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(18, 18, 20, 0.08);
    border-radius: 8px;
    font-size: 0.95rem;
    color: #111827;
    background: #ffffff;
    outline: none;
    transition: box-shadow 0.12s ease, border-color 0.12s ease;
  }

  input:disabled {
    background: #f9fafb;
    color: #6b7280;
  }

  input:focus {
    box-shadow: 0 4px 12px rgba(59,130,246,0.08);
    border-color: rgba(59,130,246,0.6);
  }
`;

// Action row
const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 30px;
  flex-wrap: wrap;
  align-items: center;

  .muted {
    background: transparent;
    border: 1px solid rgba(16,24,40,0.06);
    color: #374151;
  }
`;

// Small helper text
const MetaText = styled.div`
  margin-top: 8px;
  color: #6b7280;
  font-size: 0.9rem;
`;

const AvailabilityText = styled.div`
    font-weight: 600;
    padding: 10px 15px;
    border-radius: 8px;
    text-align: center;
    margin-bottom: var(--spacing-md);
    background: ${props => props.$isAvailable ? '#f0fff4' : '#fff3f4'};
    color: ${props => props.$isAvailable ? '#10b981' : '#ef4444'};
    border: 1px solid ${props => props.$isAvailable ? '#34d399' : '#f87171'};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
`;
// --- END STYLED COMPONENTS ---

const BookDetail = ({ viewMode = 'admin' }) => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get logged-in user data for student mode (Req 7)
    const { user: loggedInUser } = useSelector(state => state.auth);
    const studentId = loggedInUser?.studentId || loggedInUser?.id;

    // Check if we are in 'add new book' mode (bookId will be 'add')
    const isAdding = bookId === 'add' && viewMode === 'admin';
    const isAdminMode = viewMode === 'admin';

    const [book, setBook] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(!isAdding);
    const [isEditing, setIsEditing] = useState(isAdding);
    const [apiError, setApiError] = useState(null);
    const [disableSubmit, setDisableSubmit] = useState(false); // CRITICAL: State for disabling submit

    // Initial state for a new book (used when isAdding is true)
    const initialFormState = {
        title: '', author: '', isbn: '', totalStock: 1, category: '', price: 0.00
    };

    // --- Data Fetching Hook (Made into useCallback for stability) ---
    const fetchBookData = useCallback(async (id) => {
        setLoading(true);
        setApiError(null);
        try {
            const data = await bookApi.getBookById(id);
            setBook(data);
            setFormData(data);
            return data;
        } catch (error) {
            setApiError(`Failed to load book ${id}.`);
            console.error("Error loading book for detail view:", error);
            if (isAdminMode) navigate('/admin/books');
            return null;
        } finally {
            setLoading(false);
        }
    }, [isAdminMode, navigate]);

    // --- Lifecycle to fetch data ---
    useEffect(() => {
        if (!isAdding && bookId) {
            fetchBookData(bookId);
        } else if (isAdding) {
            setFormData(initialFormState);
        }
    }, [bookId, isAdding, fetchBookData]); // Dependency array now uses the stable fetchBookData

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            // Convert stock and price to numbers
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        });
    };

    // --- Handler to enter edit mode safely ---
    const handleEditClick = () => {
        setIsEditing(true);
        // CRITICAL FIX: Temporarily disable submit button to prevent race condition click
        setDisableSubmit(true);
        setTimeout(() => setDisableSubmit(false), 300); // Re-enable after 300ms
    };

    // --- CRUD Actions (Admin Only) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdminMode) return;

        // Final sanity check
        if (disableSubmit) {
            alert("Please wait a moment before submitting.");
            return;
        }

        try {
            if (isAdding) {
                // ACTION: CREATE new book
                await bookApi.addBook(formData);
                alert("New book added successfully!");
                navigate('/admin/books');

            } else {
                // ACTION: UPDATE existing book
                await bookApi.updateBook(bookId, formData);
                alert("Book details updated successfully!");

                // Update the 'book' state with the new 'formData' and exit editing mode.
                setBook(formData);
                setIsEditing(false);
            }
        } catch (error) {
            const msg = error.response?.data?.message || (isAdding ? 'Failed to add book.' : 'Failed to update book.');
            alert(`Error: ${msg}`);
            setApiError(msg);
        }
    };

    const handleDelete = async () => {
        if (!isAdminMode) return;

        if (window.confirm(`WARNING: Are you sure you want to delete book ID: ${bookId}? This action cannot be undone.`)) {
            try {
                await bookApi.deleteBook(bookId);
                alert("Book deleted successfully.");
                navigate('/admin/books');
            } catch (error) {
                alert(`Error deleting book: ${error.response?.data?.message}`);
            }
        }
    };

    // --- Reservation Action (Student Only - Req 7) ---
    const handlePlaceHold = () => {
        if (!studentId || !bookId) {
            alert("Login required or book details missing.");
            return;
        }

        if (window.confirm(`Confirm: Place a hold on "${book.title}"? You will be notified when it's returned.`)) {
            dispatch(placeHold({ bookId: book.bookId, studentId })) // Use book.bookId (the unique system ID)
                .unwrap()
                .then(() => {
                    alert('Hold successfully placed! Check your reservations page.');
                    // Optionally navigate to reservations page or update UI state here
                    // navigate('/student/reservations'); // Uncomment if you want immediate redirect
                })
                .catch(err => {
                    const msg = err.message || err.response?.data?.message || 'Failed to place hold.';
                    alert(`Hold Error: ${msg}`);
                    console.error("Hold placement error:", err);
                });
        }
    };


    if (loading) return <h2 style={{ textAlign: 'center' }}>Loading Book Details...</h2>;
    if (apiError && !isAdding) return <h2 style={{ textAlign: 'center', color: '#dc3545' }}>{apiError}</h2>;

    const displayBook = book || formData; // Use fetched data or form state

    const availableStock = displayBook.availableStock || 0;
    const isAvailable = availableStock > 0;
    const isOutOfStock = availableStock === 0 && displayBook.totalStock > 0;


    return (
        <PageWrap>
            <DetailContainer>
                <HeaderRow>
                    <div>
                        <h2>
                            <FaBook style={{ color: '#111827', fontSize: '1.1rem' }} />
                            {isAdminMode ?
                                (isAdding ? 'Add New Book' : `Manage Inventory: ${displayBook.title || bookId}`) :
                                `Book Details: ${displayBook.title || bookId}`
                            }
                        </h2>
                        <MetaText>
                            {isAdminMode ? (isAdding ? 'Enter all mandatory book details.' : `Book ID: ${bookId}`) : `Author: ${displayBook.author}`}
                        </MetaText>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.92rem' }}>{new Date().toLocaleDateString()}</p>
                    </div>
                </HeaderRow>

                {/* --- Availability Status (Visible in both modes) --- */}
                <AvailabilityText $isAvailable={isAvailable}>
                    {isAvailable ? (
                        <>
                            ✅ **Available:** {availableStock} {availableStock === 1 ? 'copy' : 'copies'} in stock.
                        </>
                    ) : (
                        <>
                            <FaExclamationCircle />
                            **Unavailable:** Currently out of stock. {isOutOfStock && 'Place a hold below.'}
                        </>
                    )}
                </AvailabilityText>

                <form onSubmit={handleSubmit}>
                    {/* --- Input Fields (Disabled for Student, Editable for Admin) --- */}
                    <FormRow>
                        <div>
                            <label htmlFor="title">Title</label>
                            <input type="text" id="title" name="title" value={displayBook.title || ''} onChange={handleChange} disabled={!isEditing || !isAdminMode} required />
                        </div>
                        <div>
                            <label htmlFor="author">Author</label>
                            <input type="text" id="author" name="author" value={displayBook.author || ''} onChange={handleChange} disabled={!isEditing || !isAdminMode} required />
                        </div>
                    </FormRow>

                    <FormRow>
                        <div>
                            <label htmlFor="isbn">ISBN</label>
                            <input type="text" id="isbn" name="isbn" value={displayBook.isbn || ''} onChange={handleChange} disabled={!isEditing || !isAdminMode} />
                        </div>
                        <div>
                            <label htmlFor="category">Category</label>
                            <input type="text" id="category" name="category" value={displayBook.category || ''} onChange={handleChange} disabled={!isEditing || !isAdminMode} />
                        </div>
                    </FormRow>

                    <FormRow>
                        <div>
                            <label htmlFor="totalStock">Total Stock (Copies)</label>
                            <input type="number" id="totalStock" name="totalStock" value={formData.totalStock || 0} onChange={handleChange} disabled={!isEditing || !isAdminMode} required min="0" />
                        </div>
                        {/* Only show Available Stock field for Admin */}
                        {isAdminMode && !isAdding && (
                            <div>
                                <label>Available Stock (System)</label>
                                <input type="number" value={availableStock} disabled />
                            </div>
                        )}
                    </FormRow>

                    <FormRow>
                        <div>
                            <label htmlFor="price">Price (for Procurement)</label>
                            <input type="number" id="price" name="price" value={formData.price || 0.00} onChange={handleChange} disabled={!isEditing || !isAdminMode} min="0" step="0.01" />
                        </div>
                    </FormRow>

                    {/* --- Action Buttons (Conditional Rendering based on Role) --- */}
                    <Actions>
                        {isAdminMode ? (
                            // ADMIN ACTIONS
                            isEditing ? (
                                <>
                                    <Button
                                        type="submit"
                                        disabled={disableSubmit} // <--- FIX: Prevent immediate submission
                                        style={{ backgroundColor: '#3b82f6', padding: '10px 16px', borderRadius: 8 }}
                                    >
                                        <FaSave style={{ marginRight: 8 }} /> {isAdding ? 'Save New Book' : 'Update Details'}
                                    </Button>
                                    {!isAdding && (
                                        // Cancel button reverts form data and exits editing mode
                                        <Button type="button" onClick={() => {
                                            setFormData(book);
                                            setIsEditing(false);
                                        }} className="muted" style={{ padding: '10px 14px', borderRadius: 8 }}>
                                            Cancel
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        onClick={handleEditClick} // <--- FIX: Use the safe handler
                                        style={{ backgroundColor: '#10b981', padding: '10px 14px', borderRadius: 8 }}
                                    >
                                        <FaRegEdit style={{ marginRight: 8 }} /> Edit
                                    </Button>
                                    <Button type="button" onClick={handleDelete} style={{ backgroundColor: '#ef4444', padding: '10px 14px', borderRadius: 8 }}>
                                        <FaTimesCircle style={{ marginRight: 8 }} /> Delete
                                    </Button>
                                </>
                            )
                        ) : (
                            // STUDENT ACTIONS (Req 6 & 7)
                            // Only allow Borrow if available, otherwise offer Hold
                            isAvailable ? (
                                    // Requirement 6: If available, show Borrow
                                    <Button
                                        type="button"
                                        onClick={() => console.log('Initiate Borrow Process')}
                                        style={{ backgroundColor: '#22c55e', padding: '10px 16px', borderRadius: 8 }}
                                    >
                                        Borrow Book ({availableStock} Available)
                                    </Button>
                                ) : (
                                    // Requirement 7: If NOT available, show Reserve
                                    <Button
                                        type="button"
                                        onClick={handlePlaceHold}
                                        style={{ backgroundColor: '#f59e0b', padding: '10px 16px', borderRadius: 8 }}
                                    >
                                        Place Hold / Reserve
                                    </Button>
                                )
                        )}

                        {/* Common Back Button */}
                        <Button type="button" onClick={() => navigate(isAdminMode ? '/admin/books' : '/student/books')} className="muted" style={{ padding: '10px 12px', borderRadius: 8 }}>
                            Back to List
                        </Button>
                    </Actions>
                </form>
            </DetailContainer>
        </PageWrap>
    );
};

export default BookDetail;