// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import RoleSelection from './components/auth/RoleSelection';
// import AdminDashboard from './pages/AdminDashboard';
// import EmployeeDashboard from './pages/EmployeeDashboard';
// import Unauthorized from './pages/Unauthorized';
// import ProtectedRoute from './components/auth/ProtectedRoute';
// import './index.css';

// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/unauthorized" element={<Unauthorized />} />
//           <Route
//             path="/role-selection"
//             element={
//               <ProtectedRoute>
//                 <RoleSelection />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin-dashboard"
//             element={
//               <ProtectedRoute requiredRole="admin">
//                 <AdminDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/employee-dashboard"
//             element={
//               <ProtectedRoute requiredRole="employee">
//                 <EmployeeDashboard />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;








import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Home from './pages/Home';
import RoleSelection from './components/auth/RoleSelection';
import AdminSignIn from './components/auth/AdminSignIn';
import EmployeeSignIn from './components/auth/EmployeeSignIn';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          
          {/* Auth routes - only accessible when signed out */}
          <Route 
            path="/admin-signin" 
            element={
              <SignedOut>
                <AdminSignIn />
              </SignedOut>
            } 
          />
          <Route 
            path="/employee-signin" 
            element={
              <SignedOut>
                <EmployeeSignIn />
              </SignedOut>
            } 
          />
          
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes - only accessible when signed in */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;