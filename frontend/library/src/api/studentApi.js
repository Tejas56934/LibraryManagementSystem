import axios from "axios";

const BASE_URL = "https://lms-backend-tejas.onrender.com/api/v1/admin";

// Read JWT from localStorage
const getAuthHeaders = () => {
  const userRaw = localStorage.getItem("user");
  if (!userRaw) return { headers: {} };

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch (e) {
    return { headers: {} };
  }

  const token = user?.token;
  if (!token) return { headers: {} };

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/* -------------------------------------------------
   GET ALL STUDENTS
------------------------------------------------- */
const getAllStudents = async () => {
  const response = await axios.get(`${BASE_URL}/students`, getAuthHeaders());
  return response.data;
};

/* -------------------------------------------------
   GET STUDENT BY ID
------------------------------------------------- */
const getStudentById = async (studentId) => {
  const response = await axios.get(`${BASE_URL}/students/${studentId}`, getAuthHeaders());
  return response.data;
};

/* -------------------------------------------------
   CREATE NEW STUDENT
------------------------------------------------- */
const createStudent = async (studentData) => {
  const response = await axios.post(
    `${BASE_URL}/addStudent`,
    studentData,
    getAuthHeaders()
  );
  return response.data;
};

/* -------------------------------------------------
   UPDATE STUDENT
------------------------------------------------- */
const updateStudent = async (studentId, studentData) => {
  const response = await axios.put(
    `${BASE_URL}/students/${studentId}`,
    studentData,
    getAuthHeaders()
  );
  return response.data;
};

/* -------------------------------------------------
   DELETE STUDENT
------------------------------------------------- */
const deleteStudent = async (studentId) => {
  const response = await axios.delete(
    `${BASE_URL}/students/${studentId}`,
    getAuthHeaders()
  );
  return response.data;
};

/* -------------------------------------------------
   DOWNLOAD EXCEL TEMPLATE
------------------------------------------------- */
const downloadStudentTemplate = async () => {
  const response = await axios.get(`${BASE_URL}/students/download-template`, {
    ...getAuthHeaders(),
    responseType: "blob",
  });
  return response.data;
};

/* -------------------------------------------------
   IMPORT STUDENTS FROM EXCEL
------------------------------------------------- */
const importStudentsExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const auth = getAuthHeaders();

  const response = await axios.post(
    `${BASE_URL}/students/import-excel`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        ...auth.headers,
      },
    }
  );

  return response.data;
};

const studentApi = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  downloadStudentTemplate,
  importStudentsExcel,
};

export default studentApi;
