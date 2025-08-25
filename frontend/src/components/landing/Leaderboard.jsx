const Leaderboard = () => {
  const leaders = [
    { name: 'John Doe', score: 95, position: 1 },
    { name: 'Jane Smith', score: 92, position: 2 },
    { name: 'Robert Johnson', score: 88, position: 3 },
    { name: 'Emily Davis', score: 85, position: 4 },
    { name: 'Michael Wilson', score: 82, position: 5 },
  ];

  return (
    <section className="py-16 px-4 bg-card border-b border-border">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground text-center mb-8">Leaderboard</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Join the top performers and climb the leaderboard. Our gamification system rewards productivity and engagement.
        </p>
        
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-foreground">Position</th>
                <th className="text-left p-4 font-medium text-foreground">Name</th>
                <th className="text-left p-4 font-medium text-foreground">Score</th>
                <th className="text-left p-4 font-medium text-foreground">Badges</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader) => (
                <tr key={leader.position} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                      {leader.position}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-foreground">{leader.name}</td>
                  <td className="p-4 text-foreground">{leader.score}%</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {leader.score >= 90 && <span className="text-xl">🥇</span>}
                      {leader.score >= 80 && leader.score < 90 && <span className="text-xl">🥈</span>}
                      {leader.score >= 70 && leader.score < 80 && <span className="text-xl">🥉</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;