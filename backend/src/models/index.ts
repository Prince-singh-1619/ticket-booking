import Show, { initializeShow } from './Show';
import Booking, { BookingStatus, initializeBooking, initializeAssociations } from './Booking';

// Export models
export { Show, Booking, BookingStatus, initializeShow, initializeBooking, initializeAssociations };

// Export types
export type { ShowAttributes, ShowCreationAttributes } from './Show';
export type { BookingAttributes, BookingCreationAttributes } from './Booking';

// Export all models as default
export default {
	Show,
	Booking
};

// Function to initialize all models
export const initializeModels = () => {
	initializeShow();
	initializeBooking();
	initializeAssociations();
};
