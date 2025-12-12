// frontend/src/features/feedback/FeedbackSubmitPage.jsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitNewFeedback } from '../../api/feedbackApi';
import styled from 'styled-components'; // Import styled for form consistency
import Card from '../../components/Card';
import Button from '../../components/Button';

// --- STYLED COMPONENTS for Form Inputs (Adopted from BookDetail.jsx) ---
const FormInput = styled.input`
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(18, 18, 20, 0.08);
    border-radius: 8px;
    font-size: 0.95rem;
    color: #111827;
    background: #ffffff;
    outline: none;
    transition: box-shadow 0.12s ease, border-color 0.12s ease;

    &:focus {
        box-shadow: 0 4px 12px rgba(59,130,246,0.08);
        border-color: rgba(59,130,246,0.6);
    }
`;

const FormTextArea = styled.textarea`
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(18, 18, 20, 0.08);
    border-radius: 8px;
    font-size: 0.95rem;
    color: #111827;
    background: #ffffff;
    outline: none;
    resize: vertical;
    transition: box-shadow 0.12s ease, border-color 0.12s ease;

    &:focus {
        box-shadow: 0 4px 12px rgba(59,130,246,0.08);
        border-color: rgba(59,130,246,0.6);
    }
`;

const FormSelect = styled.select`
    // Inherit input styles for consistency
    ${FormInput}
    appearance: none; /* Remove default arrow */
    padding-right: 30px; /* Space for a custom arrow if needed */
`;

const FormGroup = styled.div`
    margin-bottom: 1.5rem;
    label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
        color: #111827;
        font-size: 0.92rem;
    }
`;
// --- END STYLED COMPONENTS ---


const FeedbackSubmitPage = () => {
    const dispatch = useDispatch();
    // Assuming auth state gives us the logged-in student's details
    const { user: loggedInUser, isAuthenticated } = useSelector(state => state.auth);

    const [formData, setFormData] = useState({
        type: 'ACQUISITION_REQUEST', // Default to book request
        requestedBookTitle: '',
        requestedBookAuthor: '',
        message: '',
    });
    const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'error', 'loading'

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert("You must be logged in to submit a request.");
            return;
        }

        setSubmissionStatus('loading');

        // Basic validation for acquisition request
        if (formData.type === 'ACQUISITION_REQUEST' && !formData.requestedBookTitle.trim()) {
            alert('Please enter a book title for your acquisition request.');
            setSubmissionStatus(null);
            return;
        }

        try {
            const payload = {
                ...formData,
                // Attach user context from Redux state (CRITICAL for backend tracking)
                submitterId: loggedInUser.studentId || loggedInUser.id, // Use studentId or generic ID
                submitterRole: loggedInUser.role || 'STUDENT',
            };

            // Call the API function to submit the feedback/request
            await submitNewFeedback(payload);

            setSubmissionStatus('success');

            // Clear the form after successful submission
            setFormData({
                type: 'ACQUISITION_REQUEST',
                requestedBookTitle: '',
                requestedBookAuthor: '',
                message: '',
            });

        } catch (error) {
            setSubmissionStatus('error');
            console.error('Submission failed:', error);
            alert(`Submission failed. Error: ${error.message || 'Check console.'}`);
        }
    };

    return (
        <div className="feedback-submit-page">
            <h2 className="mb-4">📚 Request a Book / Submit Feedback</h2>

            <Card title="Submission Form">
                <form onSubmit={handleSubmit}>

                    <FormGroup>
                        <label className="form-label">Submission Type:</label>
                        <FormSelect
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="ACQUISITION_REQUEST">Request a Book for Library</option>
                            <option value="GENERAL_COMPLAINT">General Feedback/Complaint</option>
                            <option value="SYSTEM_ISSUE">System/App Issue Report</option>
                        </FormSelect>
                    </FormGroup>

                    {/* Show book request fields only if type is ACQUISITION_REQUEST */}
                    {formData.type === 'ACQUISITION_REQUEST' && (
                        <>
                            <FormGroup>
                                <label className="form-label">Book Title (Required):</label>
                                <FormInput
                                    type="text"
                                    name="requestedBookTitle"
                                    value={formData.requestedBookTitle}
                                    onChange={handleChange}
                                    required={true}
                                    placeholder="e.g., The Hitchhiker's Guide to the Galaxy"
                                />
                            </FormGroup>
                            <FormGroup>
                                <label className="form-label">Author (Optional):</label>
                                <FormInput
                                    type="text"
                                    name="requestedBookAuthor"
                                    value={formData.requestedBookAuthor}
                                    onChange={handleChange}
                                    placeholder="e.g., Douglas Adams"
                                />
                            </FormGroup>
                        </>
                    )}

                    <FormGroup>
                        <label className="form-label">Details / Message:</label>
                        <FormTextArea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Provide any additional details or context here."
                        />
                    </FormGroup>

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={submissionStatus === 'loading'}
                    >
                        {submissionStatus === 'loading' ? 'Submitting...' : 'Submit Request'}
                    </Button>

                    {submissionStatus === 'success' && <p className="text-success mt-3">Thank you! Your request has been submitted successfully to the librarian.</p>}
                    {submissionStatus === 'error' && <p className="text-danger mt-3">Submission failed. Please check your connection and try again.</p>}

                </form>
            </Card>
        </div>
    );
};

export default FeedbackSubmitPage;