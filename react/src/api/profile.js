import instance from './axios';

/**
 * Get current user profile
 * @returns {Promise} Response with user profile data
 */
export const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await instance.get('/api/profile/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Update user profile
 * @param {Object} data - Profile update data
 * @param {string} data.username - New username
 * @param {string} data.email - New email
 * @returns {Promise} Response with updated profile data
 */
export const updateProfile = async (data) => {
  const token = localStorage.getItem('token');
  const response = await instance.put('/api/profile/update/', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
