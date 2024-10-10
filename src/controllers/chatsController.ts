
import fs from 'fs';
import path from 'path';
import helper from '../helper';

export function listChats(req: any, res: any): any {
    const chats = [];
    const chatsDir = helper.getChatDir();

    fs.readdirSync(chatsDir).forEach(file => {
        const chat = JSON.parse(fs.readFileSync(path.join(chatsDir, file), 'utf8'));
        chats.push({
            id: chat.id,
            name: chat.name,
        });
    });

    return res.json({ chats });
}
