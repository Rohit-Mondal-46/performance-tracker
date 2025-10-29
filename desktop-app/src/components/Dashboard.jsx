import React, { useEffect, useState } from "react";

const Dashboard = ({ activeOrg }) => {
  const [stats, setStats] = useState({
    working: 0,
    idle: 0,
    distracted: 0,
  });

  useEffect(() => {
    // Placeholder: fetch stats from backend for the selected org
    // Replace with API call later
    setStats({ working: 5, idle: 2, distracted: 1 });
  }, [activeOrg]);

  return (
    <div className="border rounded p-4 bg-white shadow flex flex-col gap-2">
      <h2 className="font-bold text-lg">Dashboard - {activeOrg}</h2>
      <div className="flex gap-4">
        <div className="flex-1 p-2 bg-green-100 rounded">
          <p className="font-semibold">Working</p>
          <p>{stats.working}</p>
        </div>
        <div className="flex-1 p-2 bg-yellow-100 rounded">
          <p className="font-semibold">Idle</p>
          <p>{stats.idle}</p>
        </div>
        <div className="flex-1 p-2 bg-red-100 rounded">
          <p className="font-semibold">Distracted</p>
          <p>{stats.distracted}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
