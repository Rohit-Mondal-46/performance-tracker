import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Unauthorized Access</h2>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page. Please contact your administrator.
        </p>
        <Link
          to="/"
          className="inline-block py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;