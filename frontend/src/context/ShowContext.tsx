import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Show, ShowDetail } from '../types';

interface ShowContextType {
  shows: Show[];
  setShows: (shows: Show[]) => void;
  selectedShow: Show | ShowDetail | null;
  setSelectedShow: (show: Show | ShowDetail | null) => void;
  bookingStatus: 'idle' | 'loading' | 'success' | 'error';
  setBookingStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void;
  updateShow: (showId: number, updatedShow: Partial<Show>) => void;
  addShow: (show: Show) => void;
  removeShow: (showId: number) => void;
}

const ShowContext = createContext<ShowContextType | undefined>(undefined);

interface ShowProviderProps {
  children: ReactNode;
}

export const ShowProvider: React.FC<ShowProviderProps> = ({ children }) => {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | ShowDetail | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const updateShow = (showId: number, updatedShow: Partial<Show>) => {
    setShows(prevShows => 
      prevShows.map(show => 
        show.id === showId ? { ...show, ...updatedShow } : show
      )
    );
  };

  const addShow = (show: Show) => {
    setShows(prevShows => [...prevShows, show]);
  };

  const removeShow = (showId: number) => {
    setShows(prevShows => prevShows.filter(show => show.id !== showId));
  };

  const value: ShowContextType = {
    shows,
    setShows,
    selectedShow,
    setSelectedShow,
    bookingStatus,
    setBookingStatus,
    updateShow,
    addShow,
    removeShow,
  };

  return (
    <ShowContext.Provider value={value}>
      {children}
    </ShowContext.Provider>
  );
};

export const useShow = (): ShowContextType => {
  const context = useContext(ShowContext);
  if (context === undefined) {
    throw new Error('useShow must be used within a ShowProvider');
  }
  return context;
};
