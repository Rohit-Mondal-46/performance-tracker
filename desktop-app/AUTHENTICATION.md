# Desktop App Authentication System

## Overview

The Performance Tracker Desktop App now includes a comprehensive JWT-based authentication system integrated with the backend API, featuring role-based access control and secure token management.

## Features

### 🔐 JWT Authentication System
- **Backend Integration**: Full integration with the Performance Tracker backend API
- **JWT Token Management**: Secure token-based authentication with automatic refresh
- **Role Selection Interface**: Choose from Admin, HR Manager, or Employee roles
- **Secure Login Form**: Email and password authentication with backend validation
- **Session Persistence**: JWT tokens and user data maintained in localStorage
- **Auto-fill Demo Credentials**: Quick access to test accounts
- **Automatic Token Validation**: Tokens verified on app startup and API calls

### 👥 User Roles

1. **Admin** (`admin@promonitor.com` / `admin123`)
   - Full system access
   - User management capabilities
   - System configuration

2. **HR Manager** (`hr@promonitor.com` / `hr123`)
   - Employee management
   - Performance reports
   - Team analytics

3. **Employee** (`employee@promonitor.com` / `employee123`)
   - Personal performance tracking
   - Activity monitoring
   - Individual dashboard

### 🛡️ Security Features
- **JWT Token Authentication**: Secure token-based authentication with the backend
- **Protected Routes**: All app content requires valid JWT tokens
- **Automatic Token Refresh**: Tokens verified with backend on app startup
- **Secure API Calls**: All API requests include JWT tokens in Authorization header
- **Token Expiration Handling**: Automatic logout when tokens expire
- **Secure Logout**: Clears both client-side tokens and notifies backend
- **Input Validation**: Email and password validation on both client and server
- **Error Handling**: User-friendly error messages with proper HTTP status codes
- **CORS Protection**: Backend configured with proper CORS policies

### 🎨 UI/UX Features
- **Modern Design**: Glass morphism effects with gradient backgrounds
- **Responsive Layout**: Works on different screen sizes
- **Smooth Animations**: Floating elements and fade-in effects
- **Intuitive Navigation**: Clear role selection and login flow

## Backend Integration

The desktop app now integrates with your existing JWT authentication backend:

### 🔌 API Integration
- **Authentication Endpoints**: Uses existing `/api/auth/*` endpoints
- **Mock Mode**: Backend runs in mock mode for testing without database
- **JWT Token Flow**: Complete token generation, validation, and management
- **Role-based Endpoints**: Separate login endpoints for admin, organization, and employee roles

### 🗄️ Mock Data (Development)
For development without a database, the backend uses mock data:
```javascript
// Mock users with bcrypt hashed passwords
const mockUsers = [
  { id: '1', email: 'admin@promonitor.com', role: 'admin' },
  { id: '2', email: 'hr@promonitor.com', role: 'organization' },
  { id: '3', email: 'employee@promonitor.com', role: 'employee' }
];
```

## Getting Started

### Prerequisites
- Backend server must be running on `http://localhost:3000`
- Frontend dev server runs on `http://localhost:5173`

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start the Desktop App**:
   ```bash
   cd desktop-app
   npm install
   npm run dev
   ```

2. **Access the App**: 
   - Open http://localhost:5173/
   - Select a role from the role selection screen
   - Use the provided demo credentials or click "Click to fill credentials"

3. **Test Different Roles**:
   - Try logging in as different roles to see role-based features
   - Use the logout button in the navbar to switch between roles

## File Structure

```
src/
├── contexts/
│   └── AuthContext.jsx          # JWT authentication context with backend integration
├── services/
│   └── api.js                   # Axios-based API service with JWT token management
├── components/
│   ├── ProtectedRoute.jsx       # Route protection with JWT token validation
│   └── Navbar.jsx              # Updated with user info and secure logout
├── pages/
│   └── Login.jsx               # Login page with backend API integration
├── .env                        # API configuration (REACT_APP_API_URL)
└── App.jsx                     # Main app with JWT authentication flow
```

## Key Components

### API Service (`api.js`)
- Axios client configured for JWT authentication
- Automatic token inclusion in request headers
- Response interceptors for token expiration handling
- Centralized API endpoint management
- Error handling and token refresh logic

### AuthContext
- Manages JWT token and authentication state
- Integrates with backend authentication API
- Provides login/logout functions with backend calls
- Handles token persistence and validation
- User role checking utilities
- Automatic token verification on app startup

### Login Component
- Role selection interface
- Login form with validation
- Demo credential auto-fill
- Error handling and loading states

### ProtectedRoute
- Blocks access to authenticated content
- Shows login screen for unauthenticated users
- Loading state management

### Updated Navbar
- Displays current user information
- Shows user role badge
- Logout functionality with confirmation

## Usage Examples

### Using Authentication in Components
```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAdmin, logout } = useAuth();
  
  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      {isAdmin && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Checking User Roles
```jsx
const { isAdmin, isHRManager, isEmployee } = useAuth();

if (isAdmin) {
  // Show admin features
} else if (isHRManager) {
  // Show HR manager features
} else if (isEmployee) {
  // Show employee features
}
```

## Development Notes

- Authentication data is stored in localStorage for persistence
- Demo passwords are hardcoded for development purposes
- In production, implement proper backend authentication
- Consider adding password reset functionality
- Add two-factor authentication for enhanced security

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@promonitor.com | admin123 |
| HR Manager | hr@promonitor.com | hr123 |
| Employee | employee@promonitor.com | employee123 |

## Next Steps

1. **Backend Integration**: Connect to real authentication API
2. **Password Security**: Implement proper password hashing
3. **Role Permissions**: Fine-tune role-based feature access
4. **User Profile**: Add user profile management
5. **Session Management**: Implement token-based authentication