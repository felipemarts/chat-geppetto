
import path from 'path';
import fs from 'fs';
import helper from '../helper';
import { ChatData } from '../types';

// Function to create a new chat
export function createChat(req: any, res: any): any {
    let { name, projectPath } = req.body;

    // Validate input
    if (!name) {
        return res.status(400).json({ error: 'Chat name and project directory are required.' });
    }
    
    // Generate a new ID for the chat
    const newChatId = `${name}_${Date.now()}`;
    if(!projectPath) {
        projectPath = path.join(process.cwd(), `./temp/${Date.now()}`);
        fs.mkdirSync(projectPath, { recursive: true });
    }

    const chatData: ChatData = {
        id: newChatId,
        path: projectPath,
        name: name,
        history: [],
        files: [],
    };

    helper.saveChat(chatData);

    // Respond with success message and new chat ID
    return res.json({ success: true, chatId: newChatId });
}
