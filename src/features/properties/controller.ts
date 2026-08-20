import { Request, Response, NextFunction } from 'express';
import propertyService, { PropertyServiceApi } from './service';
import { ApiSuccessResponse, PaginatedResponse } from '../../models/common';
import { CreatePropertyDto, IProperty, PropertyFilters, UpdatePropertyDto } from './property';

export const createPropertyController = (service: PropertyServiceApi = propertyService) => ({
  async listProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const result = await service.listProperties(req.query as PropertyFilters); res.status(200).json({ success: true, data: result } satisfies ApiSuccessResponse<PaginatedResponse<IProperty>>); } catch (error) { next(error); }
  },
  async getProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const property = await service.getPropertyById(req.params.id); res.status(200).json({ success: true, data: property } satisfies ApiSuccessResponse<IProperty>); } catch (error) { next(error); }
  },
  async createProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const property = await service.createProperty(req.body as CreatePropertyDto); res.status(201).json({ success: true, message: 'Property created successfully', data: property } satisfies ApiSuccessResponse<IProperty>); } catch (error) { next(error); }
  },
  async updateProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const property = await service.updateProperty(req.params.id, req.body as UpdatePropertyDto); res.status(200).json({ success: true, message: 'Property updated successfully', data: property } satisfies ApiSuccessResponse<IProperty>); } catch (error) { next(error); }
  },
  async deleteProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await service.deleteProperty(req.params.id); res.status(200).json({ success: true, message: 'Property deleted successfully' } satisfies ApiSuccessResponse); } catch (error) { next(error); }
  },
});

export type PropertyController = ReturnType<typeof createPropertyController>;
export default createPropertyController();
