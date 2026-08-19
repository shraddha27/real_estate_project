import { DataTypes, Model, Sequelize } from 'sequelize';
import { PropertyType } from '../models';

export class PropertyRecord extends Model {
  declare id: string;
  declare title: string;
  declare description: string;
  declare location: string;
  declare price: string;
  declare type: PropertyType;
  declare bedrooms: number | null;
  declare bathrooms: number | null;
  declare squareFeet: number;
  declare amenities: string[];
  declare createdAt: Date;
  declare updatedAt: Date;
}

export class UserRecord extends Model {
  declare id: string;
  declare username: string;
  declare passwordHash: string;
}

export const initializeModels = (sequelize: Sequelize): void => {
  PropertyRecord.init({
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    location: { type: DataTypes.STRING(200), allowNull: false },
    price: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    type: { type: DataTypes.STRING(30), allowNull: false },
    bedrooms: { type: DataTypes.INTEGER },
    bathrooms: { type: DataTypes.INTEGER },
    squareFeet: { type: DataTypes.INTEGER, allowNull: false, field: 'square_feet' },
    amenities: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
  }, { sequelize, tableName: 'properties', timestamps: true, underscored: true });

  UserRecord.init({
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    username: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    passwordHash: { type: DataTypes.TEXT, allowNull: false, field: 'password_hash' },
  }, { sequelize, tableName: 'users', timestamps: true, updatedAt: false, underscored: true });
};
