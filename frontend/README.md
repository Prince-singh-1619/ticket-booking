# Ticket Booking System - Frontend

A React.js + TypeScript application for managing ticket bookings for shows and events.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   └── LoadingSpinner.tsx
├── pages/              # Page components
│   ├── ShowList.tsx    # User shows listing
│   ├── BookingPage.tsx # Individual booking page
│   └── AdminDashboard.tsx # Admin dashboard
├── context/            # React Context for state management
│   └── AppContext.tsx  # Main application context
├── hooks/              # Custom React hooks
│   └── useLocalStorage.ts
├── api/                # API service functions
│   └── index.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main application component with routing
└── index.tsx           # Application entry point
```

## Routes

- `/` - User shows listing (ShowList component)
- `/booking/:id` - Individual booking page for a specific show
- `/admin` - Admin dashboard (AdminDashboard component)

## Dependencies

- React 19.1.1
- TypeScript 4.9.5
- React Router DOM 7.8.0
- Axios 1.11.0

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Features

- **Functional Components**: All components use React hooks and functional syntax
- **TypeScript**: Full type safety throughout the application
- **Routing**: Client-side routing with react-router-dom
- **State Management**: React Context for global state
- **Custom Hooks**: Reusable logic with custom hooks
- **API Integration**: Axios for HTTP requests
- **Responsive Design**: Modern, mobile-friendly UI

## Development

The project uses:
- Functional components with hooks
- TypeScript for type safety
- CSS modules for styling
- React Router for navigation
- Context API for state management
