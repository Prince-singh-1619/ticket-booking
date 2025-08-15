import { Show } from '../models';

export const seedDatabase = async (): Promise<void> => {
  try {
    // Check if shows already exist
    const existingShows = await Show.count();
    
    if (existingShows === 0) {
      // Create sample shows
      const sampleShows = [
        {
          name: 'Avengers: Endgame',
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          total_seats: 100
        },
        {
          name: 'The Lion King',
          start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          total_seats: 80
        },
        {
          name: 'Spider-Man: No Way Home',
          start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          total_seats: 120
        },
        {
          name: 'Black Panther: Wakanda Forever',
          start_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
          total_seats: 90
        },
        {
          name: 'Top Gun: Maverick',
          start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          total_seats: 110
        }
      ];

      await Show.bulkCreate(sampleShows);
      console.log('Sample shows seeded successfully.');
    } else {
      console.log('Shows already exist, skipping seeding.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
