import { Request, Response } from 'express';
import { Show } from '../models';
import { BookingService } from '../services/bookingService';

export class ShowController {
  /**
   * Admin API: Create a new show
   * POST /api/shows
   */
  static async createShow(req: Request, res: Response) {
    try {
      const { name, start_time, total_seats } = req.body;

      // Validation
      if (!name || !start_time || !total_seats) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, start_time, total_seats'
        });
      }

      if (total_seats < 1 || total_seats > 10000) {
        return res.status(400).json({
          success: false,
          error: 'Total seats must be between 1 and 10000'
        });
      }

      const startTime = new Date(start_time);
      if (isNaN(startTime.getTime()) || startTime <= new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Start time must be a valid future date'
        });
      }

      const show = await Show.create({
        name,
        start_time: startTime,
        total_seats
      });

      return res.status(201).json({
        success: true,
        data: show
      });

    } catch (error) {
      console.error('Error creating show:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create show'
      });
    }
  }

  /**
   * User API: Get all available shows
   * GET /api/shows
   */
  static async getShows(req: Request, res: Response) {
    try {
      const shows = await BookingService.getShows();

      return res.json({
        success: true,
        data: shows
      });

    } catch (error) {
      console.error('Error fetching shows:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch shows'
      });
    }
  }

  /**
   * Get a specific show with booking details
   * GET /api/shows/:id
   */
  static async getShow(req: Request, res: Response) {
    try {
      const showId = parseInt(req.params.id);

      if (isNaN(showId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid show ID'
        });
      }

      const show = await BookingService.getShowBookings(showId);

      return res.json({
        success: true,
        data: show
      });

    } catch (error) {
      console.error('Error fetching show:', error);
      
      if (error instanceof Error && error.message === 'Show not found') {
        return res.status(404).json({
          success: false,
          error: 'Show not found'
        });
      }

              return res.status(500).json({
          success: false,
          error: 'Failed to fetch show'
        });
    }
  }
}
