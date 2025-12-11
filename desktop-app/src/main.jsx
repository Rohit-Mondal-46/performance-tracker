// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('❌ React render error:', error);
  }
}