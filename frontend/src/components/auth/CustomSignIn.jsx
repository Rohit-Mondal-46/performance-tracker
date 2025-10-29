import { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const CustomSignIn = ({ role }) => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoaded) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // First, try to sign in
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        // Successfully signed in
        await setActive({ session: signInAttempt.createdSessionId });
        // Store role in session storage
        sessionStorage.setItem('userRole', role);
        navigate(role === 'admin' ? '/admin-dashboard' : '/employee-dashboard');
      } else {
        // Handle other statuses (like needing 2FA)
        setError('Additional verification required. Please contact your administrator.');
        console.error('Sign in status:', signInAttempt.status);
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'An error occurred during sign in. Please check your credentials.');
      console.error('Error signing in:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {role === 'admin' ? 'Administrator' : 'Employee'} Sign In
          </h1>
          <p className="text-muted-foreground mt-2">
            Access your {role === 'admin' ? 'admin' : 'employee'} dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive-foreground p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !isLoaded}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a 
            href="/role-selection" 
            className="text-primary hover:text-primary/80 text-sm"
          >
            ← Back to role selection
          </a>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Don't have an account? Contact your administrator to get access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomSignIn;