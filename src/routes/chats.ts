
import { Router } from 'express';
import { listChats } from '../controllers/chatsController';

const router = Router();

// Route to list all available chats
router.get('/chats', listChats);

export default router;
