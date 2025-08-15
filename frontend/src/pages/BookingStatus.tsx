import React, { useState, useEffect, useRef } from 'react';
import { bookingsApi } from '../api';
import { Booking, BookingStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import './BookingStatus.css';

const BookingStatusPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBookings = async (name: string) => {
    if (!name.trim()) return;

    try {
      setSearchLoading(true);
      setError(null);
      const bookingsData = await bookingsApi.getUserBookings(name.trim());
      setBookings(bookingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings(userName);
    setAutoRefresh(true);
  };

  // Auto-refresh polling effect
  useEffect(() => {
    if (autoRefresh && userName.trim()) {
      // Start polling every 10 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchBookings(userName);
      }, 10000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else {
      // Stop polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [autoRefresh, userName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleCancelBooking = async (bookingId: number) => {
    if (!userName.trim()) {
      setError('Please enter your name first');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsApi.cancelBooking(bookingId, { user_name: userName.trim() });
      // Refresh bookings after cancellation
      fetchBookings(userName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return <span className="status-badge confirmed">Confirmed</span>;
      case BookingStatus.PENDING:
        return <span className="status-badge pending">Pending</span>;
      case BookingStatus.FAILED:
        return <span className="status-badge failed">Failed</span>;
      default:
        return <span className="status-badge unknown">Unknown</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDescription = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'Your booking has been confirmed and is ready for the show.';
      case BookingStatus.PENDING:
        return 'Your booking is being processed. Please wait for confirmation.';
      case BookingStatus.FAILED:
        return 'Your booking could not be completed. Please try booking again.';
      default:
        return 'Unknown booking status.';
    }
  };

  const filteredBookings = bookings.filter(booking => 
    booking.status !== BookingStatus.FAILED
  );

  const failedBookings = bookings.filter(booking => 
    booking.status === BookingStatus.FAILED
  );

  return (
    <div className="booking-status-container">
      <div className="booking-status-header">
        <h1>My Bookings</h1>
        <p>Check the status of your ticket bookings</p>
      </div>

             <div className="search-section">
         <form onSubmit={handleSearch} className="search-form">
           <div className="form-group">
             <label htmlFor="userName">Enter your name:</label>
             <div className="search-input-group">
               <input
                 type="text"
                 id="userName"
                 value={userName}
                 onChange={(e) => setUserName(e.target.value)}
                 placeholder="Enter your name to view bookings"
                 className="search-input"
                 required
               />
               <button 
                 type="submit" 
                 className="search-button"
                 disabled={searchLoading || !userName.trim()}
               >
                 {searchLoading ? 'Searching...' : 'Search'}
               </button>
             </div>
           </div>
           {autoRefresh && (
             <div className="auto-refresh-info">
               <span className="refresh-indicator">🔄 Auto-refreshing every 10 seconds</span>
               <button 
                 type="button" 
                 onClick={() => setAutoRefresh(false)}
                 className="stop-refresh-button"
               >
                 Stop Auto-refresh
               </button>
             </div>
           )}
         </form>
       </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {searchLoading && <LoadingSpinner message="Searching bookings..." />}

      {!searchLoading && bookings.length > 0 && (
        <div className="bookings-content">
          {filteredBookings.length > 0 && (
            <div className="bookings-section">
              <h2>Active Bookings</h2>
              <div className="bookings-grid">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <h3>{booking.show?.name || 'Unknown Show'}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="booking-details">
                      <div className="detail-row">
                        <span className="label">Show Date:</span>
                        <span className="value">
                          {booking.show?.start_time 
                            ? formatDate(booking.show.start_time)
                            : 'Unknown'
                          }
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Seat Number:</span>
                        <span className="value">{booking.seat_number}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Booked On:</span>
                        <span className="value">{formatDate(booking.created_at)}</span>
                      </div>
                    </div>

                    <div className="booking-description">
                      {getStatusDescription(booking.status)}
                    </div>

                    {booking.status === BookingStatus.CONFIRMED && (
                      <div className="booking-actions">
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="cancel-button"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {failedBookings.length > 0 && (
            <div className="bookings-section">
              <h2>Failed Bookings</h2>
              <div className="bookings-grid">
                {failedBookings.map((booking) => (
                  <div key={booking.id} className="booking-card failed">
                    <div className="booking-header">
                      <h3>{booking.show?.name || 'Unknown Show'}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="booking-details">
                      <div className="detail-row">
                        <span className="label">Show Date:</span>
                        <span className="value">
                          {booking.show?.start_time 
                            ? formatDate(booking.show.start_time)
                            : 'Unknown'
                          }
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Seat Number:</span>
                        <span className="value">{booking.seat_number}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Attempted On:</span>
                        <span className="value">{formatDate(booking.created_at)}</span>
                      </div>
                    </div>

                    <div className="booking-description">
                      {getStatusDescription(booking.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!searchLoading && !error && bookings.length === 0 && userName && (
        <div className="no-bookings">
          <h3>No bookings found</h3>
          <p>No bookings found for "{userName}". Please check the name or try booking a show.</p>
        </div>
      )}
    </div>
  );
};

export default BookingStatusPage;
