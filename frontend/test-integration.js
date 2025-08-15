// Frontend Integration Test Script
// This script tests the frontend API integration

const API_BASE_URL = 'http://localhost:3001/api';

// Test configuration
const TEST_CONFIG = {
  user1: 'frontend_test_user_1',
  user2: 'frontend_test_user_2',
  testSeats: [30, 31, 32, 33, 34]
};

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = (message, type = 'INFO') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'SUCCESS' ? '✅' : type === 'ERROR' ? '❌' : type === 'WARNING' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

// API helper functions (simulating frontend API calls)
const api = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  },

  async post(endpoint, body) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  },

  async delete(endpoint, body) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  }
};

// Test functions
const testShowListAPI = async () => {
  log('Testing Show List API...', 'INFO');
  
  try {
    const response = await api.get('/shows');
    
    if (response.success && Array.isArray(response.data)) {
      log(`✅ Show list API working. Found ${response.data.length} shows`, 'SUCCESS');
      
      response.data.forEach(show => {
        log(`Show: ${show.name} - Available: ${show.available_seats}/${show.total_seats}`, 'INFO');
      });
      
      return response.data[0]; // Return first show for further tests
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    log(`❌ Show list API failed: ${error.message}`, 'ERROR');
    throw error;
  }
};

const testBookingAPI = async (showId) => {
  log('Testing Booking API...', 'INFO');
  
  try {
    // Test booking seats
    const bookingData = {
      show_id: showId,
      user_name: TEST_CONFIG.user1,
      seat_numbers: TEST_CONFIG.testSeats.slice(0, 2)
    };
    
    log(`Booking seats ${bookingData.seat_numbers} for ${bookingData.user_name}...`, 'INFO');
    const bookingResponse = await api.post('/book', bookingData);
    
    if (bookingResponse.success) {
      log(`✅ Booking successful. Booked ${bookingResponse.data.bookings.length} seats`, 'SUCCESS');
      log(`Booking details: ${JSON.stringify(bookingResponse.data.details, null, 2)}`, 'INFO');
      return bookingResponse.data.bookings;
    } else {
      log(`❌ Booking failed: ${bookingResponse.error}`, 'ERROR');
      return [];
    }
  } catch (error) {
    log(`❌ Booking API failed: ${error.message}`, 'ERROR');
    return [];
  }
};

const testUserBookingsAPI = async (userName) => {
  log(`Testing User Bookings API for ${userName}...`, 'INFO');
  
  try {
    const response = await api.get(`/bookings/user/${userName}`);
    
    if (response.success && Array.isArray(response.data)) {
      log(`✅ User bookings API working. Found ${response.data.length} bookings`, 'SUCCESS');
      
      response.data.forEach(booking => {
        log(`Booking: Seat ${booking.seat_number} - Status: ${booking.status}`, 'INFO');
      });
      
      return response.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    log(`❌ User bookings API failed: ${error.message}`, 'ERROR');
    return [];
  }
};

const testCancelBookingAPI = async (bookingId, userName) => {
  log(`Testing Cancel Booking API for booking ${bookingId}...`, 'INFO');
  
  try {
    const response = await api.delete(`/bookings/${bookingId}`, {
      user_name: userName
    });
    
    if (response.success) {
      log(`✅ Cancel booking API working. Booking ${bookingId} cancelled`, 'SUCCESS');
      return true;
    } else {
      log(`❌ Cancel booking failed: ${response.error}`, 'ERROR');
      return false;
    }
  } catch (error) {
    log(`❌ Cancel booking API failed: ${error.message}`, 'ERROR');
    return false;
  }
};

const testConcurrentBookingSimulation = async (showId) => {
  log('Testing Concurrent Booking Simulation...', 'INFO');
  
  try {
    const targetSeat = 40;
    
    log(`Simulating concurrent booking for seat ${targetSeat}...`, 'INFO');
    
    // Simulate two users trying to book the same seat simultaneously
    const promises = [
      api.post('/book', {
        show_id: showId,
        user_name: TEST_CONFIG.user1,
        seat_numbers: [targetSeat]
      }),
      api.post('/book', {
        show_id: showId,
        user_name: TEST_CONFIG.user2,
        seat_numbers: [targetSeat]
      })
    ];
    
    const results = await Promise.allSettled(promises);
    
    let successCount = 0;
    let failureCount = 0;
    
    results.forEach((result, index) => {
      const userName = index === 0 ? TEST_CONFIG.user1 : TEST_CONFIG.user2;
      
      if (result.status === 'fulfilled') {
        const bookingResult = result.value;
        if (bookingResult.success) {
          log(`✅ ${userName} successfully booked seat ${targetSeat}`, 'SUCCESS');
          successCount++;
        } else {
          log(`❌ ${userName} failed to book seat ${targetSeat}: ${bookingResult.error}`, 'ERROR');
          failureCount++;
        }
      } else {
        log(`❌ ${userName} booking request failed: ${result.reason}`, 'ERROR');
        failureCount++;
      }
    });
    
    // Verify concurrency control
    if (successCount === 1 && failureCount === 1) {
      log('✅ Concurrency control working correctly', 'SUCCESS');
    } else if (successCount > 1) {
      log('❌ Concurrency control failed - multiple bookings succeeded', 'ERROR');
    } else {
      log('⚠️ Unexpected result in concurrent booking test', 'WARNING');
    }
    
  } catch (error) {
    log(`❌ Concurrent booking test failed: ${error.message}`, 'ERROR');
  }
};

const testErrorHandling = async () => {
  log('Testing Error Handling...', 'INFO');
  
  try {
    // Test invalid show ID
    log('Testing invalid show ID...', 'INFO');
    try {
      await api.get('/shows/99999');
    } catch (error) {
      log(`✅ Correctly handled invalid show ID: ${error.message}`, 'SUCCESS');
    }
    
    // Test invalid booking data
    log('Testing invalid booking data...', 'INFO');
    try {
      await api.post('/book', {
        show_id: 1,
        user_name: '',
        seat_numbers: []
      });
    } catch (error) {
      log(`✅ Correctly handled invalid booking data: ${error.message}`, 'SUCCESS');
    }
    
    // Test invalid user bookings
    log('Testing invalid user bookings...', 'INFO');
    try {
      await api.get('/bookings/user/');
    } catch (error) {
      log(`✅ Correctly handled invalid user bookings: ${error.message}`, 'SUCCESS');
    }
    
  } catch (error) {
    log(`❌ Error handling test failed: ${error.message}`, 'ERROR');
  }
};

// Main test runner
const runFrontendTests = async () => {
  log('🎬 Frontend Integration Test Suite', 'INFO');
  log('==================================', 'INFO');
  
  try {
    // Test 1: Show List API
    const firstShow = await testShowListAPI();
    if (!firstShow) {
      throw new Error('No shows available for testing');
    }
    
    await sleep(1000);
    
    // Test 2: Booking API
    const bookings = await testBookingAPI(firstShow.id);
    
    await sleep(1000);
    
    // Test 3: User Bookings API
    const userBookings = await testUserBookingsAPI(TEST_CONFIG.user1);
    
    await sleep(1000);
    
    // Test 4: Cancel Booking API (if we have bookings)
    if (userBookings.length > 0) {
      await testCancelBookingAPI(userBookings[0].id, TEST_CONFIG.user1);
    }
    
    await sleep(1000);
    
    // Test 5: Concurrent Booking Simulation
    await testConcurrentBookingSimulation(firstShow.id);
    
    await sleep(1000);
    
    // Test 6: Error Handling
    await testErrorHandling();
    
    log('🎉 Frontend integration tests completed successfully!', 'SUCCESS');
    
  } catch (error) {
    log(`❌ Frontend integration tests failed: ${error.message}`, 'ERROR');
    log('Make sure the backend server is running on http://localhost:3001', 'INFO');
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runFrontendTests();
} else {
  // Browser environment
  console.log('This test script is designed to run in Node.js environment');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testShowListAPI,
    testBookingAPI,
    testUserBookingsAPI,
    testCancelBookingAPI,
    testConcurrentBookingSimulation,
    testErrorHandling,
    runFrontendTests
  };
}
