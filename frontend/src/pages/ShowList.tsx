import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { showsApi } from '../api';
import { Show } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useShow } from '../context/ShowContext';
import './ShowList.css';

const ShowList: React.FC = () => {
  const { shows, setShows, setSelectedShow } = useShow();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch shows if they're not already in context
    if (shows.length === 0) {
      fetchShows();
    } else {
      // If shows are already loaded, just set loading to false
      setLoading(false);
    }
  }, [shows.length]);

  const fetchShows = async () => {
    try {
      setLoading(true);
      setError(null);
      const showsData = await showsApi.getShows();
      setShows(showsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shows');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShowSelect = (show: Show) => {
    setSelectedShow(show);
  };

  if (loading) {
    return <LoadingSpinner message="Loading shows..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchShows} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="show-list-container">
      <div className="show-list-header">
        <div className="header-content">
          <h1>Available Shows</h1>
          <p>Book your tickets for upcoming shows and events</p>
        </div>
        <button onClick={fetchShows} className="refresh-button" disabled={loading}>
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {shows.length === 0 ? (
        <div className="no-shows">
          <h3>No shows available</h3>
          <p>Check back later for new shows!</p>
        </div>
      ) : (
        <div className="shows-grid">
          {shows.map((show) => (
            <div key={show.id} className="show-card">
              <div className="show-card-header">
                <h3>{show.name}</h3>
                <span className="show-date">{formatDate(show.start_time)}</span>
              </div>
              
              <div className="show-card-body">
                <div className="seat-info">
                  <div className="seat-stat">
                    <span className="label">Total Seats:</span>
                    <span className="value">{show.total_seats}</span>
                  </div>
                  <div className="seat-stat">
                    <span className="label">Available:</span>
                    <span className="value available">{show.available_seats}</span>
                  </div>
                  <div className="seat-stat">
                    <span className="label">Booked:</span>
                    <span className="value booked">{show.booked_seats}</span>
                  </div>
                </div>

                <div className="availability-indicator">
                  {show.available_seats > 0 ? (
                    <span className="available-badge">Available</span>
                  ) : (
                    <span className="sold-out-badge">Sold Out</span>
                  )}
                </div>
              </div>

              <div className="show-card-footer">
                <Link 
                  to={`/booking/${show.id}`} 
                  className={`book-button ${show.available_seats === 0 ? 'disabled' : ''}`}
                  onClick={() => handleShowSelect(show)}
                >
                  {show.available_seats > 0 ? 'Book Now' : 'Sold Out'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowList;
