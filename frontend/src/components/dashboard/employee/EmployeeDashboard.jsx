import { useState } from 'react';
import Header from '../../common/Header';
import Sidebar from '../../common/Sidebar';
import PerformanceMetrics from './PerformanceMetrics';
import StatusIndicator from './StatusIndicator';
import MyReports from './MyReports';

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('metrics');

  const sidebarItems = [
    { id: 'metrics', label: 'Performance Metrics' },
    { id: 'status', label: 'Status Indicator' },
    { id: 'reports', label: 'My Reports' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'metrics':
        return <PerformanceMetrics />;
      case 'status':
        return <StatusIndicator />;
      case 'reports':
        return <MyReports />;
      default:
        return <PerformanceMetrics />;
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
        <Header title="Employee Dashboard" />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;