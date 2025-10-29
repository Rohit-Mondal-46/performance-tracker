const Features = () => {
  const features = [
    {
      title: 'Real-time Monitoring',
      description: 'Track employee activity in real-time with AI-powered analysis.',
      icon: '🔄',
    },
    {
      title: 'Detailed Analytics',
      description: 'Get comprehensive reports and insights into team performance.',
      icon: '📊',
    },
    {
      title: 'Gamification',
      description: 'Motivate your team with badges, leaderboards, and achievements.',
      icon: '🏆',
    },
    {
      title: 'Role-based Access',
      description: 'Different dashboards for admins and employees with appropriate controls.',
      icon: '👥',
    },
  ];

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;