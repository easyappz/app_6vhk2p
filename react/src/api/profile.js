import instance from './axios';

export const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await instance.get('/api/profile/', {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  const response = await instance.put('/api/profile/update/', profileData, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};
