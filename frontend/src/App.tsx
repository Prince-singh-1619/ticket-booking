import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ShowList from './pages/ShowList';
import BookingPage from './pages/BookingPage';
import BookingStatus from './pages/BookingStatus';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ShowList />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/bookings" element={<BookingStatus />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
