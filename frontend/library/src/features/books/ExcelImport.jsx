import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCloudUploadAlt, FaFileExcel, FaBook } from 'react-icons/fa';
import Button from '../../components/Button';
import bookApi from '../../api/bookApi';
// import { toast } from 'react-toastify';

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

const ExcelImport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
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
      const response = await bookApi.importExcel(selectedFile);
      // toast.success(response);
      alert(response);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input
      }
    } catch (error) {
      const errorMessage = error.response?.data || "File upload failed. Check file format/server log.";
      // toast.error(errorMessage);
      alert("Error: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

const handleDownloadTemplate = async (e) => {
    e.preventDefault();
    try {
      // 1. Call the API to get the Blob (file data)
      const blob = await bookApi.downloadBookTemplate();

      // 2. Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // 3. Create a temporary <a> tag and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'LMS_Book_Inventory_Template.xlsx');
      document.body.appendChild(link);
      link.click();

      // 4. Clean up
      link.remove();
      window.URL.revokeObjectURL(url);

      // toast.success("Template download started.");
    } catch (error) {
      // toast.error("Failed to download template.");
      alert("Failed to download template. Please check the network connection.");
    }
  };

  return (
    <ImportContainer>
      <h2><FaBook style={{ marginRight: '10px' }} /> Library Stock Initialization</h2>
      <p>Upload your initial book inventory using a standard Excel spreadsheet (Requirement 1).</p>

      <form onSubmit={handleUpload}>
        <UploadBox onClick={() => fileInputRef.current.click()}>
          <FaFileExcel size={50} color="#28a745" />
          <p style={{ marginTop: '10px', fontWeight: 600 }}>
            {selectedFile ? `File Selected: ${selectedFile.name}` : 'Click here or drag a file to upload (.xlsx)'}
          </p>
          <FileInput
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </UploadBox>

        <Button
          type="submit"
          disabled={loading || !selectedFile}
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <FaCloudUploadAlt /> {loading ? 'Importing Data...' : 'Start Inventory Import'}
        </Button>
      </form>

      {/* Placeholder for template download link */}
      <TemplateLink href="#" onClick={handleDownloadTemplate}>
              Download Excel Template
            </TemplateLink>

    </ImportContainer>
  );
};

export default ExcelImport;