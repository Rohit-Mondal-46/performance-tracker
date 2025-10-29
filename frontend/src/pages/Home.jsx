// import { Link } from 'react-router-dom';
// import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
// import Hero from '../components/landing/Hero';
// import Features from '../components/landing/Features';
// import Leaderboard from '../components/landing/Leaderboard';

// const Home = () => {
//   return (
//     <div className="min-h-screen bg-background">
//       <header className="bg-card border-b border-border p-4 flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-foreground">Productivity Monitor</h1>
//         <div>
//           <SignedIn>
//             <UserButton afterSignOutUrl="/" />
//           </SignedIn>
//           <SignedOut>
//             <Link to="/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
//               Sign In
//             </Link>
//           </SignedOut>
//         </div>
//       </header>
      
//       <main>
//         <Hero />
//         <Features />
//         <Leaderboard />
//       </main>
      
//       <footer className="bg-card border-t border-border p-6 text-center text-muted-foreground">
//         <p>&copy; 2023 Productivity Monitor. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default Home;








import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Leaderboard from '../components/landing/Leaderboard';
import Pricing from '../components/landing/Pricing';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Productivity Monitor</h1>
        <div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link to="/role-selection" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Sign In
            </Link>
          </SignedOut>
        </div>
      </header>
      
      <main>
        <Hero />
        <Features />
        <Leaderboard />
        <Pricing />
      </main>
      
      <footer className="bg-card border-t border-border p-6 text-center text-muted-foreground">
        <p>&copy; 2023 Productivity Monitor. All rights reserved.</p>
        <p className="text-sm mt-2">Contact your administrator to get access to the system.</p>
      </footer>
    </div>
  );
};

export default Home;