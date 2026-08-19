import { Router } from 'express';
import propertyRoutes from './property.routes';
import authRoutes from './auth.routes';

const router = Router();
router.use('/auth', authRoutes);
router.use(propertyRoutes);

export default router;
