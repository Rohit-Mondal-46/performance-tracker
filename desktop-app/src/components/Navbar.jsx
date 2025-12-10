import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="font-bold">Performance Monitor</h1>
      <div>
        <button className="px-2 py-1 hover:bg-blue-700 rounded">Home</button>
        {/* Removed Reports button */}
      </div>
    </nav>
  );
};

export default Navbar;

// import React from 'react';

// // Update the component to accept 'user' and 'onLogout' props
// const Navbar = ({ user, onLogout }) => {
//   return (
//     // Using a header element with more modern styling
//     <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
//       <div className="flex justify-between items-center">
//         {/* Left side: App Title */}
//         <h1 className="text-2xl font-bold text-gray-800">Performance Monitor</h1>
        
//         {/* Right side: User Info and Logout Button */}
//         <div className="flex items-center space-x-4">
//           {/* Display a welcome message with the user's email */}
//           <span className="text-sm text-gray-600">
//             Welcome, {user?.email || 'User'}
//           </span>
          
//           {/* Logout button that calls the onLogout function when clicked */}
//           <button
//             onClick={onLogout}
//             className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;