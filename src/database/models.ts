import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { PropertyType } from '../features/properties/property';

export interface PropertyRecordAttributes {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number | string;
  type: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number;
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

type PropertyRecordModel = Model<PropertyRecordAttributes, Omit<PropertyRecordAttributes, 'createdAt' | 'updatedAt'>> & PropertyRecordAttributes;
type UserRecordModel = Model<UserRecordAttributes, Omit<UserRecordAttributes, 'createdAt'>> & UserRecordAttributes;
export type PropertyRecord = PropertyRecordAttributes;
export type UserRecord = UserRecordAttributes;

export interface UserRecordAttributes {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

export let PropertyRecord: ModelStatic<PropertyRecordModel>;
export let UserRecord: ModelStatic<UserRecordModel>;

export const initializeModels = (sequelize: Sequelize): void => {
  PropertyRecord = sequelize.define<PropertyRecordModel>('PropertyRecord', {
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
  }, { tableName: 'properties', timestamps: true, underscored: true });

  UserRecord = sequelize.define<UserRecordModel>('UserRecord', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    username: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    passwordHash: { type: DataTypes.TEXT, allowNull: false, field: 'password_hash' },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
  }, { tableName: 'users', timestamps: true, updatedAt: false, underscored: true });
};
