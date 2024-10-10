
import fs from 'fs';
import path from 'path';
import helper from '../helper';

// Function to list all available chats
export function listChats(req: any, res: any): any {
    const chats = [];
    const chatsDir = helper.getChatDir();

    // Reading all files in the chat directory
    fs.readdirSync(chatsDir).forEach(file => {
        const chat = JSON.parse(fs.readFileSync(path.join(chatsDir, file), 'utf8'));
        chats.push(chat);
    });

    // Respond with JSON of all chats
    return res.json({ chats });
}
