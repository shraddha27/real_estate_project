/**
 * Property Service Unit Tests
 */

import { PropertyService, PropertyType } from '../../services/property.service';
import { CreatePropertyDto } from '../../models';

describe('PropertyService', () => {
  let service: PropertyService;

  beforeEach(() => {
    service = new PropertyService();
  });

  describe('listProperties', () => {
    it('should return all properties', async () => {
      const result = await service.listProperties({});
      expect(result.total).toBeGreaterThan(0);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should filter properties by location', async () => {
      const result = await service.listProperties({ location: 'Manhattan' });
      expect(result.data.every(p => p.location.includes('Manhattan'))).toBe(true);
    });

    it('should filter properties by price range', async () => {
      const result = await service.listProperties({
        minPrice: 800000,
        maxPrice: 1500000,
      });
      expect(
        result.data.every(p => p.price >= 800000 && p.price <= 1500000)
      ).toBe(true);
    });

    it('should filter properties by type', async () => {
      const result = await service.listProperties({
        type: PropertyType.RESIDENTIAL,
      });
      expect(result.data.every(p => p.type === PropertyType.RESIDENTIAL)).toBe(true);
    });
  });

  describe('getPropertyById', () => {
    it('should return a property by id', async () => {
      const list = await service.listProperties({});
      const firstProperty = list.data[0];

      const property = await service.getPropertyById(firstProperty.id);
      expect(property.id).toBe(firstProperty.id);
      expect(property.title).toBe(firstProperty.title);
    });

    it('should throw error for non-existent property', async () => {
      await expect(service.getPropertyById('non-existent-id')).rejects.toThrow(
        'Property not found'
      );
    });
  });

  describe('createProperty', () => {
    it('should create a new property', async () => {
      const dto: CreatePropertyDto = {
        title: 'Test Property',
        description: 'Test Description',
        location: 'Test Location',
        price: 500000,
        type: PropertyType.RESIDENTIAL,
        bedrooms: 2,
        bathrooms: 1,
        squareFeet: 1000,
        amenities: ['pool'],
      };

      const property = await service.createProperty(dto);
      expect(property.id).toBeDefined();
      expect(property.title).toBe(dto.title);
      expect(property.price).toBe(dto.price);
    });

    it('should throw error for invalid price', async () => {
      const dto: Partial<CreatePropertyDto> = {
        title: 'Test',
        location: 'Test',
        price: -100,
        type: PropertyType.RESIDENTIAL,
        squareFeet: 1000,
      };

      await expect(
        service.createProperty(dto as CreatePropertyDto)
      ).rejects.toThrow('positive number');
    });
  });

  describe('updateProperty', () => {
    it('should update an existing property', async () => {
      const list = await service.listProperties({});
      const property = list.data[0];

      const updated = await service.updateProperty(property.id, {
        title: 'Updated Title',
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.id).toBe(property.id);
    });
  });

  describe('deleteProperty', () => {
    it('should delete a property', async () => {
      const dto: CreatePropertyDto = {
        title: 'Delete Test',
        description: 'Test',
        location: 'Test',
        price: 100000,
        type: PropertyType.RESIDENTIAL,
        squareFeet: 1000,
      };

      const created = await service.createProperty(dto);
      const deleted = await service.deleteProperty(created.id);

      expect(deleted).toBe(true);

      await expect(service.getPropertyById(created.id)).rejects.toThrow(
        'Property not found'
      );
    });
  });
});
