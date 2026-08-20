import { Router } from 'express';
import { loginUser, registerUser } from '../auth/auth.controller';
import { handleValidationErrors } from '../middleware/validate.middleware';
import { credentialsValidators } from '../auth/validation';

const router = Router();

router.post('/register', credentialsValidators, handleValidationErrors, registerUser);
router.post('/login', credentialsValidators, handleValidationErrors, loginUser);

export default router;
