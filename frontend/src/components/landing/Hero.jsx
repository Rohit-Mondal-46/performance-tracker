// import { Link } from 'react-router-dom';
// import { SignedIn, SignedOut } from '@clerk/clerk-react';

// const Hero = () => {
//   return (
//     <section className="py-16 px-4 bg-card border-b border-border">
//       <div className="max-w-6xl mx-auto text-center">
//         <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
//           Boost Productivity with AI-Powered Monitoring
//         </h1>
//         <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
//           Track, analyze, and improve team performance with our comprehensive productivity monitoring solution.
//         </p>
        
//         <SignedOut>
//           <Link
//             to="/login"
//             className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-lg transition-colors"
//           >
//             Get Started
//           </Link>
//         </SignedOut>
        
//         <SignedIn>
//           <Link
//             to="/role-selection"
//             className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-lg transition-colors"
//           >
//             Go to Dashboard
//           </Link>
//         </SignedIn>
//       </div>
//     </section>
//   );
// };

// export default Hero;







import { Link } from 'react-router-dom';
import { SignedOut } from '@clerk/clerk-react';

const Hero = () => {
  return (
    <section className="py-16 px-4 bg-card border-b border-border">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          AI-Powered Productivity Monitoring
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Fair, transparent, and automated performance evaluation for workplaces and classrooms.
        </p>
        
        <SignedOut>
          <Link
            to="/role-selection"
            className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-lg transition-colors"
          >
            Get Started
          </Link>
        </SignedOut>
        
        <div className="mt-10 text-sm text-muted-foreground">
          <p>Administrators are manually added to the system</p>
          <p>Employees receive credentials from their administrator</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;