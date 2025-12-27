// frontend/src/api/aiReportApi.js
import axios from 'axios';

// Pointing to your specific AI Controller
const API_URL = 'http://localhost:8080/api/v1/admin/ai-reports';

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return { headers: { Authorization: `Bearer ${user?.token}` } };
};

const getAIReport = async (userQuery) => {
    try {
        const response = await axios.post(
            `${API_URL}/generate`,
            { query: userQuery },
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error("AI API Error:", error);
        throw error;
    }
};

const aiReportApi = {
    getAIReport
};

export default aiReportApi;