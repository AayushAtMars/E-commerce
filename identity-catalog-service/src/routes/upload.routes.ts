import { Router } from 'express';
import { upload, uploadFiles } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Protected — only logged-in users can upload
router.post('/', authMiddleware, upload.array('files', 6), uploadFiles);

export default router;
