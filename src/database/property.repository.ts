import { Op, WhereOptions } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { withTransaction } from './index';
import { PropertyRecord } from './models';
import {
  CreatePropertyDto, CrudStore, IProperty, PaginatedResponse, PropertyFilters, UpdatePropertyDto,
} from '../models';

export type PropertyStore = CrudStore<IProperty, CreatePropertyDto, UpdatePropertyDto, PropertyFilters>;

const toDomain = (record: PropertyRecord): IProperty => ({
  id: record.id, title: record.title, description: record.description, location: record.location,
  price: Number(record.price), type: record.type, bedrooms: record.bedrooms ?? undefined,
  bathrooms: record.bathrooms ?? undefined, squareFeet: record.squareFeet,
  amenities: record.amenities ?? [], createdAt: record.createdAt, updatedAt: record.updatedAt,
});

export class SequelizePropertyStore implements PropertyStore {
  async getAll(filters: PropertyFilters): Promise<PaginatedResponse<IProperty>> {
    const where: WhereOptions = {};
    if (filters.location) where.location = { [Op.iLike]: `%${filters.location}%` };
    if (filters.type) where.type = filters.type;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = { ...(filters.minPrice !== undefined ? { [Op.gte]: filters.minPrice } : {}), ...(filters.maxPrice !== undefined ? { [Op.lte]: filters.maxPrice } : {}) };
    }
    if (filters.minBedrooms !== undefined || filters.maxBedrooms !== undefined) {
      where.bedrooms = { ...(filters.minBedrooms !== undefined ? { [Op.gte]: filters.minBedrooms } : {}), ...(filters.maxBedrooms !== undefined ? { [Op.lte]: filters.maxBedrooms } : {}) };
    }
    const limit = Math.min(filters.limit || 10, 100);
    const offset = Math.max(filters.offset || 0, 0);
    const result = await PropertyRecord.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] });
    return { data: result.rows.map(toDomain), total: result.count, limit, offset };
  }

  async getById(id: string): Promise<IProperty | undefined> {
    const record = await PropertyRecord.findByPk(id);
    return record ? toDomain(record) : undefined;
  }

  async create(dto: CreatePropertyDto): Promise<IProperty> {
    return withTransaction(async transaction => {
      const record = await PropertyRecord.create({ id: uuidv4(), ...dto, amenities: dto.amenities ?? [] }, { transaction });
      return toDomain(record);
    });
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<IProperty | undefined> {
    return withTransaction(async transaction => {
      const record = await PropertyRecord.findByPk(id, { transaction });
      if (!record) return undefined;
      await record.update(dto, { transaction });
      return toDomain(record);
    });
  }

  async delete(id: string): Promise<boolean> {
    return withTransaction(async transaction => (await PropertyRecord.destroy({ where: { id }, transaction })) === 1);
  }
}
