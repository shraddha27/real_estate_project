/**
 * Property Routes
 * API routes for property operations
 */

import { NextFunction, Request, Response, Router } from 'express';
import propertyController from '../controllers/property.controller';
import { authenticate } from '../auth/auth.middleware';
import { handleValidationErrors } from '../middleware/validate.middleware';
import { propertyFilterValidators, propertyValidators, updatePropertyValidators } from '../validation/schemas';

const router = Router();

/**
 * GET /api/properties
 * List all properties with optional filters
 */
router.get('/properties', propertyFilterValidators, handleValidationErrors, authenticate, (req: Request, res: Response, next: NextFunction) =>
  propertyController.listProperties(req, res, next)
);

/**
 * GET /api/properties/:id
 * Get a specific property
 */
router.get('/properties/:id', authenticate, (req, res, next) =>
  propertyController.getProperty(req, res, next)
);

/**
 * POST /api/properties
 * Create a new property
 */
router.post('/properties', propertyValidators, handleValidationErrors, authenticate, (req: Request, res: Response, next: NextFunction) =>
  propertyController.createProperty(req, res, next)
);

/**
 * PUT /api/properties/:id
 * Update a property
 */
router.put('/properties/:id', updatePropertyValidators, handleValidationErrors, authenticate, (req: Request, res: Response, next: NextFunction) =>
  propertyController.updateProperty(req, res, next)
);

/**
 * DELETE /api/properties/:id
 * Delete a property
 */
router.delete('/properties/:id', authenticate, (req, res, next) =>
  propertyController.deleteProperty(req, res, next)
);

export default router;
