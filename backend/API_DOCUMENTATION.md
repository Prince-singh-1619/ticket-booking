# Ticket Booking System API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently, the API uses simple user identification via `user_name` parameter. In a production environment, this should be replaced with proper JWT authentication.

## API Endpoints

### Shows

#### 1. Create a Show (Admin)
**POST** `/shows`

Create a new show/trip.

**Request Body:**
```json
{
  "name": "Avengers: Endgame",
  "start_time": "2024-01-15T19:00:00.000Z",
  "total_seats": 100
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Avengers: Endgame",
    "start_time": "2024-01-15T19:00:00.000Z",
    "total_seats": 100,
    "created_at": "2024-01-10T10:00:00.000Z",
    "updated_at": "2024-01-10T10:00:00.000Z"
  }
}
```

#### 2. Get All Shows
**GET** `/shows`

Get all available shows with booking information.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Avengers: Endgame",
      "start_time": "2024-01-15T19:00:00.000Z",
      "total_seats": 100,
      "booked_seats": 25,
      "available_seats": 75,
      "created_at": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

#### 3. Get Specific Show
**GET** `/shows/:id`

Get a specific show with detailed booking information.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Avengers: Endgame",
    "start_time": "2024-01-15T19:00:00.000Z",
    "total_seats": 100,
    "created_at": "2024-01-10T10:00:00.000Z",
    "updated_at": "2024-01-10T10:00:00.000Z",
    "bookings": [
      {
        "id": 1,
        "seat_number": 1,
        "user_name": "john_doe",
        "status": "CONFIRMED",
        "created_at": "2024-01-10T11:00:00.000Z"
      }
    ]
  }
}
```

### Bookings

#### 4. Book Seats
**POST** `/book`

Book one or more seats for a specific show with concurrency control.

**Request Body:**
```json
{
  "show_id": 1,
  "user_name": "john_doe",
  "seat_numbers": [1, 2, 3]
}
```

**Response (201 Created) - All seats booked successfully:**
```json
{
  "success": true,
  "message": "Successfully booked 3 seat(s)",
  "data": {
    "bookings": [
      {
        "id": 1,
        "show_id": 1,
        "user_name": "john_doe",
        "seat_number": 1,
        "status": "CONFIRMED",
        "created_at": "2024-01-10T11:00:00.000Z"
      }
    ],
    "details": [
      {
        "seat_number": 1,
        "success": true
      },
      {
        "seat_number": 2,
        "success": true
      },
      {
        "seat_number": 3,
        "success": true
      }
    ]
  }
}
```

**Response (207 Multi-Status) - Partial booking:**
```json
{
  "success": false,
  "message": "Partial booking completed",
  "data": {
    "bookings": [
      {
        "id": 1,
        "show_id": 1,
        "user_name": "john_doe",
        "seat_number": 1,
        "status": "CONFIRMED",
        "created_at": "2024-01-10T11:00:00.000Z"
      }
    ],
    "details": [
      {
        "seat_number": 1,
        "success": true
      },
      {
        "seat_number": 2,
        "success": false,
        "error": "Seat is already booked"
      }
    ]
  }
}
```

#### 5. Get User Bookings
**GET** `/bookings/user/:userName`

Get all bookings for a specific user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "show_id": 1,
      "user_name": "john_doe",
      "seat_number": 1,
      "status": "CONFIRMED",
      "created_at": "2024-01-10T11:00:00.000Z",
      "show": {
        "name": "Avengers: Endgame",
        "start_time": "2024-01-15T19:00:00.000Z"
      }
    }
  ]
}
```

#### 6. Cancel Booking
**DELETE** `/bookings/:bookingId`

Cancel a specific booking.

**Request Body:**
```json
{
  "user_name": "john_doe"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: show_id, user_name, seat_numbers"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Show not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to book seats"
}
```

## Concurrency Control

The booking system implements robust concurrency control using:

1. **PostgreSQL Transactions**: All booking operations use database transactions
2. **Row-Level Locking**: Uses `SELECT ... FOR UPDATE` to lock show rows during booking
3. **Serializable Isolation**: Prevents race conditions and overbooking
4. **Unique Constraints**: Database-level constraint on `(show_id, seat_number)` prevents duplicate bookings

## Booking Status

- **PENDING**: Initial status when booking is created
- **CONFIRMED**: Booking is successfully confirmed
- **FAILED**: Booking failed (seat already taken, expired, etc.)

## Booking Expiry

The system includes an automatic booking expiry mechanism:

- **Cron Job**: Runs every minute to check for expired bookings
- **Expiry Time**: Pending bookings older than 2 minutes are automatically marked as FAILED
- **Background Processing**: Uses `node-cron` for scheduled tasks

## Database Schema

### Shows Table
```sql
CREATE TABLE shows (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  total_seats INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  seat_number INTEGER NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'FAILED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(show_id, seat_number)
);
```

## Testing the API

### 1. Create a Show
```bash
curl -X POST http://localhost:3001/api/shows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Movie",
    "start_time": "2024-01-15T19:00:00.000Z",
    "total_seats": 50
  }'
```

### 2. Book Seats
```bash
curl -X POST http://localhost:3001/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": 1,
    "user_name": "test_user",
    "seat_numbers": [1, 2, 3]
  }'
```

### 3. Get Shows
```bash
curl http://localhost:3001/api/shows
```

### 4. Get User Bookings
```bash
curl http://localhost:3001/api/bookings/user/test_user
```

## Environment Variables

Make sure to set up your `.env` file with the following variables:

```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticket_booking_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```
