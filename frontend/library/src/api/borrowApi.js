import axios from 'axios';

const API_URL = 'https://lms-backend-tejas.onrender.com/api/v1/admin/borrow/';

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };
};

// --- Core Transaction APIs ---

// Requirement 3: Issue a book
const issueBook = async (data) => {
  // data = { bookId, studentId, dueDate }
  const response = await axios.post(API_URL + 'issue', data, getAuthHeaders());
  return response.data;
};

// Requirement 4: Return a book
const returnBook = async (borrowRecordId) => {
  const response = await axios.post(API_URL + 'return/' + borrowRecordId, {}, getAuthHeaders());
  return response.data;
};

// Requirement 5: Log IN time for office reading
const logReadIn = async (bookId, studentId) => {
  const response = await axios.post(
    API_URL + 'read-log/in',
    null,
    {
      params: { bookId, studentId },
      ...getAuthHeaders()
    }
  );
  return response.data;
};

// Requirement 5: Log OUT time for office reading
const logReadOut = async (borrowRecordId) => {
  const response = await axios.post(API_URL + 'read-log/out/' + borrowRecordId, {}, getAuthHeaders());
  return response.data;
};

// ADMIN: Get a student's history (useful for context)
const getStudentHistory = async (studentId) => {
  const response = await axios.get(API_URL + 'history/' + studentId, getAuthHeaders());
  return response.data;
};

const getActiveTransactions = async () => {
    const response = await axios.get(API_URL + 'active', getAuthHeaders());
    return response.data;
};

const borrowApi = {
  issueBook,
  returnBook,
  logReadIn,
  logReadOut,
  getActiveTransactions,
  getStudentHistory,
};

export default borrowApi;
