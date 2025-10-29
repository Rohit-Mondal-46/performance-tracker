const GamificationBadges = ({ userId }) => {
  // In a real app, this would come from an API
  const badges = [
    { id: 1, name: 'Early Bird', icon: '🌅', description: 'Logged in before 8 AM for 5 consecutive days' },
    { id: 2, name: 'Productivity Master', icon: '🚀', description: 'Maintained over 90% productivity for a week' },
    { id: 3, name: 'Focus Champion', icon: '🎯', description: 'Stayed focused for more than 4 hours continuously' },
    { id: 4, name: 'Team Player', icon: '🤝', description: 'Collaborated with 5 different team members' },
  ];

  const userBadges = [1, 3]; // IDs of badges the user has earned

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Your Badges</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map(badge => (
          <div 
            key={badge.id} 
            className={`p-4 rounded-lg text-center ${
              userBadges.includes(badge.id)
                ? 'bg-primary/10 border border-primary'
                : 'bg-muted opacity-50'
            }`}
          >
            <div className="text-3xl mb-2">{badge.icon}</div>
            <p className="font-medium text-foreground">{badge.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamificationBadges;