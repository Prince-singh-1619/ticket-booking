import * as cron from 'node-cron';
import { Booking, BookingStatus } from '../models';
import sequelize, { Op } from '../config/database';

export class BookingExpiryService {
  private static cronJob: cron.ScheduledTask | null = null;

  /**
   * Start the booking expiry cron job
   * Runs every minute to check for pending bookings older than 2 minutes
   */
  static startExpiryJob(): void {
    if (this.cronJob) {
      console.log('ℹ️  Booking expiry job is already running');
      return;
    }

    // Run every minute
    this.cronJob = cron.schedule('* * * * *', async () => {
      await this.expirePendingBookings();
    });

    this.cronJob.start();
    console.log('✅ Booking expiry job started (runs every minute)');
  }

  /**
   * Stop the booking expiry cron job
   */
  static stopExpiryJob(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('🛑 Booking expiry job stopped');
    }
  }

  /**
   * Expire pending bookings older than 2 minutes
   */
  private static async expirePendingBookings(): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      // Calculate the cutoff time (2 minutes ago)
      const cutoffTime = new Date(Date.now() - 2 * 60 * 1000);

      // Find pending bookings older than 2 minutes
      const pendingBookings = await Booking.findAll({
        where: {
          status: BookingStatus.PENDING,
          created_at: {
            [Op.lt]: cutoffTime
          }
        },
        transaction
      });

      if (pendingBookings.length === 0) {
        await transaction.commit();
        return;
      }

      // Update all pending bookings to FAILED status
      await Booking.update(
        { status: BookingStatus.FAILED },
        {
          where: {
            id: {
              [Op.in]: pendingBookings.map(b => b.id)
            }
          },
          transaction
        }
      );

      await transaction.commit();

      console.log(`⏰ Expired ${pendingBookings.length} pending booking(s) older than 2 minutes`);

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error expiring pending bookings:', error);
    }
  }

  /**
   * Manually expire pending bookings (for testing)
   */
  static async manuallyExpireBookings(): Promise<number> {
    const transaction = await sequelize.transaction();

    try {
      const cutoffTime = new Date(Date.now() - 2 * 60 * 1000);

      const [updatedCount] = await Booking.update(
        { status: BookingStatus.FAILED },
        {
          where: {
            status: BookingStatus.PENDING,
            created_at: {
              [Op.lt]: cutoffTime
            }
          },
          transaction
        }
      );

      await transaction.commit();
      return updatedCount;

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error manually expiring bookings:', error);
      throw error;
    }
  }
}
