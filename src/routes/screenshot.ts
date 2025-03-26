import { Router } from 'express';
import { screenshotAndSend } from '../controllers/screenshotController';

const router = Router();

router.post('/screenshot/send', screenshotAndSend);

export default router;
