import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';
import Results from './pages/Results';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import { selectIsAuthenticated } from './store/slices/adminSlice';

const App = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="quizzes" element={<QuizList />} />
          <Route path="quiz/:levelId" element={<QuizDetail />} />
          <Route path="results/:id" element={<Results />} />
        </Route>

        {/* Routes d'administration */}
        <Route 
          path="/admin/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/admin/dashboard" replace /> : 
              <AdminLogin />
          } 
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirection 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
