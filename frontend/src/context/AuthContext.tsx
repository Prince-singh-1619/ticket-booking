import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const value: AuthContextType = {
    isAdmin,
    setIsAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
