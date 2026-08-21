import { Response, NextFunction } from 'express';
import propertyService, { PropertyServiceApi } from './service';
import { ApiSuccessResponse, PaginatedResponse } from '../../models/common';
import { IProperty } from './property';
import { ParsedCreateProperty, ParsedUpdateProperty, PropertyFilters } from './validation';
import { ValidatedRequest } from '../../middleware/validate.middleware';

type PropertyParams = { id: string };
export type ListPropertiesRequest = ValidatedRequest<unknown, PropertyFilters, Record<string, never>>;
export type PropertyRequest = ValidatedRequest<unknown, unknown, PropertyParams>;
export type CreatePropertyRequest = ValidatedRequest<ParsedCreateProperty, unknown, PropertyParams>;
export type UpdatePropertyRequest = ValidatedRequest<ParsedUpdateProperty, unknown, PropertyParams>;

export const createPropertyController = (service: PropertyServiceApi = propertyService) => ({
  async listProperties(req: ListPropertiesRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.listProperties(req.query);
      res.status(200).json({ success: true, data: result } satisfies ApiSuccessResponse<PaginatedResponse<IProperty>>);
    } catch (error) {
      next(error);
    }
  },
  async getProperty(req: PropertyRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const property = await service.getPropertyById(req.params.id);
      res.status(200).json({ success: true, data: property } satisfies ApiSuccessResponse<IProperty>);
    } catch (error) {
      next(error);
    }
  },
  async createProperty(req: CreatePropertyRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const property = await service.createProperty(req.body);
      res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: property,
      } satisfies ApiSuccessResponse<IProperty>);
    } catch (error) {
      next(error);
    }
  },
  async updateProperty(req: UpdatePropertyRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const property = await service.updateProperty(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Property updated successfully',
        data: property,
      } satisfies ApiSuccessResponse<IProperty>);
    } catch (error) {
      next(error);
    }
  },
  async deleteProperty(req: PropertyRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.deleteProperty(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Property deleted successfully',
      } satisfies ApiSuccessResponse);
    } catch (error) {
      next(error);
    }
  },
});

export type PropertyController = ReturnType<typeof createPropertyController>;
export default createPropertyController();
