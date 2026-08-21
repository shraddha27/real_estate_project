import { Identifiable, Timestamped } from '../../models/common';

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

// Kept as compatibility exports while validation-owned DTOs live in validation.ts.
export type { CreatePropertyDto, PropertyFilters, UpdatePropertyDto } from './validation';
