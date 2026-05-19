import Router from 'express';
import { isAuthenticated } from '../../middleware/auth.middleware.js';

const router = Router();

// Placeholder — returns empty array until messages are implemented
router.get('/', isAuthenticated, (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

export default router;