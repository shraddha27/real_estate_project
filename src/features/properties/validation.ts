import { z } from 'zod';
import { PropertyType } from './property';

const propertyInputShape = {
  title: z.string({ error: 'Property title is required' }).trim().min(1, 'Property title is required').max(200),
  description: z.string({ error: 'Property description is required' }).trim().min(1, 'Property description is required'),
  location: z.string({ error: 'Property location is required' }).trim().min(1, 'Property location is required').max(200),
  price: z.coerce.number({ error: 'Property price must be a positive number' }).positive({ error: 'Property price must be a positive number' }),
  type: z.nativeEnum(PropertyType),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().int().nonnegative().optional(),
  squareFeet: z.coerce.number({ error: 'Square feet must be a positive number' }).int().positive({ error: 'Square feet must be a positive number' }),
  amenities: z.array(z.string().trim().min(1)).optional().default([]),
};

export const createPropertySchema = z.object(propertyInputShape).strict();
export const updatePropertySchema = z.object(propertyInputShape).partial().strict().refine(
  value => Object.keys(value).length > 0,
  { message: 'At least one property field is required' },
);

export const propertyFiltersSchema = z.object({
  location: z.string().trim().optional(),
  type: z.nativeEnum(PropertyType).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minBedrooms: z.coerce.number().int().nonnegative().optional(),
  maxBedrooms: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
}).strict().refine(
  filters => filters.minPrice === undefined || filters.maxPrice === undefined || filters.minPrice <= filters.maxPrice,
  { message: 'minPrice must be less than or equal to maxPrice', path: ['minPrice'] },
).refine(
  filters => filters.minBedrooms === undefined || filters.maxBedrooms === undefined || filters.minBedrooms <= filters.maxBedrooms,
  { message: 'minBedrooms must be less than or equal to maxBedrooms', path: ['minBedrooms'] },
);

export type ParsedCreateProperty = z.output<typeof createPropertySchema>;
export type ParsedUpdateProperty = z.output<typeof updatePropertySchema>;
export type CreatePropertyDto = Omit<ParsedCreateProperty, 'amenities'> & { amenities?: string[] };
export type UpdatePropertyDto = Partial<CreatePropertyDto>;
export type PropertyFilters = z.output<typeof propertyFiltersSchema>;