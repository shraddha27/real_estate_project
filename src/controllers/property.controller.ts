/**
 * Property Controller
 * Handles HTTP requests for property operations
 */

import { Request, Response, NextFunction } from 'express';
import propertyService from '../services/property.service';
import { ApiSuccessResponse, CreatePropertyDto, IProperty, PaginatedResponse, PropertyFilters, UpdatePropertyDto } from '../models';

export class PropertyController {
  /**
   * GET /api/properties
   * List all properties with optional filtering
   */
  async listProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query as PropertyFilters;

      const result = await propertyService.listProperties(filters);
      const response: ApiSuccessResponse<PaginatedResponse<IProperty>> = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/properties/:id
   * Get a specific property by ID
   */
  async getProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const property = await propertyService.getPropertyById(id);

      const response: ApiSuccessResponse<IProperty> = {
        success: true,
        data: property,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/properties
   * Create a new property
   */
  async createProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreatePropertyDto;
      const property = await propertyService.createProperty(dto);

      const response: ApiSuccessResponse<IProperty> = {
        success: true,
        message: 'Property created successfully',
        data: property,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/properties/:id
   * Update an existing property
   */
  async updateProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body as UpdatePropertyDto;
      const property = await propertyService.updateProperty(id, dto);

      const response: ApiSuccessResponse<IProperty> = {
        success: true,
        message: 'Property updated successfully',
        data: property,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/properties/:id
   * Delete a property
   */
  async deleteProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await propertyService.deleteProperty(id);

      const response: ApiSuccessResponse = {
        success: true,
        message: 'Property deleted successfully',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new PropertyController();
