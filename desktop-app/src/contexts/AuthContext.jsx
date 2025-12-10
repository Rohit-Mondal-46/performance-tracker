// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { authAPI } from '../services/api';

// const AuthContext = createContext(undefined);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Check for existing session on mount
//   useEffect(() => {
//     const initAuth = async () => {
//       const token = localStorage.getItem('token');
//       const savedUser = localStorage.getItem('user');
      
//       if (token && savedUser) {
//         try {
//           // Verify token is still valid
//           const response = await authAPI.getCurrentUser();
//           if (response.data.success) {
//             setUser(JSON.parse(savedUser));
//           } else {
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//           }
//         } catch (error) {
//           console.error('Session verification failed:', error);
//           localStorage.removeItem('token');
//           localStorage.removeItem('user');
//         }
//       }
//       setLoading(false);
//     };

//     initAuth();
//   }, []);

//   const login = async (email, password) => {
//     try {
//       console.log('=== LOGIN ATTEMPT ===');
//       console.log('Email:', email);
      
//       // Call employee login endpoint
//       const response = await authAPI.employeeLogin(email, password);
      
//       if (response.data.success && response.data.data.token) {
//         const { token, user: userData, role } = response.data.data;
        
//         // Ensure role is part of user object
//         const userWithRole = {
//           ...userData,
//           role: role || userData.role // Use role from response or fallback to userData.role
//         };
        
//         // Store token and user data
//         localStorage.setItem('token', token);
//         localStorage.setItem('user', JSON.stringify(userWithRole));
        
//         setUser(userWithRole);
//         console.log('✅ LOGIN SUCCESS:', userWithRole);
        
//         return { success: true, user: userWithRole };
//       }
      
//       return { success: false, message: 'Login failed' };
//     } catch (error) {
//       console.error('❌ LOGIN FAILED:', error);
//       const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
//       return { success: false, message };
//     }
//   };

//   const logout = async () => {
//     try {
//       await authAPI.logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       setUser(null);
//     }
//   };

//   const isEmployee = user?.role === 'employee';

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900">
//         <div className="text-white text-xl">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <AuthContext.Provider value={{
//       user,
//       login,
//       logout,
//       isEmployee,
//       loading
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }