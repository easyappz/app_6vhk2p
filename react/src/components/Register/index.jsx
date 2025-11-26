import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/auth';
import './styles.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = ['Имя пользователя обязательно'];
    } else if (formData.username.length < 3) {
      newErrors.username = ['Имя пользователя должно содержать минимум 3 символа'];
    } else if (formData.username.length > 150) {
      newErrors.username = ['Имя пользователя должно содержать максимум 150 символов'];
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = ['Email обязателен'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ['Введите корректный email адрес'];
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = ['Пароль обязателен'];
    } else if (formData.password.length < 8) {
      newErrors.password = ['Пароль должен содержать минимум 8 символов'];
    }

    // Password confirmation validation
    if (!formData.password_confirm) {
      newErrors.password_confirm = ['Подтверждение пароля обязательно'];
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = ['Пароли не совпадают'];
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register(formData);
      // Redirect to login page after successful registration
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: ['Произошла ошибка при регистрации. Попробуйте снова.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container" data-easytag="id1-src/components/Register/index.jsx">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Регистрация</h1>
          <p className="register-subtitle">Создайте новый аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general[0]}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'input-error' : ''}`}
              placeholder="Введите имя пользователя"
              disabled={loading}
            />
            {errors.username && (
              <span className="error-message">{errors.username[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="Введите email"
              disabled={loading}
            />
            {errors.email && (
              <span className="error-message">{errors.email[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Введите пароль"
              disabled={loading}
            />
            {errors.password && (
              <span className="error-message">{errors.password[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password_confirm" className="form-label">
              Подтверждение пароля
            </label>
            <input
              type="password"
              id="password_confirm"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              className={`form-input ${errors.password_confirm ? 'input-error' : ''}`}
              placeholder="Повторите пароль"
              disabled={loading}
            />
            {errors.password_confirm && (
              <span className="error-message">{errors.password_confirm[0]}</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="register-footer">
          <p className="footer-text">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="footer-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;