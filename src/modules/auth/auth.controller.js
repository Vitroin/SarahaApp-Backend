import Router from 'express';
import * as authService from './auth.service.js';
import { asyncHandler } from "../../utils/error/index.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { registerSchema } from './auth.validation.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js';

const router = Router();

router.post("/register", isValid(registerSchema), asyncHandler(authService.register));
router.post("/login", asyncHandler(authService.login));
router.post("/verify", asyncHandler(authService.verifyAccount));
router.post("/resend-otp", asyncHandler(authService.sendOTP));
router.post("/logout", asyncHandler(isAuthenticated), asyncHandler(authService.logout));

export default router;