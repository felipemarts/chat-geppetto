
import { Router } from 'express';
import { createChat } from '../controllers/createChatController';

const router = Router();

// Route to create a new chat
router.post('/create_chat', createChat);

export default router;
