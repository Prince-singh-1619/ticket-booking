import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';

export interface ShowAttributes {
  id?: number;
  name: string;
  start_time: Date;
  total_seats: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ShowCreationAttributes extends Omit<ShowAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Show extends Model<ShowAttributes, ShowCreationAttributes> implements ShowAttributes {
  public id!: number;
  public name!: string;
  public start_time!: Date;
  public total_seats!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model only when needed
let isInitialized = false;

export const initializeShow = () => {
  if (!isInitialized) {
    Show.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [1, 255]
          }
        },
        start_time: {
          type: DataTypes.DATE,
          allowNull: false,
          validate: {
            isDate: true,
            isFuture(value: Date) {
              if (value <= new Date()) {
                throw new Error('Start time must be in the future');
              }
            }
          }
        },
        total_seats: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
            max: 10000
          }
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
        modelName: 'Show',
        tableName: 'shows',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['start_time']
          },
          {
            fields: ['name']
          }
        ]
      }
    );
    isInitialized = true;
  }
  return Show;
};

export default Show;
