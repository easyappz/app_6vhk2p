import instance from './axios';

export const getMessages = async (params = {}) => {
  const token = localStorage.getItem('token');
  const { limit = 100, offset = 0 } = params;
  const response = await instance.get('/api/messages/', {
    params: { limit, offset },
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};

export const sendMessage = async (messageData) => {
  const token = localStorage.getItem('token');
  const response = await instance.post('/api/messages/create/', messageData, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};
