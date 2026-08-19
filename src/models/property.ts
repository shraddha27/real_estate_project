/**
 * Property Model and Interfaces
 * Defines the structure of property data
 */

export enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  LAND = 'land',
}

export interface PropertyAmenity {
  name: string;
  available: boolean;
}

/**
 * Core Property Interface
 * Represents a real estate property
 */
import { CreateDto, Identifiable, Timestamped, UpdateDto } from './common';

export interface IProperty extends Identifiable, Timestamped {
  title: string;
  description: string;
  location: string;
  price: number;
  type: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet: number;
  amenities: string[];
}

/**
 * Property Create Request DTO
 */
export type CreatePropertyDto = CreateDto<IProperty, 'amenities'>;

/**
 * Property Update Request DTO
 */
export type UpdatePropertyDto = UpdateDto<CreatePropertyDto>;

/**
 * Property Filter Query Parameters
 */
export interface PropertyFilters {
  location?: string;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated Response
 */
