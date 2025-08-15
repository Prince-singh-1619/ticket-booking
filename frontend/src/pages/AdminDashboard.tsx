import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShow } from '../context/ShowContext';
import { showsApi } from '../api';
import { CreateShowRequest } from '../types';
import './AdminDashboard.css';

interface FormErrors {
  name?: string;
  start_time?: string;
  total_seats?: string;
}

const AdminDashboard: React.FC = () => {
  const { isAdmin, setIsAdmin } = useAuth();
  const { shows, setShows, addShow, setBookingStatus } = useShow();
  
  const [formData, setFormData] = useState<CreateShowRequest>({
    name: '',
    start_time: '',
    total_seats: 0
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (shows.length === 0) {
      fetchShows();
    }
  }, [shows.length]);

  const fetchShows = async () => {
    try {
      setIsLoading(true);
      setBookingStatus('loading');
      const showsData = await showsApi.getShows();
      // Update the shows in context
      setShows(showsData);
      setBookingStatus('idle');
    } catch (error) {
      console.error('Failed to fetch shows:', error);
      setBookingStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Show name is required';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (formData.total_seats <= 0) {
      newErrors.total_seats = 'Total seats must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_seats' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);
      
      const newShow = await showsApi.createShow(formData);
      
      // Add new show to the list
      addShow(newShow);
      
      // Reset form
      setFormData({
        name: '',
        start_time: '',
        total_seats: 0
      });
      
      setSubmitSuccess('Show created successfully!');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create show');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAdminStatus = () => {
    setIsAdmin(!isAdmin);
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

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-content">
        <div className="admin-toggle">
          <p>Current Status: <strong>{isAdmin ? 'Admin Mode' : 'User Mode'}</strong></p>
          <button 
            onClick={toggleAdminStatus}
            className="toggle-button"
          >
            {isAdmin ? 'Switch to User Mode' : 'Switch to Admin Mode'}
          </button>
        </div>

        {/* Create Show Form */}
        <div className="create-show-section">
          <h2>Create New Show</h2>
          <form onSubmit={handleSubmit} className="create-show-form">
            <div className="form-group">
              <label htmlFor="name">Show Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter show name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="start_time">Start Time:</label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className={`form-input ${errors.start_time ? 'error' : ''}`}
              />
              {errors.start_time && <span className="error-message">{errors.start_time}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="total_seats">Total Seats:</label>
              <input
                type="number"
                id="total_seats"
                name="total_seats"
                value={formData.total_seats}
                onChange={handleInputChange}
                min="1"
                className={`form-input ${errors.total_seats ? 'error' : ''}`}
                placeholder="Enter total seats"
              />
              {errors.total_seats && <span className="error-message">{errors.total_seats}</span>}
            </div>

            {submitError && <div className="error-message global-error">{submitError}</div>}
            {submitSuccess && <div className="success-message">{submitSuccess}</div>}

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Show'}
            </button>
          </form>
        </div>

        {/* Shows List Table */}
        <div className="shows-list-section">
          <div className="section-header">
            <h2>Shows List</h2>
            <button onClick={fetchShows} className="refresh-button" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {isLoading ? (
            <div className="loading-message">Loading shows...</div>
          ) : shows.length === 0 ? (
            <div className="no-shows">No shows available</div>
          ) : (
            <div className="table-container">
              <table className="shows-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Start Time</th>
                    <th>Total Seats</th>
                  </tr>
                </thead>
                <tbody>
                  {shows.map((show) => (
                    <tr key={show.id}>
                      <td>{show.name}</td>
                      <td>{formatDate(show.start_time)}</td>
                      <td>{show.total_seats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Shows</h3>
            <p>{shows.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>Revenue</h3>
            <p>$0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
