import { Router, Request, Response, NextFunction } from 'express';
import showRoutes from './shows';
import bookingRoutes from './bookings';
import { BookingController } from '../controllers/bookingController';

const router = Router();

// API routes
router.use('/shows', showRoutes);
router.use('/bookings', bookingRoutes);

// Legacy booking endpoint (for backward compatibility)
router.post('/book', (req: Request, res: Response) => {
  return BookingController.bookSeats(req, res);
});

export default router;
