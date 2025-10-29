import React from 'react';
import CameraMonitor from '../components/CameraMonitor';
import GestureControl from '../components/GestureControl';

const Home = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Home Dashboard</h1>
      <CameraMonitor />
      <GestureControl />
    </div>
  );
};

export default Home;
