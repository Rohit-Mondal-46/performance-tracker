import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminProfile } from '../components/profile/AdminProfile.jsx';
import { HRManagerProfile } from '../components/profile/HRManagerProfile.jsx';
import { EmployeeProfile } from '../components/profile/EmployeeProfile.jsx';

export function Profile() {
  const { user, isAdmin, isHRManager } = useAuth();

  if (isAdmin) {
    return <AdminProfile user={user} />;
  }

  if (isHRManager) {
    return <HRManagerProfile user={user} />;
  }

  return <EmployeeProfile user={user} />;
}