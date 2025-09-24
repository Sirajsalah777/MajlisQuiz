import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated } from '../../store/slices/adminSlice';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  useEffect(() => {
    // Vérifier le token à chaque rendu
    const token = localStorage.getItem('adminToken');
    if (!token && isAuthenticated) {
      // Si le token n'existe pas mais que l'état indique l'authentification,
      // rediriger vers la page de connexion
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion en sauvegardant l'URL de destination
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 