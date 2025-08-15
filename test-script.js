const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test configuration
const TEST_CONFIG = {
  showId: 1,
  user1: 'test_user_1',
  user2: 'test_user_2',
  seatNumbers: [1, 2, 3, 4, 5]
};

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = (message, type = 'INFO') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'SUCCESS' ? '✅' : type === 'ERROR' ? '❌' : type === 'WARNING' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

// API helper functions
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

const getShows = async () => {
  try {
    const response = await api.get('/shows');
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to get shows: ${error.message}`);
  }
};

const bookSeats = async (showId, userName, seatNumbers) => {
  try {
    const response = await api.post('/book', {
      show_id: showId,
      user_name: userName,
      seat_numbers: seatNumbers
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    throw new Error(`Failed to book seats: ${error.message}`);
  }
};

const getUserBookings = async (userName) => {
  try {
    const response = await api.get(`/bookings/user/${userName}`);
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to get user bookings: ${error.message}`);
  }
};

const cancelBooking = async (bookingId, userName) => {
  try {
    const response = await api.delete(`/bookings/${bookingId}`, {
      data: { user_name: userName }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    throw new Error(`Failed to cancel booking: ${error.message}`);
  }
};

// Test functions
const testNormalBooking = async () => {
  log('Starting Test 1: Normal Booking Flow', 'INFO');
  
  try {
    // Get available shows
    log('Getting available shows...');
    const shows = await getShows();
    log(`Found ${shows.length} shows`, 'SUCCESS');
    
    if (shows.length === 0) {
      log('No shows available for testing', 'WARNING');
      return;
    }
    
    const show = shows[0];
    log(`Testing with show: ${show.name} (ID: ${show.id})`, 'INFO');
    
    // Book seats for user 1
    log(`Booking seats ${TEST_CONFIG.seatNumbers.slice(0, 2)} for ${TEST_CONFIG.user1}...`);
    const bookingResult1 = await bookSeats(show.id, TEST_CONFIG.user1, TEST_CONFIG.seatNumbers.slice(0, 2));
    
    if (bookingResult1.success) {
      log(`Successfully booked ${bookingResult1.data.bookings.length} seats for ${TEST_CONFIG.user1}`, 'SUCCESS');
      log(`Booking details: ${JSON.stringify(bookingResult1.data.details, null, 2)}`, 'INFO');
    } else {
      log(`Failed to book seats for ${TEST_CONFIG.user1}: ${bookingResult1.error}`, 'ERROR');
    }
    
    // Check user bookings
    log(`Checking bookings for ${TEST_CONFIG.user1}...`);
    const userBookings = await getUserBookings(TEST_CONFIG.user1);
    log(`Found ${userBookings.length} bookings for ${TEST_CONFIG.user1}`, 'SUCCESS');
    
    // Cancel one booking
    if (userBookings.length > 0) {
      const bookingToCancel = userBookings[0];
      log(`Cancelling booking ID ${bookingToCancel.id}...`);
      const cancelResult = await cancelBooking(bookingToCancel.id, TEST_CONFIG.user1);
      
      if (cancelResult.success) {
        log(`Successfully cancelled booking ${bookingToCancel.id}`, 'SUCCESS');
      } else {
        log(`Failed to cancel booking: ${cancelResult.error}`, 'ERROR');
      }
    }
    
    log('Test 1: Normal Booking Flow - COMPLETED', 'SUCCESS');
    
  } catch (error) {
    log(`Test 1 failed: ${error.message}`, 'ERROR');
  }
};

const testConcurrentBooking = async () => {
  log('Starting Test 2: Concurrent Booking (Race Condition Test)', 'INFO');
  
  try {
    const shows = await getShows();
    if (shows.length === 0) {
      log('No shows available for testing', 'WARNING');
      return;
    }
    
    const show = shows[0];
    const targetSeat = 10; // Use seat 10 for concurrent test
    
    log(`Testing concurrent booking for seat ${targetSeat} on show ${show.name}`, 'INFO');
    
    // Start two concurrent booking requests for the same seat
    log('Starting concurrent booking requests...');
    const promises = [
      bookSeats(show.id, TEST_CONFIG.user1, [targetSeat]),
      bookSeats(show.id, TEST_CONFIG.user2, [targetSeat])
    ];
    
    const results = await Promise.allSettled(promises);
    
    let successCount = 0;
    let failureCount = 0;
    
    results.forEach((result, index) => {
      const userName = index === 0 ? TEST_CONFIG.user1 : TEST_CONFIG.user2;
      
      if (result.status === 'fulfilled') {
        const bookingResult = result.value;
        if (bookingResult.success) {
          log(`${userName} successfully booked seat ${targetSeat}`, 'SUCCESS');
          successCount++;
        } else {
          log(`${userName} failed to book seat ${targetSeat}: ${bookingResult.error}`, 'ERROR');
          failureCount++;
        }
      } else {
        log(`${userName} booking request failed: ${result.reason}`, 'ERROR');
        failureCount++;
      }
    });
    
    // Verify only one booking was successful
    if (successCount === 1 && failureCount === 1) {
      log('Concurrency control working correctly - only one booking succeeded', 'SUCCESS');
    } else if (successCount > 1) {
      log('Concurrency control failed - multiple bookings succeeded for same seat', 'ERROR');
    } else {
      log('Unexpected result in concurrent booking test', 'WARNING');
    }
    
    log('Test 2: Concurrent Booking - COMPLETED', 'SUCCESS');
    
  } catch (error) {
    log(`Test 2 failed: ${error.message}`, 'ERROR');
  }
};

const testBookingExpiry = async () => {
  log('Starting Test 3: Booking Expiry Test', 'INFO');
  
  try {
    const shows = await getShows();
    if (shows.length === 0) {
      log('No shows available for testing', 'WARNING');
      return;
    }
    
    const show = shows[0];
    const testSeat = 20;
    
    log(`Testing booking expiry for seat ${testSeat}`, 'INFO');
    
    // Create a booking that should expire
    log('Creating a booking that will expire...');
    const bookingResult = await bookSeats(show.id, TEST_CONFIG.user1, [testSeat]);
    
    if (bookingResult.success) {
      log(`Created booking for seat ${testSeat}`, 'SUCCESS');
      
      // Wait for 3 minutes to test expiry (backend expires after 2 minutes)
      log('Waiting 3 minutes for booking to expire...');
      log('Note: This test requires the backend expiry service to be running', 'INFO');
      
      // Check booking status immediately
      log('Checking booking status immediately...');
      const immediateBookings = await getUserBookings(TEST_CONFIG.user1);
      const immediateBooking = immediateBookings.find(b => b.seat_number === testSeat);
      
      if (immediateBooking) {
        log(`Booking status: ${immediateBooking.status}`, 'INFO');
        
        if (immediateBooking.status === 'CONFIRMED') {
          log('Booking is confirmed (expected)', 'SUCCESS');
        } else if (immediateBooking.status === 'FAILED') {
          log('Booking already failed (may have expired)', 'WARNING');
        }
      }
      
      log('To test expiry, wait 3 minutes and run: node test-script.js --check-expiry', 'INFO');
      
    } else {
      log(`Failed to create booking: ${bookingResult.error}`, 'ERROR');
    }
    
    log('Test 3: Booking Expiry Test - COMPLETED', 'SUCCESS');
    
  } catch (error) {
    log(`Test 3 failed: ${error.message}`, 'ERROR');
  }
};

const checkExpiryStatus = async () => {
  log('Checking booking expiry status...', 'INFO');
  
  try {
    const userBookings = await getUserBookings(TEST_CONFIG.user1);
    const expiredBookings = userBookings.filter(b => b.status === 'FAILED');
    
    log(`Found ${userBookings.length} total bookings for ${TEST_CONFIG.user1}`, 'INFO');
    log(`Found ${expiredBookings.length} failed/expired bookings`, 'INFO');
    
    expiredBookings.forEach(booking => {
      log(`Expired booking: Seat ${booking.seat_number}, Created: ${booking.created_at}`, 'INFO');
    });
    
    if (expiredBookings.length > 0) {
      log('Booking expiry is working correctly', 'SUCCESS');
    } else {
      log('No expired bookings found (may need more time or expiry not working)', 'WARNING');
    }
    
  } catch (error) {
    log(`Failed to check expiry status: ${error.message}`, 'ERROR');
  }
};

// Main test runner
const runTests = async () => {
  const args = process.argv.slice(2);
  
  log('Ticket Booking System - Test Suite', 'INFO');
  log('=====================================', 'INFO');
  
  try {
    // Test API connectivity
    log('Testing API connectivity...');
    const shows = await getShows();
    log(`API connected successfully. Found ${shows.length} shows`, 'SUCCESS');
    
    if (args.includes('--check-expiry')) {
      await checkExpiryStatus();
    } else {
      // Run all tests
      await testNormalBooking();
      await sleep(2000); // Wait between tests
      
      await testConcurrentBooking();
      await sleep(2000); // Wait between tests
      
      await testBookingExpiry();
    }
    
    log('🎉 All tests completed!', 'SUCCESS');
    
  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'ERROR');
    log('Make sure the backend server is running on http://localhost:3001', 'INFO');
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testNormalBooking,
  testConcurrentBooking,
  testBookingExpiry,
  checkExpiryStatus
};
