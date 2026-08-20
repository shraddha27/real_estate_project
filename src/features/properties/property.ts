import { CreateDto, Identifiable, Timestamped, UpdateDto } from '../../models/common';

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

export type CreatePropertyDto = CreateDto<IProperty, 'amenities'>;
export type UpdatePropertyDto = UpdateDto<CreatePropertyDto>;

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
