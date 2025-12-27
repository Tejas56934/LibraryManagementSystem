import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/';

// Utility function to get the current user's token for protected endpoints
const getAuthHeaders = () => {
  const userRaw = localStorage.getItem('user');
  // Handle case where user is not logged in (used by public endpoints)
  if (!userRaw) {
    return { headers: {} };
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch (e) {
    console.error('Failed to parse localStorage user:', e);
    return { headers: {} };
  }

  return {
    headers: {
      // Sends the JWT token as a Bearer header
      Authorization: `Bearer ${user?.token}`,
    },
  };
};

// --- READ OPERATIONS (LISTING/SEARCH) ---

// Public/Student Endpoint: Get only available books (Requirement 6)
const getAvailableBooks = async (searchQuery = '') => {
  const url = `${API_URL}books/available`;
  const response = await axios.get(url, {
    params: { keyword: searchQuery },
  });
  return response.data;
};



export const findBookLocation = async (bookId) => {
    // Path matches @GetMapping("/location/{bookId}") in ShelfController
    const url = `${API_URL}shelf/location/${bookId}`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data;
};

export const getAllShelves = async () => {
    // Path matches @GetMapping("/all") in ShelfController
    const url = `${API_URL}shelf/all`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data;
};

// Admin Endpoint: Fetches ALL books for management (Requirement 2 for Admin)
const getAllBooksAdmin = async (searchQuery = '') => {
  const url = `${API_URL}admin/books/search`;
  const response = await axios.get(url, {
    params: { keyword: searchQuery },
    ...getAuthHeaders(), // Includes Authorization header
  });
  return response.data;
};

// Admin Endpoint: Get single book by ID (Used for BookDetail/Manage page)
const getBookById = async (bookId) => {
    const url = `${API_URL}admin/books/${bookId}`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data;
};

// --- CRUD OPERATIONS (ADMIN ONLY) ---

// Create New Book (Manual Add)
const addBook = async (bookData) => {
    const url = `${API_URL}admin/books`;
    const response = await axios.post(url, bookData, getAuthHeaders());
    return response.data;
};

// Update Existing Book
const updateBook = async (bookId, bookData) => {
    const url = `${API_URL}admin/books/${bookId}`;
    const response = await axios.put(url, bookData, getAuthHeaders());
    return response.data;
};

// Delete Existing Book
const deleteBook = async (bookId) => {
    const url = `${API_URL}admin/books/${bookId}`;
    const response = await axios.delete(url, getAuthHeaders());
    return response.data;
};

// --- TRANSACTION/IMPORT ---

// Student Reservation Endpoint (Requirement 7)
const reserveBook = async (bookId) => {
  const url = `${API_URL}student/books/reserve/${bookId}`;
  const response = await axios.post(url, {}, getAuthHeaders());
  return response.data;
};

// Admin Excel Import (File Upload)
const importExcel = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const authHeaders = getAuthHeaders();

    const response = await axios.post(
        API_URL + 'admin/books/import-excel',
        formData,
        {
            ...authHeaders,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...authHeaders.headers,
            },
        }
    );
    return response.data;
};

// CRITICAL NEW FUNCTION: Download Book Template
const downloadBookTemplate = async () => {
  try {
    const authHeaders = getAuthHeaders(); // Reuse existing function

    const response = await axios.get(
      `${API_URL}admin/books/download-template`, // Use API_URL constant
      {
        ...authHeaders,
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "LMS_Book_Inventory_Template.xlsx";
    link.click();

    // Clean up the URL object
    window.URL.revokeObjectURL(link.href);

  } catch (error) {
    console.error("Download failed - Full error:", error);
    console.error("Response data:", error.response?.data);
    console.error("Status code:", error.response?.status);
    alert(`Download failed: ${error.response?.status || 'Network error'} - ${error.message}`);
  }
};




const bookApi = {
  getAvailableBooks,
  getAllBooksAdmin,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  reserveBook,
  importExcel,
  downloadBookTemplate,
  findBookLocation,
  getAllShelves,
};

export default bookApi;