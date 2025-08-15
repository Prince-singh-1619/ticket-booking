import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';
import Show from './Show';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED'
}

export interface BookingAttributes {
  id?: number;
  show_id: number;
  user_name: string;
  seat_number: number;
  status: BookingStatus;
  created_at?: Date;
  updated_at?: Date;
}

export interface BookingCreationAttributes extends Omit<BookingAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: number;
  public show_id!: number;
  public user_name!: string;
  public seat_number!: number;
  public status!: BookingStatus;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model only when needed
let isInitialized = false;

export const initializeBooking = () => {
  if (!isInitialized) {
    Booking.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        show_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'shows',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        user_name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [1, 255]
          }
        },
        seat_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1
          }
        },
        status: {
          type: DataTypes.ENUM(...Object.values(BookingStatus)),
          allowNull: false,
          defaultValue: BookingStatus.PENDING
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      },
      {
        sequelize,
        tableName: 'bookings',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['show_id']
          },
          {
            fields: ['user_name']
          },
          {
            fields: ['status']
          },
          {
            unique: true,
            fields: ['show_id', 'seat_number'],
            name: 'unique_show_seat'
          }
        ]
      }
    );
    isInitialized = true;
  }
  return Booking;
};

// Define associations
export const initializeAssociations = () => {
  const ShowModel = require('./Show').default;
  const initializedShow = ShowModel.initializeShow ? ShowModel.initializeShow() : ShowModel;
  const initializedBooking = initializeBooking();
  
  initializedBooking.belongsTo(initializedShow, {
    foreignKey: 'show_id',
    as: 'show'
  });

  initializedShow.hasMany(initializedBooking, {
    foreignKey: 'show_id',
    as: 'bookings'
  });
};

export default Booking;
