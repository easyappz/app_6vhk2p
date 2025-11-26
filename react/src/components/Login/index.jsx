import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = ['Пароль обязателен'];
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
      const result = await login(formData);
      
      if (result.success) {
        // Redirect to chat page after successful login
        navigate('/chat');
      } else {
        // Handle login error
        if (result.error && result.error.error) {
          setErrors({ general: [result.error.error] });
        } else {
          setErrors({ general: ['Неверное имя пользователя или пароль'] });
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({ general: ['Произошла ошибка при входе. Попробуйте снова.'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" data-easytag="id2-src/components/Login/index.jsx">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Вход</h1>
          <p className="login-subtitle">Войдите в свой аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="login-footer">
          <p className="footer-text">
            Нет аккаунта?{' '}
            <Link to="/register" className="footer-link">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;