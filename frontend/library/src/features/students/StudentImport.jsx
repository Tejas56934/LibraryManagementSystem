import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { FaCloudUploadAlt, FaFileExcel, FaUserGraduate } from 'react-icons/fa';
import Button from '../../components/Button';
import studentApi from '../../api/studentApi';
import { useNavigate } from 'react-router-dom'; // CRITICAL: Import useNavigate
// import { toast } from 'react-toastify';

// --- STYLED COMPONENTS ---
const ImportContainer = styled.div`
  background-color: var(--color-card);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
`;

const UploadBox = styled.div`
  border: 2px dashed #ccc;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  margin: var(--spacing-lg) 0;
  cursor: pointer;
  background-color: #fcfcfc;

  &:hover {
    border-color: var(--color-primary);
    background-color: #f0f8ff;
  }
`;

const FileInput = styled.input`
    display: none;
`;

const TemplateLink = styled.a`
    display: block;
    margin-top: var(--spacing-md);
    color: var(--color-primary);
    font-weight: 600;
`;
// --- END STYLED COMPONENTS ---

const StudentImport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // ✅ FIX: The missing handleFileChange logic is crucial for file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select an Excel file first.");
      return;
    }

    setLoading(true);
    try {
      const response = await studentApi.importStudentsExcel(selectedFile);

      // 1. Show success message (backend confirms number of records saved)
      alert(response);

      // 2. CRITICAL FIX: Navigate to the student list page to show new data
      navigate('/admin/students');

    } catch (error) {
      const errorMessage = error.response?.data || "Import failed. Check file format/server log for duplicate IDs.";
      alert("Error: " + errorMessage);
      // Do NOT redirect on failure
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async (e) => {
    e.preventDefault();
    try {
      const blob = await studentApi.downloadStudentTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'LMS_Student_Roster_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download template. Please check the network connection.");
    }
  };

  return (
    <ImportContainer>
      <h2><FaUserGraduate style={{ marginRight: '10px' }} /> Student Roster Import</h2>
      <p>Bulk upload student records and automatically create user accounts for login.</p>

      <form onSubmit={handleUpload}>
        <UploadBox onClick={() => fileInputRef.current.click()}>
          <FaFileExcel size={50} color="#007bff" />
          <p style={{ marginTop: '10px', fontWeight: 600 }}>
            {/* Display selected file name or prompt */}
            {selectedFile ? `File Selected: ${selectedFile.name}` : 'Click here or drag a file to upload (.xlsx)'}
          </p>
          <FileInput
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleFileChange} // <-- Linked to file change handler
          />
        </UploadBox>

        <Button
          type="submit"
          disabled={loading || !selectedFile}
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <FaCloudUploadAlt /> {loading ? 'Importing Data...' : 'Import Student Roster'}
        </Button>
      </form>

      <TemplateLink href="#" onClick={handleDownloadTemplate}>
        Download Student Roster Template
      </TemplateLink>

    </ImportContainer>
  );
};

export default StudentImport;