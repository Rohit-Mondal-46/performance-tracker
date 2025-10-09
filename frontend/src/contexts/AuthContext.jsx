import React, { createContext, useContext, useState } from 'react';
import { realTimeDataService } from '../services/realTimeDataService';


const AuthContext = createContext(undefined);

// Initial users - will be expanded dynamically
const initialUsers= [
  {
    id: '1',
    name: 'System Administrator',
    email: 'admin@promonitor.com',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'hr@promonitor.com',
    role: 'hr_manager',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'employee@promonitor.com',
    role: 'employee',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

// Store passwords separately (in real app, this would be hashed and stored securely)
const initialPasswords= [
  ['admin@promonitor.com', 'admin123'],
  ['hr@promonitor.com', 'hr123'],
  ['employee@promonitor.com', 'employee123']
];

// Initialize with copies to avoid reference issues
let mockUsers= [...initialUsers];
let userPasswords= new Map(initialPasswords);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Available users:', mockUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
    console.log('Available passwords:', Array.from(userPasswords.entries()));
    
    const foundUser = mockUsers.find(u => u.email === email);
    const storedPassword = userPasswords.get(email);
    
    console.log('Found user:', foundUser ? { id: foundUser.id, email: foundUser.email, role: foundUser.role } : null);
    console.log('Stored password for', email, ':', storedPassword);
    console.log('Password match:', storedPassword === password);
    
    if (foundUser && storedPassword && storedPassword === password) {
      console.log('✅ LOGIN SUCCESS for:', email);
      setUser(foundUser);
      
      // Initialize user in real-time service only for employees
      if (foundUser.role === 'employee') {
        realTimeDataService.initializeUser(foundUser);
      }
      
      return true;
    }
    
    console.log('❌ LOGIN FAILED for:', email);
    console.log('Reason:', !foundUser ? 'User not found' : !storedPassword ? 'No password stored' : 'Password mismatch');
    return false;
  };

  const logout = () => {
    if (user && user.role === 'employee') {
      realTimeDataService.removeUser(user.id);
    }
    setUser(null);
  };

  const registerUser = async (name, email, password, role) => {
    console.log('=== USER REGISTRATION ===');
    console.log('Registering user:', { name, email, role });
    console.log('Password:', password);
    
    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return false;
    }

    // Generate new user ID
    const newId = (Math.max(...mockUsers.map(u => parseInt(u.id))) + 1).toString();
    console.log('Generated new ID:', newId);
    
    // Generate avatar URL
    const avatarUrls = [
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    ];
    
    const newUser= {
      id: newId,
      name,
      email,
      role,
      avatar: avatarUrls[Math.floor(Math.random() * avatarUrls.length)]
    };

    // Add user to arrays
    mockUsers.push(newUser);
    userPasswords.set(email, password);
    
    console.log('✅ User registered successfully');
    console.log('New user:', { id: newUser.id, email: newUser.email, role: newUser.role });
    console.log('Updated users count:', mockUsers.length);
    console.log('Updated passwords count:', userPasswords.size);
    console.log('All users:', mockUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
    console.log('All passwords:', Array.from(userPasswords.entries()));
    
    // Add to real-time service if it's an employee
    if (role === 'employee') {
      realTimeDataService.addUser(newUser);
    }
    
    return true;
  };

  const getAllUsers = () => {
    return [...mockUsers];
  };

  const deleteUser = (userId) => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;
    
    const userToDelete = mockUsers[userIndex];
    
    // Don't allow deleting initial demo users
    if (userToDelete.email === 'admin@promonitor.com' ||
        userToDelete.email === 'hr@promonitor.com' ||
        userToDelete.email === 'employee@promonitor.com') {
      console.log('Cannot delete demo user:', userToDelete.email);
      return false;
    }
    
    mockUsers.splice(userIndex, 1);
    userPasswords.delete(userToDelete.email);
    
    console.log('User deleted:', userToDelete.email);
    console.log('Remaining users:', mockUsers.map(u => u.email));
    
    // Remove from real-time service
    realTimeDataService.removeUser(userId);
    
    return true;
  };

  const isAdmin = user?.role === 'admin';
  const isHRManager = user?.role === 'hr_manager';
  const isEmployee = user?.role === 'employee';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin,
      isHRManager,
      isEmployee,
      registerUser,
      getAllUsers,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}