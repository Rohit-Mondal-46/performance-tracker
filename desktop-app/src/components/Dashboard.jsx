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


// import React, { useEffect, useState } from "react";

// // Helper for simple icons (you can replace with an icon library like Heroicons)
// const StatusIcon = ({ status }) => {
//   const iconClass = "w-8 h-8 inline-block";
//   switch (status) {
//     case 'working':
//       return <span className={`${iconClass} text-green-500`}>✓</span>;
//     case 'idle':
//       return <span className={`${iconClass} text-yellow-500`}>⏸</span>;
//     case 'distracted':
//       return <span className={`${iconClass} text-red-500`}>✕</span>;
//     default:
//       return null;
//   }
// };

// const Dashboard = ({ activeOrg, detailedView = false }) => {
//   const [stats, setStats] = useState({
//     working: 0,
//     idle: 0,
//     distracted: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchStats = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         // --- THIS IS WHERE YOUR API CALL WOULD GO ---
//         // Example: const response = await fetch(`/api/stats?org=${activeOrg}`);
//         // const data = await response.json();
//         // setStats(data);
        
//         // Simulating a network request
//         await new Promise(resolve => setTimeout(resolve, 800)); 
        
//         // Placeholder data that changes with the organization
//         const mockData = {
//           "Org A": { working: 12, idle: 3, distracted: 2 },
//           "Org B": { working: 8, idle: 5, distracted: 1 },
//           "Org C": { working: 15, idle: 2, distracted: 4 },
//           "Org D": { working: 6, idle: 6, distracted: 2 },
//         };
        
//         setStats(mockData[activeOrg] || { working: 0, idle: 0, distracted: 0 });

//       } catch (err) {
//         console.error("Failed to fetch dashboard stats:", err);
//         setError("Failed to load statistics.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, [activeOrg]); // Rerun effect when activeOrg changes

//   const statusItems = [
//     { key: 'working', label: 'Working', bgColor: 'bg-green-100', textColor: 'text-green-800' },
//     { key: 'idle', label: 'Idle', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
//     { key: 'distracted', label: 'Distracted', bgColor: 'bg-red-100', textColor: 'text-red-800' },
//   ];

//   if (loading) {
//     return (
//       <div className="border rounded p-4 bg-white shadow flex items-center justify-center h-48">
//         <div className="text-gray-500">Loading statistics...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="border rounded p-4 bg-white shadow flex items-center justify-center h-48">
//         <div className="text-red-500">{error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="border rounded p-4 bg-white shadow flex flex-col gap-4">
//       <h2 className="font-bold text-xl text-gray-800">
//         {detailedView ? 'Detailed Analytics' : 'Activity Overview'} - {activeOrg}
//       </h2>
      
//       {/* Simple Grid View for Home Page */}
//       {!detailedView && (
//         <div className="grid grid-cols-3 gap-4">
//           {statusItems.map(item => (
//             <div key={item.key} className={`${item.bgColor} rounded-lg p-4 text-center`}>
//               <StatusIcon status={item.key} />
//               <p className={`font-semibold mt-2 ${item.textColor}`}>{item.label}</p>
//               <p className={`text-2xl font-bold ${item.textColor}`}>{stats[item.key]}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Detailed List View for Dashboard Page */}
//       {detailedView && (
//         <div className="space-y-2">
//           {statusItems.map(item => (
//             <div key={item.key} className={`flex items-center justify-between p-3 rounded-lg ${item.bgColor}`}>
//               <div className="flex items-center gap-3">
//                 <StatusIcon status={item.key} />
//                 <span className={`font-semibold ${item.textColor}`}>{item.label}</span>
//               </div>
//               <span className={`text-xl font-bold ${item.textColor}`}>{stats[item.key]} employees</span>
//             </div>
//           ))}
//           <div className="mt-4 p-3 bg-gray-100 rounded-lg">
//             <p className="text-sm text-gray-600">
//               Total Tracked: <span className="font-bold">{stats.working + stats.idle + stats.distracted}</span>
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;