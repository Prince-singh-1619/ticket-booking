# Ticket Booking System - Backend

A Node.js + Express.js backend for a ticket booking system with PostgreSQL database and Sequelize ORM.

## Features

- Express.js server with TypeScript
- PostgreSQL database with Sequelize ORM
- **Concurrency Control**: PostgreSQL transactions & row-level locking
- **Booking System**: Multi-seat booking with race condition prevention
- **Booking Expiry**: Automatic expiry of pending bookings (2 minutes)
- **Background Jobs**: Cron jobs for booking maintenance
- JWT authentication ready
- CORS enabled
- Security middleware (Helmet)
- Request logging (Morgan)
- Environment variable configuration

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update the database credentials and other environment variables

3. **Database Setup:**
   - Create a PostgreSQL database named `ticket_booking_db`
   - Update the database credentials in `.env` file

4. **Development:**
   ```bash
   npm run dev
   ```

5. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
src/
├── config/       # Database and app configuration
├── models/       # Sequelize models
├── routes/       # Express routes
├── controllers/  # Request handlers
├── services/     # Business logic
├── middlewares/  # Custom middleware
└── server.ts     # Main server file
```

## API Endpoints

### Admin APIs
- `POST /api/shows` - Create a new show
- `GET /api/shows` - List all shows with booking info
- `GET /api/shows/:id` - Get specific show with details

### User APIs
- `POST /api/book` - Book seats for a show (with concurrency control)
- `GET /api/bookings/user/:userName` - Get user's bookings
- `DELETE /api/bookings/:bookingId` - Cancel a booking

### System APIs
- `GET /health` - Health check
- `GET /api` - API welcome message

**📖 Full API Documentation:** See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration time
- `CORS_ORIGIN` - CORS allowed origin
