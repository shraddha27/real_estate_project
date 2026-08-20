import { PropertyType } from '../../features/properties/property';
import { PropertyRecord } from '../../database/models';
import { SequelizePropertyStore } from '../../features/properties/repository';

jest.mock('../../database', () => ({
  withTransaction: jest.fn(async (operation: (transaction: object) => Promise<unknown>) => operation({})),
}));
jest.mock('../../database/models', () => ({
  PropertyRecord: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

const record = (overrides: Partial<Record<string, unknown>> = {}): PropertyRecord => ({
  id: 'property-1', title: 'Apartment', description: 'Nice', location: 'NYC', price: '100000',
  type: PropertyType.RESIDENTIAL, bedrooms: 2, bathrooms: 1, squareFeet: 900,
  amenities: ['gym'], createdAt: new Date(), updatedAt: new Date(), ...overrides,
} as PropertyRecord);

describe('SequelizePropertyStore', () => {
  const findAndCountAll = PropertyRecord.findAndCountAll as jest.Mock;
  const findByPk = PropertyRecord.findByPk as jest.Mock;
  const create = PropertyRecord.create as jest.Mock;
  const destroy = PropertyRecord.destroy as jest.Mock;
  const store = new SequelizePropertyStore();

  beforeEach(() => {
    findAndCountAll.mockReset();
    findByPk.mockReset();
    create.mockReset();
    destroy.mockReset();
  });

  it('lists and maps filtered properties with pagination', async () => {
    findAndCountAll.mockResolvedValue({ count: 1, rows: [record()] });

    const result = await store.getAll({ location: 'NYC', type: PropertyType.RESIDENTIAL, limit: 5, offset: 10 });

    expect(result).toMatchObject({ total: 1, limit: 5, offset: 10 });
    expect(result.data[0].price).toBe(100000);
    expect(findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 5, offset: 10, order: [['createdAt', 'DESC']] }));
  });

  it('creates a property inside the repository transaction boundary', async () => {
    create.mockResolvedValue(record());

    const result = await store.create({
      title: 'Apartment', description: 'Nice', location: 'NYC', price: 100000,
      type: PropertyType.RESIDENTIAL, squareFeet: 900,
    });

    expect(result.id).toBe('property-1');
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ title: 'Apartment', squareFeet: 900, amenities: [] }), { transaction: {} });
  });

  it('returns false when deleting a missing property', async () => {
    destroy.mockResolvedValue(0);

    await expect(store.delete('missing')).resolves.toBe(false);
    expect(destroy).toHaveBeenCalledWith({ where: { id: 'missing' }, transaction: {} });
  });
});
