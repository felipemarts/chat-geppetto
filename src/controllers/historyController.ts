
import fs from 'fs';
import path from 'path';
import { populateFiles } from '../services/scanner';
import { ChatData, Message } from '../types';
import helper from '../helper';

const chatsDir = path.join(__dirname, '../../chats');

// Function to save chat history for a specific chat
export function saveChatHistory(chatId: string, history: Message[]) {
    helper.getChatDir();
    const filePath = path.join(chatsDir, `${chatId}.json`);

    // Load existing chat data from JSON
    const chatData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Update only the history
    chatData.history = history;

    // Save the complete JSON with updated history
    fs.writeFileSync(filePath, JSON.stringify(chatData, null, 2));
}

// Endpoint to save chat history for a specific chat
export function saveHistory(req: any, res: any): any {
    const { chatId } = req.params;
    const { history } = req.body;
    saveChatHistory(chatId, history);
    return res.json({});
}

// Function to load chat history for a specific chat
export function loadChatHistory(chatId: string): ChatData {
    const filePath = path.join(chatsDir, `${chatId}.json`);
    if (fs.existsSync(filePath)) {
        const chatData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (chatData.path) {
            // Update the call so 'files' is constructed correctly
            chatData.files = populateFiles(chatData.id, chatData.name, chatData.path);
        }
        return chatData;
    }
    throw new Error("Chat not found");
}

// Endpoint to get chat history for a specific chat
export function getHistory(req: any, res: any): any {
    const { chatId } = req.params;
    const chatData = loadChatHistory(chatId);

    return res.json(chatData);
}

export function getFileMessage(chatId: string, filePath: string) {
    // Load the chat history to verify if chat exists
    const chatData = loadChatHistory(chatId);

    // Retrieve the path of the project associated with this chat
    const baseDir = chatData.path;
    const absoluteFilePath = path.join(baseDir, filePath);

    // Check if the file exists
    if (!fs.existsSync(absoluteFilePath)) {
        throw new Error("File not found");
    }

    // Read the file content
    const content = fs.readFileSync(absoluteFilePath, 'utf-8');

    const extension = filePath.split('.').pop();
    const language = {
        js: 'javascript',
        ts: 'typescript',
        json: 'json',
        py: 'python',
        html: 'html',
        css: 'css',
        java: 'java',
        rb: 'ruby',
        php: 'php',
        cpp: 'cpp',
        c: 'c',
        go: 'go',
        cs: 'csharp',
        xml: 'xml',
        sql: 'sql',
        md: 'markdown',
        sh: 'bash',
        yml: 'yaml',
        yaml: 'yaml'
    }[extension] || '';

    const formattedContent = `${filePath}\n\`\`\`${language}\n${content}\n\`\`\``;

    return {
        role: 'user',
        content: formattedContent,
    };
}

// Endpoint to get file content
export function getFileContent(req: any, res: any): any {
    const { chatId, filePath } = req.params;

    try {
        const message = getFileMessage(chatId, filePath);

        return res.json({ message });
    } catch (error) {
        return res.status(500).json({ error: 'Error retrieving the file', details: error.message });
    }
}
