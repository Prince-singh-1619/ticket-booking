import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';

const router = Router();

// User API: Book seats for a show
router.post('/book', BookingController.bookSeats);

// Get user's bookings
router.get('/user/:userName', BookingController.getUserBookings);

// Cancel a booking
router.delete('/:bookingId', BookingController.cancelBooking);

export default router;
