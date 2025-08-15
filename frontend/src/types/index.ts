// Show types
export interface Show {
  id: number;
  name: string;
  start_time: string;
  total_seats: number;
  booked_seats: number;
  available_seats: number;
  created_at: string;
}

export interface ShowDetail extends Omit<Show, 'booked_seats' | 'available_seats'> {
  bookings: Booking[];
}

// Booking types
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED'
}

export interface Booking {
  id: number;
  show_id: number;
  user_name: string;
  seat_number: number;
  status: BookingStatus;
  created_at: string;
  show?: {
    name: string;
    start_time: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface BookingResponse {
  bookings: Booking[];
  details: BookingDetail[];
}

export interface BookingDetail {
  seat_number: number;
  success: boolean;
  error?: string;
}

// Form types
export interface CreateShowRequest {
  name: string;
  start_time: string;
  total_seats: number;
}

export interface BookSeatsRequest {
  show_id: number;
  user_name: string;
  seat_numbers: number[];
}

export interface CancelBookingRequest {
  user_name: string;
}
