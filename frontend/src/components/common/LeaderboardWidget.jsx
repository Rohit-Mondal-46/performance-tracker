const LeaderboardWidget = () => {
  // In a real app, this would come from an API
  const leaders = [
    { id: 1, name: 'John Doe', score: 95, position: 1 },
    { id: 2, name: 'Jane Smith', score: 92, position: 2 },
    { id: 3, name: 'Robert Johnson', score: 88, position: 3 },
    { id: 4, name: 'You', score: 85, position: 4, isCurrentUser: true },
    { id: 5, name: 'Michael Wilson', score: 82, position: 5 },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Leaderboard</h3>
      
      <div className="space-y-3">
        {leaders.map(user => (
          <div 
            key={user.id} 
            className={`flex items-center justify-between p-2 rounded-lg ${
              user.isCurrentUser ? 'bg-primary/10 border border-primary' : ''
            }`}
          >
            <div className="flex items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                user.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                user.position === 2 ? 'bg-gray-100 text-gray-800' :
                user.position === 3 ? 'bg-amber-100 text-amber-800' :
                'bg-muted'
              }`}>
                {user.position}
              </div>
              <span className={`ml-3 ${user.isCurrentUser ? 'font-semibold text-primary' : 'text-foreground'}`}>
                {user.name}
              </span>
            </div>
            <span className="font-medium text-foreground">{user.score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardWidget;