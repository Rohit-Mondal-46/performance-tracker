// import { useUser } from '@clerk/clerk-react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children, requiredRole }) => {
//   const { isLoaded, isSignedIn } = useUser();
//   const userRole = sessionStorage.getItem(process.env.REACT_APP_CLERK_ROLE_SESSION_KEY);

//   if (!isLoaded) {
//     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
//   }

//   if (!isSignedIn) {
//     return <Navigate to="/login" replace />;
//   }

//   if (requiredRole && userRole !== requiredRole) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;




import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isLoaded, userId } = useAuth();
  const userRole = sessionStorage.getItem('userRole');

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!userId) {
    return <Navigate to="/role-selection" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;