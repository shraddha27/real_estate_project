/**
 * Property Controller Unit Tests
 */

import { Request, Response, NextFunction } from 'express';
import propertyController from '../../features/properties/controller';
import propertyService from '../../features/properties/service';
import { PropertyType } from '../../features/properties/property';

// Mock the service
jest.mock('../../features/properties/service');

describe('PropertyController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('listProperties', () => {
    it('should return properties with success status', async () => {
      const mockData = {
        data: [
          {
            id: '1',
            title: 'Test Property',
            location: 'Test',
            price: 100000,
            type: PropertyType.RESIDENTIAL,
            squareFeet: 1000,
            amenities: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        limit: 10,
        offset: 0,
      };

      (propertyService.listProperties as jest.Mock).mockResolvedValue(mockData);

      await propertyController.listProperties(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Service error');
      (propertyService.listProperties as jest.Mock).mockRejectedValue(error);

      await propertyController.listProperties(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createProperty', () => {
    it('should create property and return 201', async () => {
      req.body = {
        title: 'New Property',
        description: 'Test',
        location: 'Test Location',
        price: 500000,
        type: PropertyType.RESIDENTIAL,
        squareFeet: 1000,
      };

      const mockProperty = {
        id: 'new-id',
        ...req.body,
        amenities: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (propertyService.createProperty as jest.Mock).mockResolvedValue(mockProperty);

      await propertyController.createProperty(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Property created successfully',
        data: mockProperty,
      });
    });
  });
});
