import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showsApi, bookingsApi } from '../api';
import { ShowDetail, BookingStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useShow } from '../context/ShowContext';
import './BookingPage.css';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBookingStatus, setSelectedShow } = useShow();
  
  const [show, setShow] = useState<ShowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [userName, setUserName] = useState('');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [currentBookingStatus, setCurrentBookingStatus] = useState<'idle' | 'PENDING' | 'CONFIRMED' | 'FAILED'>('idle');

  useEffect(() => {
    if (id) {
      fetchShow(parseInt(id));
    }
    
    // Cleanup function to reset selected seats when navigating away
    return () => {
      setSelectedSeats([]);
      setUserName('');
      setError(null);
      setBookingResult(null);
    };
  }, [id]);

  const fetchShow = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      setBookingStatus('loading');
      const showData = await showsApi.getShow(id);
      setShow(showData);
      setSelectedShow(showData);
      setBookingStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch show details');
      setBookingStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatNumber: number) => {
    if (isSeatBooked(seatNumber)) return;

    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(seat => seat !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const isSeatBooked = (seatNumber: number) => {
    return show?.bookings.some(booking => 
      booking.seat_number === seatNumber && 
      booking.status === BookingStatus.CONFIRMED
    ) || false;
  };

  const isSeatSelected = (seatNumber: number) => {
    return selectedSeats.includes(seatNumber);
  };

  const handleBooking = async () => {
    if (!show || !userName.trim() || selectedSeats.length === 0) {
      setError('Please fill in your name and select at least one seat');
      return;
    }

    try {
      setBookingLoading(true);
      setError(null);
      setBookingStatus('loading');
      setCurrentBookingStatus('PENDING');
      
      const result = await bookingsApi.bookSeats({
        show_id: show.id,
        user_name: userName.trim(),
        seat_numbers: selectedSeats
      });

      setBookingResult(result);
      setCurrentBookingStatus('CONFIRMED');
      setBookingStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book seats');
      setCurrentBookingStatus('FAILED');
      setBookingStatus('error');
    } finally {
      setBookingLoading(false);
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

  if (loading) {
    return <LoadingSpinner message="Loading show details..." />;
  }

  if (error && !show) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Shows
        </button>
      </div>
    );
  }

  if (!show) {
    return <div>Show not found</div>;
  }

  if (bookingResult) {
    return (
      <div className="booking-result-container">
        <div className="booking-result-card">
          <h2>Booking Complete!</h2>
          <div className="booking-summary">
            <p><strong>Show:</strong> {show.name}</p>
            <p><strong>Date:</strong> {formatDate(show.start_time)}</p>
            <p><strong>User:</strong> {userName}</p>
            <p><strong>Seats Booked:</strong> {bookingResult.bookings.length}</p>
          </div>
          
          <div className="seat-details">
            <h3>Seat Details:</h3>
            {bookingResult.details.map((detail: any, index: number) => (
              <div key={index} className={`seat-detail ${detail.success ? 'success' : 'failed'}`}>
                <span>Seat {detail.seat_number}</span>
                <span>{detail.success ? 'Confirmed' : `${detail.error}`}</span>
              </div>
            ))}
          </div>

          <div className="booking-actions">
            <button onClick={() => navigate('/')} className="primary-button">
              Book More Shows
            </button>
            <button onClick={() => navigate('/bookings')} className="secondary-button">
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page-container">
      <div className="booking-header">
        <h1>Book Tickets</h1>
        <div className="show-info">
          <h2>{show.name}</h2>
          <p>{formatDate(show.start_time)}</p>
        </div>
      </div>

      <div className="booking-content">
        <div className="seat-selection-section">
          <h3>Select Your Seats</h3>
          <p>Click on available seats to select them</p>
          
          <div className="seat-map">
            <div className="screen">SCREEN</div>
            <div className="seats-grid">
              {Array.from({ length: show.total_seats }, (_, index) => {
                const seatNumber = index + 1;
                const isBooked = isSeatBooked(seatNumber);
                const isSelected = isSeatSelected(seatNumber);
                
                return (
                  <button
                    key={seatNumber}
                    className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSeatClick(seatNumber)}
                    disabled={isBooked}
                    title={isBooked ? 'Already booked' : `Seat ${seatNumber}`}
                  >
                    {seatNumber}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="seat-legend">
            <div className="legend-item">
              <div className="legend-seat available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-seat selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="legend-seat booked"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>

        <div className="booking-form-section">
          <div className="booking-form">
            <h3>Booking Details</h3>
            
            <div className="form-group">
              <label htmlFor="userName">Your Name:</label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="form-input"
              />
            </div>

            <div className="selected-seats-summary">
              <h4>Selected Seats: {selectedSeats.length}</h4>
              {selectedSeats.length > 0 && (
                <div className="selected-seats-list">
                  {selectedSeats.map(seat => (
                    <span key={seat} className="selected-seat-tag">
                      Seat {seat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}
            
            {currentBookingStatus !== 'idle' && (
              <div className={`booking-status ${currentBookingStatus.toLowerCase()}`}>
                <span className="status-text">
                  {currentBookingStatus === 'PENDING' && 'Processing...'}
                  {currentBookingStatus === 'CONFIRMED' && 'Booking Confirmed!'}
                  {currentBookingStatus === 'FAILED' && 'Booking Failed'}
                </span>
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={bookingLoading || selectedSeats.length === 0 || !userName.trim()}
              className="book-button"
            >
              {bookingLoading ? 'Booking...' : `Book ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
