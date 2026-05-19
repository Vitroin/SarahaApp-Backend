import Router from 'express';
import * as authService from './auth.service.js';
import { asyncHandler } from "../../utils/error/index.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { registerSchema,resetPasswordSchema } from './auth.validation.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js';

const router = Router();

router.post("/register", isValid(registerSchema),authService.register)
router.post("/login", authService.login)
router.post("/verify", authService.verifyAccount)
router.post("/resend-otp", authService.sendOTP)
router.post("/google-login", authService.googleLogin)
router.patch("/reset-password", isValid(resetPasswordSchema),authService.resetPassword)
router.post("/logout", isAuthenticated, authService.logout)
export default router;


//Why do we use default export for the router?
