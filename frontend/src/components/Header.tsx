import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          🎬 Ticket Booking
        </Link>
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Shows
          </Link>
          <Link 
            to="/bookings" 
            className={`nav-link ${location.pathname === '/bookings' ? 'active' : ''}`}
          >
            My Bookings
          </Link>
          <Link 
            to="/admin" 
            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            {isAdmin ? 'Admin Dashboard' : 'Admin'}
          </Link>
        </nav>
        <div className="user-status">
          <span className={`status-badge ${isAdmin ? 'admin' : 'user'}`}>
            {isAdmin ? '👑 Admin' : '👤 User'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
