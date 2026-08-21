import { Router } from 'express';
import { loginUser, registerUser } from '../auth/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { credentialsSchema } from '../auth/validation';

const router = Router();

router.post('/register', validate(credentialsSchema, 'body'), registerUser);
router.post('/login', validate(credentialsSchema, 'body'), loginUser);

export default router;
