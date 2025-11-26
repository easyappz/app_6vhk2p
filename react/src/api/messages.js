import instance from './axios';

/**
 * Get chat messages
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of messages to return
 * @param {number} params.offset - Number of messages to skip
 * @returns {Promise} Response with messages list
 */
export const getMessages = async (params = { limit: 100, offset: 0 }) => {
  const token = localStorage.getItem('token');
  const response = await instance.get('/api/messages/', {
    params,
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};

/**
 * Send new message
 * @param {Object} data - Message data
 * @param {string} data.text - Message text
 * @returns {Promise} Response with created message
 */
export const sendMessage = async (data) => {
  const token = localStorage.getItem('token');
  const response = await instance.post('/api/messages/create/', data, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};
