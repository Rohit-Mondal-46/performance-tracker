
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

// main.jsx or index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { logEnvironment } from './utils/electronDetect';
import './index.css';

// Log environment info for debugging
logEnvironment();

console.log('🎯 Starting React render...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React root...');
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('✅ React root created, rendering app...');
    
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
    
    console.log('✅ React render initiated');
  } catch (error) {
    console.error('❌ React render error:', error);
  }
}