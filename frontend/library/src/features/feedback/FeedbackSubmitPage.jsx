// frontend/src/features/feedback/FeedbackSubmitPage.jsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitNewFeedback } from '../../api/feedbackApi';
import styled from 'styled-components';
import Card from '../../components/Card';

// --- STYLED COMPONENTS ---
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
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(18, 18, 20, 0.08);
    border-radius: 8px;
    font-size: 0.95rem;
    color: #111827;
    background: #ffffff;
    outline: none;
    appearance: none;
    transition: box-shadow 0.12s ease, border-color 0.12s ease;

    &:focus {
        box-shadow: 0 4px 12px rgba(59,130,246,0.08);
        border-color: rgba(59,130,246,0.6);
    }
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

// Standard HTML Button with Styles (Guarantees click works)
const SubmitButton = styled.button`
    padding: 12px 24px;
    background-color: #2563eb;
    color: white;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    width: 100%;

    &:hover {
        background-color: #1d4ed8;
    }

    &:disabled {
        background-color: #93c5fd;
        cursor: not-allowed;
    }
`;
// --- END STYLED COMPONENTS ---

const FeedbackSubmitPage = () => {
    // Safe Selector: Adds || {} to prevent crash if state.auth is undefined
    const { user: loggedInUser, isAuthenticated } = useSelector(state => state.auth || {});

    const [formData, setFormData] = useState({
        type: 'ACQUISITION_REQUEST',
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
        console.log("Submit button clicked!"); // Debug log 1

        if (!isAuthenticated || !loggedInUser) {
            alert("You must be logged in to submit a request.");
            console.error("User not authenticated");
            return;
        }

        console.log("User is authenticated:", loggedInUser.id); // Debug log 2

        // Validation
        if (formData.type === 'ACQUISITION_REQUEST' && !formData.requestedBookTitle.trim()) {
            alert('Please enter a book title for your acquisition request.');
            return;
        }

        setSubmissionStatus('loading');

        try {
            const payload = {
                ...formData,
                submitterId: loggedInUser.studentId || loggedInUser.id,
                submitterRole: loggedInUser.role || 'STUDENT',
            };

            console.log("Sending payload:", payload); // Debug log 3

            // API Call
            await submitNewFeedback(payload);

            setSubmissionStatus('success');
            console.log("Submission successful!");

            // Reset form
            setFormData({
                type: 'ACQUISITION_REQUEST',
                requestedBookTitle: '',
                requestedBookAuthor: '',
                message: '',
            });

        } catch (error) {
            setSubmissionStatus('error');
            console.error('Submission failed:', error);
            alert(`Submission failed: ${error.message || 'Unknown error'}`);
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

                    {formData.type === 'ACQUISITION_REQUEST' && (
                        <>
                            <FormGroup>
                                <label className="form-label">Book Title (Required):</label>
                                <FormInput
                                    type="text"
                                    name="requestedBookTitle"
                                    value={formData.requestedBookTitle}
                                    onChange={handleChange}
                                    required
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
                            placeholder="Provide any additional details..."
                        />
                    </FormGroup>

                    {/* REPLACED CUSTOM BUTTON WITH DIRECT STYLED BUTTON TO ENSURE IT WORKS */}
                    <SubmitButton type="submit" disabled={submissionStatus === 'loading'}>
                        {submissionStatus === 'loading' ? 'Submitting...' : 'Submit Request'}
                    </SubmitButton>

                    {submissionStatus === 'success' && (
                        <p className="text-success mt-3" style={{ color: 'green', fontWeight: 'bold' }}>
                            ✅ Request submitted successfully!
                        </p>
                    )}

                    {submissionStatus === 'error' && (
                        <p className="text-danger mt-3" style={{ color: 'red' }}>
                            ❌ Submission failed. Check connection.
                        </p>
                    )}

                </form>
            </Card>
        </div>
    );
};

export default FeedbackSubmitPage;