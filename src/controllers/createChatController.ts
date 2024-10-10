
import path from 'path';
import fs from 'fs';
import helper from '../helper';

// Function to create a new chat
export function createChat(req: any, res: any): any {
    const { name, projectPath } = req.body;

    // Validate input
    if (!name) {
        return res.status(400).json({ error: 'Chat name and project directory are required.' });
    }

    // Generate a new ID for the chat
    const newChatId = `${name}_${Date.now()}`;

    const chatData = {
        id: newChatId,
        path: projectPath,
        name: name,
        history: [],
    };

    // Get chat directory and create a chat file
    const chatsDir = helper.getChatDir();
    const chatFilePath = path.join(chatsDir, `${newChatId}.json`);
    fs.writeFileSync(chatFilePath, JSON.stringify(chatData, null, 2));

    // Respond with success message and new chat ID
    return res.json({ success: true, chatId: newChatId });
}
