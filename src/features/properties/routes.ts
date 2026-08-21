import { NextFunction, Response, Router } from 'express';
import propertyController, { CreatePropertyRequest, ListPropertiesRequest, PropertyRequest, UpdatePropertyRequest } from './controller';
import { createPropertySchema, propertyFiltersSchema, updatePropertySchema } from './validation';
import { authenticate } from '../../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';

const router = Router();
router.get('/properties', validate(propertyFiltersSchema, 'query'), authenticate, (req: ListPropertiesRequest, res: Response, next: NextFunction) => propertyController.listProperties(req, res, next));
router.get('/properties/:id', authenticate, (req: PropertyRequest, res: Response, next: NextFunction) => propertyController.getProperty(req, res, next));
router.post('/properties', validate(createPropertySchema, 'body'), authenticate, (req: CreatePropertyRequest, res: Response, next: NextFunction) => propertyController.createProperty(req, res, next));
router.put('/properties/:id', validate(updatePropertySchema, 'body'), authenticate, (req: UpdatePropertyRequest, res: Response, next: NextFunction) => propertyController.updateProperty(req, res, next));
router.delete('/properties/:id', authenticate, (req: PropertyRequest, res: Response, next: NextFunction) => propertyController.deleteProperty(req, res, next));

export default router;
