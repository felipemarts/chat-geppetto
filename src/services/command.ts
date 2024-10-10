
import fs from 'fs';
import path from 'path';
import helper from '../helper';
import { ChatData } from '../types';

// Define the structure for a file operation
interface FileOperation {
    id: string;
    command: string;
    content: string;
}

// Process a command related to file operations
export const commandProcess = async (operation: FileOperation): Promise<void> => {
    if (operation.command === "deploy") {
        await updateFile(operation);
    } else if (operation.command === "clone") {
        await clone(operation);
    } else if (operation.command === "rename") {
        await rename(operation);
    } else if (operation.command === "delete") {
        await deleteChat(operation);
    } else {
        throw new Error(`Invalid command ${operation.command}`);
    }
};

// Update a file based on the operation's details
const updateFile = async (operation: FileOperation) => {
    const lines = operation.content.split('\n');
    const firstLine = lines[0];

    // Validate the content format
    if (!/\/\/.+\.\w+$/.test(firstLine)) {
        throw new Error("Invalid format - Must start with '//'");
    }
    const commandPath = firstLine.substring(2).trim();
    lines.shift();
    const content = lines.join('\n');

    try {
        let baseDir = '';
        const chatsDir = helper.getChatDir();
        const filePath = path.join(chatsDir, `${operation.id}.json`);

        if (fs.existsSync(filePath)) {
            const chatData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            if (chatData.path) {
                baseDir = chatData.path;
            } else {
                throw new Error("Project path not configured");
            }
        } else {
            throw new Error("Chat not found");
        }

        const absolutePath = path.join(baseDir, commandPath);
        const dirName = path.dirname(absolutePath);

        // Ensure the directory exists, create if not
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }

        // Write changes back to the file
        fs.writeFileSync(absolutePath, content, 'utf8');
    } catch (error) {
        console.error('Error processing file operation:', error);
        throw error;
    }
}

const clone = async (operation: FileOperation) => {
    const chatsDir = helper.getChatDir();
    const filePath = path.join(chatsDir, `${operation.id}.json`);


    if (fs.existsSync(filePath)) {
        const chatData: ChatData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        chatData.name = operation.content;
        chatData.id = `${chatData.name}_${Date.now()}`;
        const chatFilePath = path.join(chatsDir, `${chatData.id}.json`);
        fs.writeFileSync(chatFilePath, JSON.stringify(chatData, null, 2));
    } else {
        throw new Error("Chat not found");
    }
}

const deleteChat = async (operation: FileOperation) => {
    const chatsDir = helper.getChatDir();
    const filePath = path.join(chatsDir, `${operation.id}.json`);

    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath);
    } else {
        throw new Error("Chat not found");
    }
}

const rename = async (operation: FileOperation) => {
    const chatsDir = helper.getChatDir();
    const filePath = path.join(chatsDir, `${operation.id}.json`);


    if (fs.existsSync(filePath)) {
        const chatData: ChatData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        chatData.name = operation.content;

        fs.writeFileSync(filePath, JSON.stringify(chatData, null, 2));
    } else {
        throw new Error("Chat not found");
    }
}