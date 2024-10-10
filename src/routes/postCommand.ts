
import express from 'express';
import { postCommandController } from '../controllers/postCommandController';

const router = express.Router();

// Route to handle command operations
router.post('/command/:chatId', postCommandController);

export default router;
