# VISTA Frontend - Web Dashboard

React-based web application providing role-based dashboards and analytics for the VISTA AI Performance Tracking System.

## Overview

The frontend serves as the web interface for admins, organizations, and employees to access performance analytics, manage users, and view activity insights. Built with React, TailwindCSS, and modern UI animations.

## Features

### Role-Based Dashboards
- **Admin Dashboard**: System-wide view, create/manage organizations
- **Organization Dashboard**: Team analytics, employee management, activity monitoring
- **Employee Dashboard**: Personal performance metrics, activity history

### Key Capabilities
- **Real-time Analytics**: Visualize productivity, engagement, and activity patterns using Recharts
- **JWT Authentication**: Secure role-based access with token refresh
- **Responsive Design**: Mobile-friendly UI with TailwindCSS
- **Modern UI/UX**: Framer Motion animations, 3D effects, particle backgrounds
- **PDF Export**: Generate performance reports (html2canvas + jsPDF)
- **Landing Page**: Marketing site with features, pricing, testimonials

## Tech Stack

- **Framework**: React 19 + Vite 7
- **Routing**: React Router DOM v7
- **Styling**: TailwindCSS + PostCSS
- **HTTP Client**: Axios (with JWT interceptor)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Export**: html2canvas, jsPDF

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx                 # Main layout wrapper
│   │   ├── landing sections/          # Marketing page sections
│   │   ├── layout/                    # Navigation components
│   │   └── ui/                        # Reusable UI components
│   ├── contexts/
│   │   ├── AuthContext.jsx            # JWT auth state management
│   │   └── ThemeContext.jsx           # Theme switching
│   ├── pages/
│   │   ├── AdminDashboard.jsx         # Admin interface
│   │   ├── OrganizationDashboard.jsx  # Organization interface
│   │   ├── EmployeeDashboard.jsx      # Employee interface
│   │   ├── Landing.jsx                # Marketing landing page
│   │   └── Login.jsx                  # Authentication page
│   ├── services/
│   │   └── api.js                     # Axios instance + interceptors
│   └── data/                          # Static data (features, pricing)
├── .env                               # Environment variables
└── vite.config.js                     # Vite configuration
```

## Getting Started

### Prerequisites
- Node.js 16+
- Backend server running on `http://localhost:3000`

### Installation

```bash
cd frontend
npm install
```

### Configuration

Create `.env` file:
```env
VITE_API_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```
Access at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview  # Preview production build
```

## Authentication Flow

1. User logs in via `/login` with role selection
2. Backend returns JWT token + user data
3. `AuthContext` stores token in `localStorage`
4. Axios interceptor adds `Authorization: Bearer <token>` to all requests
5. Protected routes check authentication status via `ProtectedRoute` component

### Role-Based Access
- `/admin/*` - Admin only
- `/organization/*` - Organization only
- `/employee/*` - Employee only

## Key Components

### AuthContext (`src/contexts/AuthContext.jsx`)
- Manages authentication state globally
- Stores JWT token and user info in localStorage
- Provides `login`, `logout`, `isAuthenticated` methods

### API Service (`src/services/api.js`)
- Axios instance with base URL configuration
- Request interceptor: Adds JWT token from localStorage
- Response interceptor: Handles 401 errors (auto-logout)

### Dashboard Pages
- **AdminDashboard**: Create organizations, view system stats
- **OrganizationDashboard**: Manage employees, view team performance
- **EmployeeDashboard**: Personal activity timeline, scores, trends

## API Integration

All API calls use the centralized axios instance from `services/api.js`:

```javascript
import api from '../services/api';

// GET request
const response = await api.get('/employee/me');

// POST request
const response = await api.post('/activity/ingest-batch', data);
```

Base URL configured via `VITE_API_URL` environment variable.

## UI Components

### Custom Components
- `AnimatedCard`, `GlassCard` - Card variations with effects
- `ProgressRing` - Circular progress indicator
- `StatusBadge` - Color-coded status chips
- `ParticleBackground` - Animated background effects
- `Cube3D`, `Card3D` - 3D transform elements

### Landing Page Sections
- Hero, Features, How It Works, Benefits
- Testimonials, Pricing, CTA, Footer

## Styling

### TailwindCSS Configuration
- Custom color palette for VISTA branding
- Dark mode support (via ThemeContext)
- Custom animations and transitions
- Responsive breakpoints

### Key Utilities
- `glass` effect: Backdrop blur + transparency
- Gradient backgrounds: Primary to secondary colors
- Shadow utilities: Elevated UI elements

## Scripts

```bash
npm run dev       # Start development server (port 5173)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

## Common Tasks

### Adding New Dashboard Page
1. Create page component in `src/pages/`
2. Add route in `App.jsx`
3. Wrap with `ProtectedRoute` if authentication required
4. Import role-specific API endpoints

### Creating New API Endpoint
1. Add method to `src/services/api.js`
2. Use axios instance with automatic JWT headers
3. Handle errors in component with try-catch

### Adding UI Component
1. Create in `src/components/ui/`
2. Use TailwindCSS for styling
3. Add Framer Motion for animations
4. Export from component file

## Troubleshooting

### 401 Unauthorized Errors
- Check JWT token in localStorage
- Verify token expiration (7-day default)
- Ensure backend is running
- Check user role matches route requirement

### API Connection Issues
- Verify `VITE_API_URL` in `.env`
- Confirm backend server is running on correct port
- Check CORS configuration in backend

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check for ESLint errors: `npm run lint`

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

When adding features:
1. Follow existing file structure conventions
2. Use functional components with hooks
3. Implement responsive design (mobile-first)
4. Add loading states and error handling
5. Test with all three user roles

## Related Documentation

- [Backend API Documentation](../backend/README.md)
- [Desktop App Documentation](../desktop-app/README.md)
- [Project Overview](../README.md)
