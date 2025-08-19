import React from 'react';
import CameraMonitor from '../components/CameraMonitor';

const Home = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Home Dashboard</h1>
      <CameraMonitor />
    </div>
  );
};

export default Home;
