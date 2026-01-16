import axios from 'axios';

// Ensure this matches your Backend Port
const API_URL = "https://lms-backend-tejas.onrender.com";

class AIService {

    // Helper: Get the JWT Token from LocalStorage
    // CHECK: Verify if your login saves the token as 'token', 'jwtToken', or 'user'
    getAuthHeader() {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token; // Adjust this if your token is stored differently

        if (token) {
            return { Authorization: `Bearer ${token}` };
        } else {
            console.error("❌ No Token Found! User might be logged out.");
            return {};
        }
    }

    // 1. General Chat
    async chatWithAI(query) {
        const response = await axios.post(
            `${API_URL}/chat`,
            { query },
            { headers: this.getAuthHeader() } // <--- ADDED HEADERS
        );
        return this.parseResponse(response.data);
    }

    // 2. Inventory Analysis
    async analyzeInventory(query) {
        const response = await axios.post(
            `${API_URL}/analyze-inventory`,
            { query },
            { headers: this.getAuthHeader() } // <--- ADDED HEADERS
        );
        return this.parseResponse(response.data);
    }

    // 3. Financial Insights
    async analyzeFinancials(query) {
        const response = await axios.post(
            `${API_URL}/analyze-financials`,
            { query },
            { headers: this.getAuthHeader() } // <--- ADDED HEADERS
        );
        return this.parseResponse(response.data);
    }

    // 4. Data Cleaning
    async cleanData() {
        const response = await axios.post(
            `${API_URL}/clean-data`,
            {},
            { headers: this.getAuthHeader() } // <--- ADDED HEADERS
        );
        return this.parseResponse(response.data);
    }

    parseResponse(data) {
            // Case 1: Axios automatically parsed it as an Object already
            if (typeof data === 'object') {
                return data;
            }

            // Case 2: It is a string. Let's try to clean and parse it.
            try {
                // Remove common Markdown formatting like ```json ... ```
                const cleanData = data.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanData);

            } catch (e) {
                // Case 3: Parsing FAILED. The AI sent plain text (e.g., "Hello!").
                // We treat the raw string as the summary.
                console.warn("⚠️ AI returned plain text instead of JSON. Using fallback.");
                return {
                    summary: data, // Use the raw text as the message
                    tableData: []
                };
            }
            }
}

export default new AIService();
