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
