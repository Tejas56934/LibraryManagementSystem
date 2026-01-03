import axios from 'axios';

// Correct BASE URL — must match Spring Boot Controller path
const API_BASE_URL = 'http://localhost:8080/api/v1/admin/report';

// Utility function to get the current user's token
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: user?.token ? `Bearer ${user.token}` : undefined,
    },
    responseType: 'json'
  };
};

/**
 * Fetches the basic aggregated library statistics
 * GET /api/v1/admin/report/basic-stats
 */
export const getBasicReport = async () => {
  try {
    const config = getAuthHeaders();

    const response = await axios.get(
      `${API_BASE_URL}/basic-stats`,
      config
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching basic report:', error);
    throw error;
  }
};

/**
 * ADMIN: Fetches dynamic AI report
 * POST /api/v1/admin/report/ai-query/generate
 */
export const getAIReport = async (query) => {
  try {
    const config = getAuthHeaders();

    const response = await axios.post(
      `${API_BASE_URL}/ai-query/generate`,
      { query },
      config
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching AI report:', error);
    throw error;
  }
};


export const getInventoryStockStatus = async (filters) => {
  try {
    const config = getAuthHeaders();

    const response = await axios.get(
      `${API_BASE_URL}/stock-status`,
      {
        ...config,
        params: filters
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching inventory stock report:', error.response || error);
    throw error;
  }
};
/**
 * ADMIN: Generic function to export any report key as PDF/Excel.
 * GET /api/v1/admin/report/export/generic?reportKey=...
 */
export const exportGenericReport = async (reportKey, filters, format = 'PDF') => {
  try {
    const config = getAuthHeaders(); // Fetch token config

    const response = await axios.get(
      `${API_BASE_URL}/export/generic`, // NEW GENERIC ENDPOINT
      {
        ...config,
        params: { reportKey, ...filters, format },
        responseType: 'blob' // CRITICAL: Expecting binary file
      }
    );
    return response.data; // This is the Blob object
  } catch (error) {
    console.error(`❌ Error exporting report ${reportKey}:`, error.response || error);
    throw error;
  }
};


// --- EXISTING API FUNCTION: Low Stock Alerts ---
export const getLowStockAlerts = async (filters) => {
  try {
    const config = getAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/low-stock`,
      {
        ...config,
        params: filters
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching low stock alerts:', error.response || error);
    throw error;
  }
};

// --- NEW API FUNCTION: Purchase Order History ---
export const getPurchaseOrderHistory = async (filters) => {
  try {
    const config = getAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/purchase-history`, // NEW ENDPOINT
      {
        ...config,
        params: filters
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching purchase order history:', error.response || error);
    throw error;
  }
};


/**
 * ADMIN: Export PDF report
 * GET /api/v1/admin/report/export/activity-summary
 */
export const exportActivitySummaryPdf = async () => {
  try {
    const config = getAuthHeaders();

    const downloadConfig = {
      ...config,
      responseType: 'blob'
    };

    const response = await axios.get(
      `${API_BASE_URL}/export/activity-summary`,
      downloadConfig
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error exporting PDF:', error);

    if (error.response && error.response.data instanceof Blob) {
      throw new Error('Export failed — server returned non-PDF response');
    }
    throw error;
  }
};
export const getDailyFootfall = async (filters) => {
  try {
    const config = getAuthHeaders();
    // Maps to Backend: /api/v1/admin/report/naac/daily-usage
    const response = await axios.get(`${API_BASE_URL}/naac/daily-usage`, { ...config, params: filters });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching daily footfall:', error);
    throw error;
  }
};

export const getCategoryExpenditure = async (filters) => {
  try {
    const config = getAuthHeaders();
    // Maps to Backend: /api/v1/admin/report/naac/category-stats
    const response = await axios.get(`${API_BASE_URL}/naac/category-stats`, { ...config, params: filters });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching category stats:', error);
    throw error;
  }
};



// Export API object (FINAL EXPORT)
const reportApi = {
  getBasicReport,
  getAIReport,
  exportActivitySummaryPdf,
  getInventoryStockStatus,
  getLowStockAlerts,
  getPurchaseOrderHistory, // CRITICAL: Added new function
  exportGenericReport,
  getDailyFootfall,
  getCategoryExpenditure,
};

export default reportApi;