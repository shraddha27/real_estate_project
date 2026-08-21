import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import logger from '../../common/logger';
import { AppError } from '../../common/app-error';
import { createSequelizePropertyStore, PropertyStore } from './repository';
import { IProperty, PropertyType } from './property';
import {
  createPropertySchema,
  CreatePropertyDto,
  ParsedCreateProperty,
  ParsedUpdateProperty,
  propertyFiltersSchema,
  PropertyFilters,
  updatePropertySchema,
  UpdatePropertyDto,
} from './validation';
import { PaginatedResponse } from '../../models/common';

export const createInMemoryPropertyStore = (): PropertyStore => {
  const properties = new Map<string, IProperty>();
  const samples: CreatePropertyDto[] = [
    { title: 'Modern City Apartment', description: 'Spacious 2-bedroom apartment in downtown', location: 'Manhattan, NYC', price: 850000, type: PropertyType.RESIDENTIAL, bedrooms: 2, bathrooms: 2, squareFeet: 1200, amenities: ['gym', 'pool', 'doorman', 'parking'] },
    { title: 'Luxury Suburban Home', description: 'Beautiful 4-bedroom family home', location: 'Brooklyn, NYC', price: 1500000, type: PropertyType.RESIDENTIAL, bedrooms: 4, bathrooms: 3, squareFeet: 3500, amenities: ['garden', 'garage', 'pool'] },
    { title: 'Commercial Office Space', description: 'Prime office location in business district', location: 'Manhattan, NYC', price: 5000000, type: PropertyType.COMMERCIAL, squareFeet: 5000, amenities: ['elevator', 'parking', 'conference rooms'] },
  ];
  samples.forEach(dto => {
    const now = new Date();
    const property: IProperty = { id: uuidv4(), ...dto, amenities: dto.amenities ?? [], createdAt: now, updatedAt: now };
    properties.set(property.id, property);
  });
  return {
    async getAll(filters) {
      let result = [...properties.values()];
      if (filters.location) result = result.filter(property => property.location.toLowerCase().includes(filters.location!.toLowerCase()));
      if (filters.type) result = result.filter(property => property.type === filters.type);
      if (filters.minPrice !== undefined) result = result.filter(property => property.price >= filters.minPrice!);
      if (filters.maxPrice !== undefined) result = result.filter(property => property.price <= filters.maxPrice!);
      if (filters.minBedrooms !== undefined) result = result.filter(property => (property.bedrooms || 0) >= filters.minBedrooms!);
      if (filters.maxBedrooms !== undefined) result = result.filter(property => (property.bedrooms || 0) <= filters.maxBedrooms!);
      const limit = Math.min(filters.limit || 10, 100);
      const offset = Math.max(filters.offset || 0, 0);
      return { data: result.slice(offset, offset + limit), total: result.length, limit, offset };
    },
    async getById(id) { return properties.get(id); },
    async create(dto) {
      const now = new Date();
      const property: IProperty = { id: uuidv4(), ...dto, amenities: dto.amenities || [], createdAt: now, updatedAt: now };
      properties.set(property.id, property);
      return property;
    },
    async update(id, dto) {
      const property = properties.get(id);
      if (!property) return undefined;
      const updated = { ...property, ...dto, updatedAt: new Date() };
      properties.set(id, updated);
      return updated;
    },
    async delete(id) { return properties.delete(id); },
  };
};

export interface PropertyServiceApi {
  listProperties(filters: PropertyFilters): Promise<PaginatedResponse<IProperty>>;
  getPropertyById(id: string): Promise<IProperty>;
  createProperty(dto: CreatePropertyDto): Promise<IProperty>;
  updateProperty(id: string, dto: UpdatePropertyDto): Promise<IProperty>;
  deleteProperty(id: string): Promise<boolean>;
}

export { PropertyType } from './property';

const parseOrThrow = <T>(schema: { safeParse(input: unknown): { success: true; data: T } | { success: false; error: z.ZodError } }, input: unknown): T => {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw AppError(result.error.issues.map(issue => issue.message).join(', '), 400, 'VALIDATION_ERROR');
  }
  return result.data;
};

export const createPropertyService = (store: PropertyStore = createSequelizePropertyStore()): PropertyServiceApi => ({
  async listProperties(filters) {
    const parsedFilters = parseOrThrow(propertyFiltersSchema, filters);
    const result = await store.getAll(parsedFilters);
    logger.info('Properties listed', { total: result.total, filters });
    return result;
  },
  async getPropertyById(id) {
    const property = await store.getById(id);
    if (!property) throw AppError('Property not found', 404, 'NOT_FOUND');
    return property;
  },
  async createProperty(dto) {
    const parsed: ParsedCreateProperty = parseOrThrow(createPropertySchema, dto);
    return store.create(parsed);
  },
  async updateProperty(id, dto) {
    const parsed: ParsedUpdateProperty = parseOrThrow(updatePropertySchema, dto);
    const property = await store.update(id, parsed);
    if (!property) throw AppError('Property not found', 404, 'NOT_FOUND');
    return property;
  },
  async deleteProperty(id) {
    const deleted = await store.delete(id);
    if (!deleted) throw AppError('Property not found', 404, 'NOT_FOUND');
    return true;
  },
});

export interface PropertyService extends PropertyServiceApi {}

export const PropertyService: { new (store?: PropertyStore): PropertyService } = function PropertyService(store?: PropertyStore): PropertyService {
  return createPropertyService(store);
} as unknown as { new (store?: PropertyStore): PropertyService };

export default createPropertyService();
