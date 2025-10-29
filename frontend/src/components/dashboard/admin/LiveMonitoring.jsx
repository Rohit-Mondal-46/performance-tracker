import { useState, useEffect } from 'react';
import { USER_STATUS, STATUS_COLORS, STATUS_LABELS } from '../../../utils/constants';

const LiveMonitoring = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate fetching user data
    const mockUsers = [
      { id: 1, name: 'John Doe', status: USER_STATUS.ACTIVE, productivity: 85 },
      { id: 2, name: 'Jane Smith', status: USER_STATUS.ACTIVE, productivity: 92 },
      { id: 3, name: 'Robert Johnson', status: USER_STATUS.IDLE, productivity: 45 },
      { id: 4, name: 'Emily Davis', status: USER_STATUS.DISTRACTED, productivity: 30 },
      { id: 5, name: 'Michael Wilson', status: USER_STATUS.ACTIVE, productivity: 88 },
      { id: 6, name: 'Sarah Brown', status: USER_STATUS.OFFLINE, productivity: 0 },
      { id: 7, name: 'David Miller', status: USER_STATUS.ACTIVE, productivity: 79 },
      { id: 8, name: 'Lisa Taylor', status: USER_STATUS.IDLE, productivity: 50 },
    ];

    setUsers(mockUsers);
  }, []);

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(user => user.status === filter);

  const getStatusCount = (status) => {
    return users.filter(user => user.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.values(USER_STATUS).map(status => (
          <div 
            key={status} 
            className="bg-card border border-border rounded-lg p-4 text-center cursor-pointer hover:bg-card/80 transition-colors"
            onClick={() => setFilter(status)}
          >
            <div className={`w-4 h-4 ${STATUS_COLORS[status]} rounded-full mx-auto mb-2`}></div>
            <p className="text-2xl font-bold text-foreground">{getStatusCount(status)}</p>
            <p className="text-sm text-muted-foreground">{STATUS_LABELS[status]}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {filter === 'all' ? 'All Users' : STATUS_LABELS[filter]} ({filteredUsers.length})
          </h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">All Statuses</option>
            {Object.values(USER_STATUS).map(status => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-foreground">User</th>
                <th className="text-left p-3 font-medium text-foreground">Status</th>
                <th className="text-left p-3 font-medium text-foreground">Productivity</th>
                <th className="text-left p-3 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="p-3 text-foreground">{user.name}</td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${STATUS_COLORS[user.status]} rounded-full mr-2`}></div>
                      <span>{STATUS_LABELS[user.status]}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${user.productivity}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{user.productivity}%</span>
                  </td>
                  <td className="p-3">
                    <button className="text-primary hover:text-primary/80 text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;