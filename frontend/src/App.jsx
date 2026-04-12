<<<<<<< HEAD
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ModernAppLayout from './layouts/ModernAppLayout';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NetworkPage from './pages/NetworkPage';
import JobsPage from './pages/JobsPage';
import MessagingPage from './pages/MessagingPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AlumniDirectory from './pages/AlumniDirectory';
import JobDetail from './pages/JobDetail';
import ProtectedRoute from './components/ProtectedRoute';

function RootRedirect() {
  const { user, loading } = useAuth();
  if(loading) return null;
  if(!user) return <Navigate to="/auth" />;
  if(user.role === 'admin') return <Navigate to="/admin" />;
  if(user.role === 'employer') return <Navigate to="/employer" />;
  return <Navigate to="/student" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/student" element={
             <ProtectedRoute allowedRoles={['student', 'alumni']}>
                <ModernAppLayout><StudentDashboard /></ModernAppLayout>
             </ProtectedRoute>
          } />
          
          <Route path="/employer" element={
             <ProtectedRoute allowedRoles={['employer', 'admin']}>
                <ModernAppLayout userType="employer"><EmployerDashboard /></ModernAppLayout>
             </ProtectedRoute>
          } />

          <Route path="/admin" element={
             <ProtectedRoute allowedRoles={['admin']}>
                <ModernAppLayout userType="admin"><AdminDashboard /></ModernAppLayout>
             </ProtectedRoute>
          } />

          <Route path="/network" element={
             <ProtectedRoute>
                <ModernAppLayout><NetworkPage /></ModernAppLayout>
             </ProtectedRoute>
          } />

          <Route path="/jobs" element={
             <ProtectedRoute>
                <ModernAppLayout><JobsPage /></ModernAppLayout>
             </ProtectedRoute>
          } />

          <Route path="/jobs/:id" element={
             <ProtectedRoute>
                <ModernAppLayout><JobDetail /></ModernAppLayout>
             </ProtectedRoute>
          } />

          <Route path="/messaging" element={
             <ProtectedRoute>
                <ModernAppLayout><MessagingPage /></ModernAppLayout>
             </ProtectedRoute>
          } />

          <Route path="/profile" element={
             <ProtectedRoute>
                <ModernAppLayout><ProfilePage /></ModernAppLayout>
             </ProtectedRoute>
          } />

          <Route path="/settings" element={
             <ProtectedRoute>
                <ModernAppLayout><SettingsPage /></ModernAppLayout>
             </ProtectedRoute>
          } />

          <Route path="/alumni" element={
             <ProtectedRoute>
                <ModernAppLayout><AlumniDirectory /></ModernAppLayout>
             </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
>>>>>>> parent of 8a982cd (kk)
