# 🧪 Ticket Booking System - Testing Guide

This guide provides comprehensive testing instructions for the ticket booking system, covering both backend and frontend testing.

## 📋 Prerequisites

Before running tests, ensure:

1. **Backend Server**: Running on `http://localhost:3001`
2. **Frontend Server**: Running on `http://localhost:3000`
3. **Database**: PostgreSQL running with sample data
4. **Dependencies**: All packages installed

## 🚀 Quick Start Testing

### 1. Start the System

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm start
```

### 2. Run Automated Tests

```bash
# Backend API Tests
node test-script.js

# Frontend Integration Tests
node frontend/test-integration.js

# Check Booking Expiry (after 3 minutes)
node test-script.js --check-expiry
```

## 🧪 Manual Testing Scenarios

### Test 1: Normal Booking Flow

**Objective**: Verify basic booking functionality

**Steps**:
1. Open `http://localhost:3000` in browser
2. View available shows on the home page
3. Click "Book Now" on any available show
4. Select 2-3 seats on the seat map
5. Enter your name and click "Book Seats"
6. Verify booking confirmation
7. Go to "My Bookings" page and search for your name
8. Verify booking appears with "CONFIRMED" status

**Expected Results**:
- Shows display correctly with availability
- Seat selection works
- Booking confirmation shows success
- Booking appears in user bookings
- Status shows as "CONFIRMED"

### Test 2: Concurrent Booking (Race Condition)

**Objective**: Test concurrency control when two users book the same seat

**Steps**:
1. Open two browser windows/tabs
2. Navigate to the same show booking page in both
3. Select the same seat number in both windows
4. Click "Book Seats" simultaneously in both windows
5. Check the results

**Expected Results**:
- Only one booking succeeds
- Other booking fails with "Seat is already booked" error
- No overbooking occurs

**Automated Test**:
```bash
node test-script.js
# Look for "Test 2: Concurrent Booking" results
```

### Test 3: Booking Expiry

**Objective**: Test automatic expiry of pending bookings

**Steps**:
1. Create a booking (this creates a CONFIRMED booking)
2. Wait for 3 minutes (backend expires after 2 minutes)
3. Check booking status

**Expected Results**:
- Booking remains CONFIRMED (not PENDING)
- If any PENDING bookings exist, they become FAILED after 2 minutes

**Automated Test**:
```bash
# Run initial test
node test-script.js

# Wait 3 minutes, then check expiry
node test-script.js --check-expiry
```

### Test 4: Error Handling

**Objective**: Test system behavior with invalid inputs

**Steps**:
1. Try booking with empty user name
2. Try booking with invalid seat numbers
3. Try booking more than 10 seats at once
4. Try accessing non-existent show
5. Try cancelling booking with wrong user name

**Expected Results**:
- All invalid inputs show appropriate error messages
- System doesn't crash
- User-friendly error messages displayed

### Test 5: Real-time Status Updates

**Objective**: Test auto-refresh functionality

**Steps**:
1. Go to "My Bookings" page
2. Search for a user name
3. Verify auto-refresh indicator appears
4. Wait for automatic updates
5. Test "Stop Auto-refresh" button

**Expected Results**:
- ✅ Auto-refresh starts automatically after search
- ✅ Status updates every 10 seconds
- ✅ Stop button works correctly

## 🔧 API Testing

### Backend API Endpoints

Test each endpoint manually using curl or Postman:

```bash
# 1. Get all shows
curl http://localhost:3001/api/shows

# 2. Get specific show
curl http://localhost:3001/api/shows/1

# 3. Create a show (Admin)
curl -X POST http://localhost:3001/api/shows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Movie",
    "start_time": "2024-01-15T19:00:00.000Z",
    "total_seats": 50
  }'

# 4. Book seats
curl -X POST http://localhost:3001/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "show_id": 1,
    "user_name": "test_user",
    "seat_numbers": [1, 2, 3]
  }'

# 5. Get user bookings
curl http://localhost:3001/api/bookings/user/test_user

# 6. Cancel booking
curl -X DELETE http://localhost:3001/api/bookings/1 \
  -H "Content-Type: application/json" \
  -d '{"user_name": "test_user"}'

# 7. Health check
curl http://localhost:3001/health
```

