import React from 'react';

const LiveStatus = ({ users }) => {
  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Live Status</h3>
      <ul>
        {users?.map((user, idx) => (
          <li key={idx} className="mb-1">{user.name} - {user.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default LiveStatus;
