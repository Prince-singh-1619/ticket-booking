import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the state interface
interface AppState {
  user: {
    isAuthenticated: boolean;
    role: 'user' | 'admin' | null;
    id: string | null;
  };
  shows: any[];
  bookings: any[];
  loading: boolean;
  error: string | null;
}

// Define action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: { isAuthenticated: boolean; role: 'user' | 'admin' | null; id: string | null } }
  | { type: 'SET_SHOWS'; payload: any[] }
  | { type: 'SET_BOOKINGS'; payload: any[] };

// Initial state
const initialState: AppState = {
  user: {
    isAuthenticated: false,
    role: null,
    id: null,
  },
  shows: [],
  bookings: [],
  loading: false,
  error: null,
};

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SHOWS':
      return { ...state, shows: action.payload };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
