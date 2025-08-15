import { Router } from 'express';
import { ShowController } from '../controllers/showController';

const router = Router();

// Admin API: Create a show
router.post('/', ShowController.createShow);

// User API: Get all shows
router.get('/', ShowController.getShows);

// Get specific show with booking details
router.get('/:id', ShowController.getShow);

export default router;
