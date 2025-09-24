import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';
import Results from './pages/Results';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="quiz" element={<QuizList />} />
        <Route path="quiz/:levelId" element={<QuizDetail />} />
        <Route path="results/:resultId" element={<Results />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route
          path="admin/*"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App; 