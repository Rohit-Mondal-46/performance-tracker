const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'For small teams getting started with productivity monitoring',
      features: ['Up to 5 users', 'Basic analytics', 'Email support'],
      cta: 'Get Started',
    },
    {
      name: 'Small Organization',
      price: '$49',
      description: 'For growing teams needing more advanced features',
      features: ['Up to 25 users', 'Advanced analytics', 'Priority support', 'Custom reports'],
      cta: 'Buy Now',
      popular: true,
    },
    {
      name: 'Large Organization',
      price: '$99',
      description: 'For enterprises requiring full-featured productivity monitoring',
      features: ['Unlimited users', 'AI-powered insights', '24/7 support', 'API access', 'Custom integrations'],
      cta: 'Contact Sales',
    },
  ];

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground text-center mb-4">Pricing</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Choose the plan that works best for your organization. All plans include core features with options to scale.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-card border rounded-lg p-6 relative ${
                plan.popular ? 'border-primary shadow-lg' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-foreground mb-4">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              
              <ul className="mb-8 space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;