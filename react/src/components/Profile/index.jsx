import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../api/profile';
import './styles.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfileData(data);
      setFormData({
        username: data.username || '',
        email: data.email || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      setErrors({ general: 'Не удалось загрузить профиль' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});
    setSaving(true);

    try {
      const updatedData = await updateProfile(formData);
      setProfileData(updatedData);
      setSuccessMessage('Профиль успешно обновлен!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Не удалось обновить профиль' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleBackToChat = () => {
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="profile-container" data-easytag="id4-src/components/Profile/index.jsx">
        <div className="profile-loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="profile-container" data-easytag="id4-src/components/Profile/index.jsx">
      <div className="profile-header">
        <h1 className="profile-title">Профиль</h1>
        <div className="profile-navigation">
          <Link to="/chat" className="profile-nav-link">Чат</Link>
          <button onClick={handleLogout} className="profile-logout-button">
            Выход
          </button>
        </div>
      </div>

      <div className="profile-card">
        {profileData && (
          <div className="profile-info-section">
            <h2 className="profile-section-title">Информация о профиле</h2>
            <div className="profile-info-item">
              <span className="profile-info-label">Имя пользователя:</span>
              <span className="profile-info-value">{profileData.username}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Email:</span>
              <span className="profile-info-value">{profileData.email}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Дата регистрации:</span>
              <span className="profile-info-value">
                {new Date(profileData.created_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        )}

        <div className="profile-edit-section">
          <h2 className="profile-section-title">Редактировать профиль</h2>
          
          {successMessage && (
            <div className="profile-success-message">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="profile-error-message">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-form-group">
              <label htmlFor="username" className="profile-form-label">
                Имя пользователя
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`profile-form-input ${errors.username ? 'profile-form-input-error' : ''}`}
                required
                minLength={3}
                maxLength={150}
              />
              {errors.username && (
                <span className="profile-field-error">
                  {Array.isArray(errors.username) ? errors.username[0] : errors.username}
                </span>
              )}
            </div>

            <div className="profile-form-group">
              <label htmlFor="email" className="profile-form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`profile-form-input ${errors.email ? 'profile-form-input-error' : ''}`}
                required
              />
              {errors.email && (
                <span className="profile-field-error">
                  {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        </div>

        <div className="profile-actions">
          <button onClick={handleBackToChat} className="profile-back-button">
            Назад в чат
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
