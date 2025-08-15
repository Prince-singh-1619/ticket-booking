import { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';

export class BookingController {
  /**
   * User API: Book seats for a show
   * POST /api/book
   */
  static async bookSeats(req: Request, res: Response) {
    try {
      const { show_id, user_name, seat_numbers } = req.body;

      // Validation
      if (!show_id || !user_name || !seat_numbers) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: show_id, user_name, seat_numbers'
        });
      }

      if (!Array.isArray(seat_numbers) || seat_numbers.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'seat_numbers must be a non-empty array'
        });
      }

      if (seat_numbers.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Cannot book more than 10 seats at once'
        });
      }

      // Book each seat individually with concurrency control
      const results = [];
      const successfulBookings = [];

      for (const seatNumber of seat_numbers) {
        const result = await BookingService.createBooking({
          show_id,
          user_name,
          seat_number: seatNumber
        });

        results.push({
          seat_number: seatNumber,
          success: result.success,
          error: result.error
        });

        if (result.success && result.booking) {
          successfulBookings.push(result.booking);
        }
      }

      const allSuccessful = results.every(r => r.success);
      const someSuccessful = results.some(r => r.success);

      if (allSuccessful) {
        return res.status(201).json({
          success: true,
          message: `Successfully booked ${successfulBookings.length} seat(s)`,
          data: {
            bookings: successfulBookings,
            details: results
          }
        });
      } else if (someSuccessful) {
        return res.status(207).json({ // 207 Multi-Status
          success: false,
          message: 'Partial booking completed',
          data: {
            bookings: successfulBookings,
            details: results
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Failed to book any seats',
          data: {
            details: results
          }
        });
      }

    } catch (error) {
      console.error('Error booking seats:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to book seats'
      });
    }
  }

  /**
   * Get user's bookings
   * GET /api/bookings/user/:userName
   */
  static async getUserBookings(req: Request, res: Response) {
    try {
      const { userName } = req.params;

      if (!userName) {
        return res.status(400).json({
          success: false,
          error: 'User name is required'
        });
      }

      const bookings = await BookingService.getUserBookings(userName);

      return res.json({
        success: true,
        data: bookings
      });

    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user bookings'
      });
    }
  }

  /**
   * Cancel a booking
   * DELETE /api/bookings/:bookingId
   */
  static async cancelBooking(req: Request, res: Response) {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const { user_name } = req.body;

      if (isNaN(bookingId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid booking ID'
        });
      }

      if (!user_name) {
        return res.status(400).json({
          success: false,
          error: 'User name is required'
        });
      }

      const result = await BookingService.cancelBooking(bookingId, user_name);

      if (result.success) {
        return res.json({
          success: true,
          message: 'Booking cancelled successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      console.error('Error cancelling booking:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel booking'
      });
    }
  }
}
