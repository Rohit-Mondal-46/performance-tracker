// import { useUser } from '@clerk/clerk-react';
// import { useNavigate } from 'react-router-dom';

// const RoleSelection = () => {
//   const { user } = useUser();
//   const navigate = useNavigate();

//   const handleRoleSelect = (role) => {
//     // In a real app, you would save this to your backend
//     sessionStorage.setItem(process.env.REACT_APP_CLERK_ROLE_SESSION_KEY, role);
    
//     if (role === 'admin') {
//       navigate('/admin-dashboard');
//     } else {
//       navigate('/employee-dashboard');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="bg-card border border-border rounded-lg shadow-lg p-8 max-w-md w-full">
//         <h2 className="text-2xl font-bold text-foreground mb-2">Welcome, {user.firstName}!</h2>
//         <p className="text-muted-foreground mb-6">Please select your role to continue</p>
        
//         <div className="space-y-4">
//           <button
//             onClick={() => handleRoleSelect('admin')}
//             className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
//           >
//             Administrator
//           </button>
          
//           <button
//             onClick={() => handleRoleSelect('employee')}
//             className="w-full py-3 px-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg font-medium transition-colors"
//           >
//             Employee
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoleSelection;










import { Link } from 'react-router-dom';

const RoleSelection = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Productivity Tracker</h1>
        <p className="text-muted-foreground mb-8">Select your role to continue</p>
        
        <div className="space-y-4">
          <Link
            to="/admin-signin"
            className="block w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
          >
            Administrator
          </Link>
          
          <Link
            to="/employee-signin"
            className="block w-full py-3 px-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg font-medium transition-colors"
          >
            Employee
          </Link>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6">
          Don't have an account? Contact your administrator to get access.
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;