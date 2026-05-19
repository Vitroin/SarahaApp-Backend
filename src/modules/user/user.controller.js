import Router from 'express';
import * as userService from './user.service.js';
import { fileUpload as fileUploadCloud } from '../../utils/multer/multer.cloud.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/error/index.js';

const router = Router();

router.delete("/", asyncHandler(isAuthenticated), asyncHandler(userService.deleteAccount));

router.post('/upload-profile-cloud',
  asyncHandler(isAuthenticated),
  fileUploadCloud().single("profilePicture"),
  asyncHandler(userService.uploadProfilePictureCloud)
);

router.get('/me', asyncHandler(isAuthenticated), asyncHandler(userService.getMe));
export default router;