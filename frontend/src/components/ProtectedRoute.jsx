import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
         <div className="text-center text-gray-500 font-semibold animate-pulse text-lg">
           Verifying Cohort Connect Access Token...
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
