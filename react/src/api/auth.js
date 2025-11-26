import instance from './axios';

/**
 * Register new user
 * @param {Object} data - Registration data
 * @param {string} data.username - Username
 * @param {string} data.email - Email
 * @param {string} data.password - Password
 * @param {string} data.password_confirm - Password confirmation
 * @returns {Promise} Response with user data and token
 */
export const register = async (data) => {
  const response = await instance.post('/api/auth/register/', data);
  return response.data;
};

/**
 * Login user
 * @param {Object} data - Login credentials
 * @param {string} data.username - Username
 * @param {string} data.password - Password
 * @returns {Promise} Response with token and user data
 */
export const login = async (data) => {
  const response = await instance.post('/api/auth/login/', data);
  return response.data;
};

/**
 * Logout user
 * @returns {Promise} Response with logout message
 */
export const logout = async () => {
  const token = localStorage.getItem('token');
  const response = await instance.post(
    '/api/auth/logout/',
    {},
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  return response.data;
};
