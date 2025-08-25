import { SignIn } from '@clerk/clerk-react';

const ClerkLogin = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card border border-border rounded-lg shadow-lg",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "border-border text-foreground",
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
            footerActionLink: "text-primary hover:text-primary/80"
          }
        }}
      />
    </div>
  );
};

export default ClerkLogin;