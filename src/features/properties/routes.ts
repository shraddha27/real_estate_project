import { NextFunction, Request, Response, Router } from 'express';
import propertyController from './controller';
import { propertyFilterValidators, propertyValidators, updatePropertyValidators } from './validation';
import { authenticate } from '../../auth/auth.middleware';
import { handleValidationErrors } from '../../middleware/validate.middleware';

const router = Router();
router.get('/properties', propertyFilterValidators, handleValidationErrors, authenticate, (req: Request, res: Response, next: NextFunction) => propertyController.listProperties(req, res, next));
router.get('/properties/:id', authenticate, (req, res, next) => propertyController.getProperty(req, res, next));
router.post('/properties', propertyValidators, handleValidationErrors, authenticate, (req: Request, res: Response, next: NextFunction) => propertyController.createProperty(req, res, next));
router.put('/properties/:id', updatePropertyValidators, handleValidationErrors, authenticate, (req: Request, res: Response, next: NextFunction) => propertyController.updateProperty(req, res, next));
router.delete('/properties/:id', authenticate, (req, res, next) => propertyController.deleteProperty(req, res, next));

export default router;
