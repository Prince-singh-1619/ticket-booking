import { Router } from 'express';
import showRoutes from './shows';
import bookingRoutes from './bookings';

const router = Router();

// API routes
router.use('/shows', showRoutes);
router.use('/bookings', bookingRoutes);

// Legacy booking endpoint (for backward compatibility)
router.post('/book', bookingRoutes);

export default router;
