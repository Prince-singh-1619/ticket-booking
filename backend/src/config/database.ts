import { Sequelize, Op } from 'sequelize';
import dotenv from 'dotenv';
import { initializeModels } from '../models';
import { seedDatabase } from './seeder';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ticket_booking',
  username: process.env.DB_USER || 'ticket_user',
  password: process.env.DB_PASSWORD || 'HereIsMyPass',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  }
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Initialize models after connection is established
    initializeModels();
    console.log('Models initialized successfully.');
    
    // Sync database (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synchronized.');
      
      // Seed sample data
      await seedDatabase();
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export { Op };
export default sequelize;
