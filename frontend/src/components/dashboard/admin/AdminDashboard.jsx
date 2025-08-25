import { useState } from 'react';
import Header from '../../common/Header';
import Sidebar from '../../common/Sidebar';
import UserStats from './UserStats';
import LiveMonitoring from './LiveMonitoring';
import EmployeeReports from './EmployeeReports';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');

  const sidebarItems = [
    { id: 'stats', label: 'User Statistics' },
    { id: 'monitoring', label: 'Live Monitoring' },
    { id: 'reports', label: 'Employee Reports' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <UserStats />;
      case 'monitoring':
        return <LiveMonitoring />;
      case 'reports':
        return <EmployeeReports />;
      default:
        return <UserStats />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        items={sidebarItems} 
        activeItem={activeTab} 
        onItemClick={setActiveTab} 
      />
      <div className="flex-1 flex flex-col">
        <Header title="Admin Dashboard" />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;