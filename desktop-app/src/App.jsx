// import React, { useState } from "react";
// import Navbar from "./components/Navbar";
// import CameraMonitor from "./components/CameraMonitor";
// import Dashboard from "./components/Dashboard";
// import VoiceControl from "./components/VoiceControl";
// import GestureControl from "./components/GestureControl";
// import OrgSwitcher from "./components/OrgSwitcher";

// const App = () => {
//   // State
//   const [activeOrg, setActiveOrg] = useState("Org A");
//   const [currentPage, setCurrentPage] = useState("home");

//   // Handlers
//   const handleSwitchOrg = (org) => setActiveOrg(org);
//   const handleGoHome = () => setCurrentPage("home");
//   const handleNext = () => setCurrentPage("dashboard");
//   const handlePrevious = () => setCurrentPage("home");

//   return (
//     <div className="h-screen w-screen flex flex-col bg-gray-50">
//       <Navbar />

//       <div className="flex flex-1 p-4 gap-4">
//         {/* Sidebar / Controls */}
//         <div className="w-64 flex flex-col gap-4">
//           <OrgSwitcher activeOrg={activeOrg} onSwitchOrg={handleSwitchOrg} />
//           <VoiceControl onSwitchOrg={() => handleSwitchOrg("Org B")} onGoHome={handleGoHome} />
//           <GestureControl onNext={handleNext} onPrevious={handlePrevious} />
//         </div>

//         {/* Main content */}
//         <div className="flex-1 flex flex-col gap-4">
//           {currentPage === "home" && (
//             <>
//               <CameraMonitor activeOrg={activeOrg} />
//               <Dashboard activeOrg={activeOrg} />
//             </>
//           )}
//           {currentPage === "dashboard" && <Dashboard activeOrg={activeOrg} />}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;



import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;