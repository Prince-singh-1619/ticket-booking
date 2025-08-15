import { Transaction } from 'sequelize';
import { Show, Booking, BookingStatus } from '../models';
import sequelize from '../config/database';

export interface CreateBookingRequest {
  show_id: number;
  user_name: string;
  seat_number: number;
}

export interface BookingResult {
  success: boolean;
  booking?: Booking;
  error?: string;
}

export class BookingService {
  /**
   * Create a booking with concurrency control
   * Uses PostgreSQL transactions and row-level locking to prevent race conditions
   */
  static async createBooking(request: CreateBookingRequest): Promise<BookingResult> {
    const transaction = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    try {
      // Lock the show row to prevent concurrent modifications
      const show = await Show.findByPk(request.show_id, {
        lock: true,
        transaction
      });

      if (!show) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Show not found'
        };
      }

      // Check if seat is already booked
      const existingBooking = await Booking.findOne({
        where: {
          show_id: request.show_id,
          seat_number: request.seat_number
        },
        transaction
      });

      if (existingBooking) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Seat is already booked'
        };
      }

      // Check if seat number is valid
      if (request.seat_number > show.total_seats || request.seat_number < 1) {
        await transaction.rollback();
        return {
          success: false,
          error: `Invalid seat number. Must be between 1 and ${show.total_seats}`
        };
      }

      // Create the booking
      const booking = await Booking.create({
        show_id: request.show_id,
        user_name: request.user_name,
        seat_number: request.seat_number,
        status: BookingStatus.CONFIRMED
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        booking
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Booking creation error:', error);
      
      return {
        success: false,
        error: 'Failed to create booking. Please try again.'
      };
    }
  }

  /**
   * Get all shows with booking information
   */
  static async getShows() {
    try {
      const shows = await Show.findAll({
        include: [{
          model: Booking,
          as: 'bookings',
          attributes: ['id', 'seat_number', 'status']
        }],
        order: [['start_time', 'ASC']]
      });

      return shows.map(show => {
        const bookings = (show as any).bookings || [];
        const bookedSeats = bookings.filter((b: any) => b.status === BookingStatus.CONFIRMED).length || 0;
        const availableSeats = show.total_seats - bookedSeats;
        
        return {
          id: show.id,
          name: show.name,
          start_time: show.start_time,
          total_seats: show.total_seats,
          booked_seats: bookedSeats,
          available_seats: availableSeats,
          created_at: show.created_at
        };
      });
    } catch (error) {
      console.error('Error fetching shows:', error);
      throw new Error('Failed to fetch shows');
    }
  }

  /**
   * Get bookings for a specific show
   */
  static async getShowBookings(showId: number) {
    try {
      const show = await Show.findByPk(showId, {
        include: [{
          model: Booking,
          as: 'bookings',
          order: [['seat_number', 'ASC']]
        }]
      });

      if (!show) {
        throw new Error('Show not found');
      }

      return show;
    } catch (error) {
      console.error('Error fetching show bookings:', error);
      throw error;
    }
  }

  /**
   * Get user's bookings
   */
  static async getUserBookings(userName: string) {
    try {
      const bookings = await Booking.findAll({
        where: { user_name: userName },
        include: [{
          model: Show,
          as: 'show',
          attributes: ['name', 'start_time']
        }],
        order: [['created_at', 'DESC']]
      });

      return bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw new Error('Failed to fetch user bookings');
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: number, userName: string): Promise<BookingResult> {
    const transaction = await sequelize.transaction();

    try {
      const booking = await Booking.findOne({
        where: {
          id: bookingId,
          user_name: userName
        },
        transaction
      });

      if (!booking) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Booking not found or unauthorized'
        };
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Booking cannot be cancelled'
        };
      }

      await booking.destroy({ transaction });
      await transaction.commit();

      return {
        success: true
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Booking cancellation error:', error);
      
      return {
        success: false,
        error: 'Failed to cancel booking'
      };
    }
  }
}
