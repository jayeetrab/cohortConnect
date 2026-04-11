import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
         <div className="text-center text-[var(--primary-500)] font-semibold text-lg">
           Verifying Career Credentials...
         </div>
      </div>
    );
  }
  
  if (!user) {
     return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
     if(user.role === 'admin') return <Navigate to="/admin" replace />;
     if(user.role === 'employer') return <Navigate to="/employer" replace />;
     return <Navigate to="/student" replace />;
  }
  
  return children;
}
