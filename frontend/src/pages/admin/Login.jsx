import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginAdmin } from '../../store/slices/adminSlice';
import { selectAdminError, selectAdminLoading } from '../../store/slices/adminSlice';
import '../../styles/admin/login.scss';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector(state => state.ui.language);
  const error = useSelector(selectAdminError);
  const loading = useSelector(selectAdminLoading);

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Vérifier si l'admin est déjà connecté
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const validateForm = () => {
    const errors = {};
    if (!credentials.username.trim()) {
      errors.username = language === 'fr' 
        ? 'Le nom d\'utilisateur est requis' 
        : 'اسم المستخدم مطلوب';
    }
    if (!credentials.password) {
      errors.password = language === 'fr' 
        ? 'Le mot de passe est requis' 
        : 'كلمة المرور مطلوبة';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const result = await dispatch(loginAdmin(credentials)).unwrap();
        if (result.token) {
          localStorage.setItem('adminToken', result.token);
          navigate('/admin/dashboard');
        }
      } catch (err) {
        // L'erreur est déjà gérée par le slice Redux
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <motion.div 
      className="admin-login"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="login-container">
        <div className="login-header">
          <h1>
            {language === 'fr' ? 'Administration' : 'الإدارة'}
          </h1>
          <p>
            {language === 'fr' 
              ? 'Connectez-vous pour accéder au panneau d\'administration' 
              : 'تسجيل الدخول للوصول إلى لوحة الإدارة'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              {language === 'fr' ? 'Nom d\'utilisateur' : 'اسم المستخدم'}
            </label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className={formErrors.username ? 'error' : ''}
                placeholder={language === 'fr' ? 'Entrez votre nom d\'utilisateur' : 'أدخل اسم المستخدم'}
              />
            </div>
            {formErrors.username && (
              <span className="field-error">{formErrors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {language === 'fr' ? 'Mot de passe' : 'كلمة المرور'}
            </label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className={formErrors.password ? 'error' : ''}
                placeholder={language === 'fr' ? 'Entrez votre mot de passe' : 'أدخل كلمة المرور'}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formErrors.password && (
              <span className="field-error">{formErrors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              language === 'fr' ? 'Se connecter' : 'تسجيل الدخول'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {language === 'fr' 
              ? '© 2024 Chambre des Conseillers - Tous droits réservés' 
              : '© 2024 مجلس المستشارين - جميع الحقوق محفوظة'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login; 