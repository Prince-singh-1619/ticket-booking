import axios from 'axios';
import { 
  Show, 
  ShowDetail, 
  Booking, 
  ApiResponse, 
  BookingResponse,
  CreateShowRequest,
  BookSeatsRequest,
  CancelBookingRequest 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error);
    
    if (error.response) {
      // Server responded with error status
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received from server');
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Shows API
export const showsApi = {
  // Get all shows
  getShows: async (): Promise<Show[]> => {
    const response = await api.get<ApiResponse<Show[]>>('/shows');
    return response.data.data || [];
  },

  // Get specific show
  getShow: async (id: number): Promise<ShowDetail> => {
    const response = await api.get<ApiResponse<ShowDetail>>(`/shows/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Show not found');
    }
    return response.data.data;
  },

  // Create show (Admin)
  createShow: async (showData: CreateShowRequest): Promise<Show> => {
    const response = await api.post<ApiResponse<Show>>('/shows', showData);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Failed to create show');
    }
    return response.data.data;
  },
};

// Bookings API
export const bookingsApi = {
  // Book seats
  bookSeats: async (bookingData: BookSeatsRequest): Promise<BookingResponse> => {
    const response = await api.post<ApiResponse<BookingResponse>>('/book', bookingData);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Failed to book seats');
    }
    return response.data.data;
  },

  // Get user bookings
  getUserBookings: async (userName: string): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>(`/bookings/user/${userName}`);
    return response.data.data || [];
  },

  // Cancel booking
  cancelBooking: async (bookingId: number, userData: CancelBookingRequest): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/bookings/${bookingId}`, {
      data: userData
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to cancel booking');
    }
  },
};

// Health check
export const healthApi = {
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get('/health');
      return response.data.status === 'OK';
    } catch (error) {
      return false;
    }
  },
};

export default api;
