import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/admin/notifications/';

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };
};

const getUnreadAlerts = async () => {
    const response = await axios.get(API_URL + 'unread', getAuthHeaders());
    return response.data;
};

const markAlertRead = async (alertId) => {
    const response = await axios.post(API_URL + 'mark-read/' + alertId, {}, getAuthHeaders());
    return response.data;
};

const notificationApi = {
    getUnreadAlerts,
    markAlertRead,
};

export default notificationApi;