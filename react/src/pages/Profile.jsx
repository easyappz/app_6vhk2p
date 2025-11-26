import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../api/profile';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setFormData({
        username: data.username,
        email: data.email,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccess(false);

    try {
      await updateProfile(formData);
      await checkAuth();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div data-easytag="id1-react/src/pages/Profile.jsx" className="profile-container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div data-easytag="id1-react/src/pages/Profile.jsx" className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Профиль</h1>
          <button onClick={() => navigate('/chat')} className="back-button">
            Вернуться к чату
          </button>
        </div>

        {success && (
          <div className="success-message">Профиль успешно обновлен!</div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              required
            />
            {errors.username && (
              <div className="error-message">{errors.username[0]}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              required
            />
            {errors.email && (
              <div className="error-message">{errors.email[0]}</div>
            )}
          </div>

          <div className="profile-info">
            <p>
              <strong>Дата регистрации:</strong>{' '}
              {new Date(profile.created_at).toLocaleString('ru-RU')}
            </p>
          </div>

          <button type="submit" className="save-button" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
