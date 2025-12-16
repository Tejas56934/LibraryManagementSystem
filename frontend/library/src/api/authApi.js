import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/auth/';

const login = async (username, password) => {
  const response = await axios.post(API_URL + 'login', {
    username,
    password,
  });

  if (response.data.token) {
    // Save user data (including token and role) to localStorage
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const authApi = {
  login,
  logout,
};

export default authApi;