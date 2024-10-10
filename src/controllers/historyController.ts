
import { Message } from '../types';
import helper from '../helper';
import { populateFiles } from '../services/scanner';

export function saveHistory(req: any, res: any): any {
    const { chatId } = req.params;
    const { history } = req.body;

    const chatData = helper.getChat(chatId);
    chatData.history = history;
    helper.saveChat(chatData);
    return res.json({});
}

export function getHistory(req: any, res: any): any {
    const { chatId } = req.params;

    const chatData = helper.getChat(chatId);

    chatData.files = populateFiles(chatData.path);

    return res.json(chatData);
}

export function getFileContent(req: any, res: any): any {
    const { chatId, filePath } = req.params;

    try {
        const formattedContent = helper.getProjectFile(chatId, filePath);
        const message: Message = {
            role: 'user',
            content: formattedContent
        };

        return res.json({ message });
    } catch (error) {
        return res.status(500).json({ error: 'Error retrieving the file', details: error.message });
    }
}
