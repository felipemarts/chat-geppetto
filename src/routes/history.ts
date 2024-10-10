
import { Router } from 'express';
import { getFileContent, getHistory, saveHistory } from '../controllers/historyController';

const router = Router();

// Route to get chat history by chatId
router.get('/history/:chatId', getHistory);

// Route to save chat history for a specific chat
router.post('/history/:chatId', saveHistory);

// Route to get file content by chatId and filePath
router.get('/history/:chatId/file/:filePath', getFileContent);

export default router;
