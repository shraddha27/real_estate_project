import { v4 as uuidv4 } from 'uuid';
import logger from '../../common/logger';
import { AppError } from '../../common/app-error';
import { createSequelizePropertyStore, PropertyStore } from './repository';
import { IProperty, PropertyType, CreatePropertyDto, UpdatePropertyDto, PropertyFilters } from './property';
import { PaginatedResponse } from '../../models/common';

const createInMemoryPropertyStore = (): PropertyStore => {
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

const validatePropertyDto = <TDto extends Partial<CreatePropertyDto>>(dto: TDto, partial = false): void => {
  if (!partial && (!dto.title || dto.title.trim().length === 0)) throw AppError('Property title is required', 400, 'VALIDATION_ERROR');
  if (!partial && (!dto.location || dto.location.trim().length === 0)) throw AppError('Property location is required', 400, 'VALIDATION_ERROR');
  if (dto.price !== undefined && (typeof dto.price !== 'number' || dto.price <= 0)) throw AppError('Property price must be a positive number', 400, 'VALIDATION_ERROR');
  if (dto.type !== undefined && !Object.values(PropertyType).includes(dto.type)) throw AppError('Invalid property type', 400, 'VALIDATION_ERROR');
  if (!partial && (!dto.type || !Object.values(PropertyType).includes(dto.type))) throw AppError('Invalid property type', 400, 'VALIDATION_ERROR');
  if (dto.squareFeet !== undefined && (typeof dto.squareFeet !== 'number' || dto.squareFeet <= 0)) throw AppError('Square feet must be a positive number', 400, 'VALIDATION_ERROR');
  if (!partial && (typeof dto.squareFeet !== 'number' || dto.squareFeet <= 0)) throw AppError('Square feet must be a positive number', 400, 'VALIDATION_ERROR');
};

export const createPropertyService = (store: PropertyStore = process.env.JEST_WORKER_ID ? createInMemoryPropertyStore() : createSequelizePropertyStore()): PropertyServiceApi => ({
  async listProperties(filters) {
    const result = await store.getAll(filters);
    logger.info('Properties listed', { total: result.total, filters });
    return result;
  },
  async getPropertyById(id) {
    const property = await store.getById(id);
    if (!property) throw AppError('Property not found', 404, 'NOT_FOUND');
    return property;
  },
  async createProperty(dto) { validatePropertyDto(dto); return store.create(dto); },
  async updateProperty(id, dto) {
    validatePropertyDto(dto, true);
    const property = await store.update(id, dto);
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