### Frontend API Integration

Test frontend API calls:

```bash
# Run frontend integration tests
node frontend/test-integration.js
```

## Performance Testing

### Load Testing

Test system under load:

```bash
# Install Apache Bench (if available)
ab -n 100 -c 10 http://localhost:3001/api/shows

# Or use Node.js load testing
npm install -g loadtest
loadtest -n 100 -c 10 http://localhost:3001/api/shows
```

### Concurrency Testing

Test multiple simultaneous bookings:

```bash
# Run the automated concurrency test
node test-script.js
```

## 🐛 Debugging

### Backend Debugging

1. **Check logs**: Backend logs all API requests and errors
2. **Database queries**: Check PostgreSQL logs
3. **Environment variables**: Verify `.env` configuration

### Frontend Debugging

1. **Browser console**: Check for JavaScript errors
2. **Network tab**: Monitor API requests/responses
3. **React DevTools**: Inspect component state

### Common Issues

1. **CORS errors**: Ensure backend CORS configuration matches frontend URL
2. **Database connection**: Verify PostgreSQL is running and accessible
3. **Port conflicts**: Ensure ports 3000 and 3001 are available

## Test Results

### Success Criteria

All tests should pass with:

- **Normal Booking**: 100% success rate
- **Concurrency Control**: Only one booking succeeds per seat
- **Error Handling**: Appropriate error messages for all invalid inputs
- **Real-time Updates**: Status updates within 10 seconds
- **Booking Expiry**: PENDING bookings expire after 2 minutes

### Performance Benchmarks

- **API Response Time**: < 500ms for most endpoints
- **Concurrent Bookings**: Handle 10+ simultaneous requests
- **Database Queries**: < 100ms for simple queries
- **Frontend Load Time**: < 3 seconds initial load

## 🔄 Continuous Testing

### Automated Testing

Set up automated testing:

```bash
# Add to package.json scripts
{
  "scripts": {
    "test:backend": "node test-script.js",
    "test:frontend": "node frontend/test-integration.js",
    "test:all": "npm run test:backend && npm run test:frontend"
  }
}
```

### Pre-deployment Testing

Before deploying:

1. Run all automated tests
2. Perform manual testing scenarios
3. Test on different browsers
4. Verify mobile responsiveness
5. Check error handling
6. Validate concurrency control

## 📝 Test Documentation

### Test Cases Summary

| Test Case | Type | Status | Notes |
|-----------|------|--------|-------|
| Normal Booking | Manual/Auto | ✅ | Basic functionality |
| Concurrent Booking | Auto | ✅ | Race condition test |
| Booking Expiry | Auto | ✅ | Background job test |
| Error Handling | Manual/Auto | ✅ | Input validation |
| Real-time Updates | Manual | ✅ | Frontend polling |
| API Integration | Auto | ✅ | End-to-end testing |

### Bug Reports

When reporting bugs, include:

1. **Test case**: Which scenario failed
2. **Steps to reproduce**: Detailed steps
3. **Expected vs actual**: What should happen vs what happened
4. **Environment**: Browser, OS, backend version
5. **Logs**: Console errors, network requests
6. **Screenshots**: Visual evidence if applicable

## 🎯 Testing Checklist

Before considering the system ready:

- [ ] All manual test scenarios pass
- [ ] Automated tests pass consistently
- [ ] Concurrency control verified
- [ ] Error handling tested
- [ ] Real-time updates working
- [ ] Mobile responsiveness verified
- [ ] Performance benchmarks met
- [ ] Security considerations addressed
- [ ] Documentation complete
- [ ] Deployment tested

---

**🎉 Happy Testing!**

For questions or issues, refer to the main README files in the backend and frontend directories.
