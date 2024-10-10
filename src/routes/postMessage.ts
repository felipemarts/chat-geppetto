
import { Router } from 'express';
import { postMessage } from '../controllers/postMessageController';

const router = Router();

// Route to post a message in a specific chat
router.post('/post_msg/:chatId', postMessage);

export default router;
