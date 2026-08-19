import { v4 as uuidv4 } from 'uuid';
import logger from '../common/logger';
import { SequelizePropertyStore, PropertyStore } from '../database/property.repository';
import {
  IProperty, PropertyType, CreatePropertyDto, UpdatePropertyDto, PropertyFilters, PaginatedResponse,
} from '../models';
import { AppError } from '../common/app-error';

export { PropertyType } from '../models';

class InMemoryPropertyStore implements PropertyStore {
  private properties = new Map<string, IProperty>();

  constructor() {
    const sampleProperties: CreatePropertyDto[] = [
      { title: 'Modern City Apartment', description: 'Spacious 2-bedroom apartment in downtown', location: 'Manhattan, NYC', price: 850000, type: PropertyType.RESIDENTIAL, bedrooms: 2, bathrooms: 2, squareFeet: 1200, amenities: ['gym', 'pool', 'doorman', 'parking'] },
      { title: 'Luxury Suburban Home', description: 'Beautiful 4-bedroom family home', location: 'Brooklyn, NYC', price: 1500000, type: PropertyType.RESIDENTIAL, bedrooms: 4, bathrooms: 3, squareFeet: 3500, amenities: ['garden', 'garage', 'pool'] },
      { title: 'Commercial Office Space', description: 'Prime office location in business district', location: 'Manhattan, NYC', price: 5000000, type: PropertyType.COMMERCIAL, squareFeet: 5000, amenities: ['elevator', 'parking', 'conference rooms'] },
    ];
    sampleProperties.forEach(dto => {
      const now = new Date();
      const property: IProperty = {
        id: uuidv4(),
        ...dto,
        amenities: dto.amenities ?? [],
        createdAt: now,
        updatedAt: now,
      };
      this.properties.set(property.id, property);
    });
  }

  async getAll(filters: PropertyFilters): Promise<PaginatedResponse<IProperty>> {
    let properties = [...this.properties.values()];
    if (filters.location) properties = properties.filter(p => p.location.toLowerCase().includes(filters.location!.toLowerCase()));
    if (filters.type) properties = properties.filter(p => p.type === filters.type);
    if (filters.minPrice !== undefined) properties = properties.filter(p => p.price >= filters.minPrice!);
    if (filters.maxPrice !== undefined) properties = properties.filter(p => p.price <= filters.maxPrice!);
    if (filters.minBedrooms !== undefined) properties = properties.filter(p => (p.bedrooms || 0) >= filters.minBedrooms!);
    if (filters.maxBedrooms !== undefined) properties = properties.filter(p => (p.bedrooms || 0) <= filters.maxBedrooms!);
    const limit = Math.min(filters.limit || 10, 100);
    const offset = Math.max(filters.offset || 0, 0);
    return { data: properties.slice(offset, offset + limit), total: properties.length, limit, offset };
  }

  async getById(id: string): Promise<IProperty | undefined> { return this.properties.get(id); }

  async create(dto: CreatePropertyDto): Promise<IProperty> {
    const now = new Date();
    const property = { id: uuidv4(), ...dto, amenities: dto.amenities || [], createdAt: now, updatedAt: now };
    this.properties.set(property.id, property);
    return property;
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<IProperty | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    const updated = { ...property, ...dto, updatedAt: new Date() };
    this.properties.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> { return this.properties.delete(id); }
}

export class PropertyService {
  constructor(private readonly store: PropertyStore = process.env.JEST_WORKER_ID ? new InMemoryPropertyStore() : new SequelizePropertyStore()) {}

  async listProperties(filters: PropertyFilters): Promise<PaginatedResponse<IProperty>> {
    const result = await this.store.getAll(filters);
    logger.info('Properties listed', { total: result.total, filters });
    return result;
  }

  async getPropertyById(id: string): Promise<IProperty> {
    const property = await this.store.getById(id);
    if (!property) throw new AppError('Property not found', 404, 'NOT_FOUND');
    return property;
  }

  async createProperty(dto: CreatePropertyDto): Promise<IProperty> {
    this.validatePropertyDto(dto);
    return this.store.create(dto);
  }

  async updateProperty(id: string, dto: UpdatePropertyDto): Promise<IProperty> {
    this.validatePropertyDto(dto, true);
    const property = await this.store.update(id, dto);
    if (!property) throw new AppError('Property not found', 404, 'NOT_FOUND');
    return property;
  }

  async deleteProperty(id: string): Promise<boolean> {
    const deleted = await this.store.delete(id);
    if (!deleted) throw new AppError('Property not found', 404, 'NOT_FOUND');
    return true;
  }

  private validatePropertyDto<TDto extends Partial<CreatePropertyDto>>(dto: TDto, partial = false): void {
    if (!partial && (!dto.title || dto.title.trim().length === 0)) throw new AppError('Property title is required', 400, 'VALIDATION_ERROR');
    if (!partial && (!dto.location || dto.location.trim().length === 0)) throw new AppError('Property location is required', 400, 'VALIDATION_ERROR');
    if (dto.price !== undefined && (typeof dto.price !== 'number' || dto.price <= 0)) throw new AppError('Property price must be a positive number', 400, 'VALIDATION_ERROR');
    if (dto.type !== undefined && !Object.values(PropertyType).includes(dto.type)) throw new AppError('Invalid property type', 400, 'VALIDATION_ERROR');
    if (!partial && (!dto.type || !Object.values(PropertyType).includes(dto.type))) throw new AppError('Invalid property type', 400, 'VALIDATION_ERROR');
    if (dto.squareFeet !== undefined && (typeof dto.squareFeet !== 'number' || dto.squareFeet <= 0)) throw new AppError('Square feet must be a positive number', 400, 'VALIDATION_ERROR');
    if (!partial && (typeof dto.squareFeet !== 'number' || dto.squareFeet <= 0)) throw new AppError('Square feet must be a positive number', 400, 'VALIDATION_ERROR');
  }
}

export default new PropertyService();
