import fs from 'fs';
import path from 'path';
import helper from '../helper';
import { generateFileList } from './scanner';

interface FileOperation {
    id: string;
    command: string;
    content: string;
}

export const commandProcess = async (operation: FileOperation): Promise<void> => {
    if (operation.command === "write") {
        await updateFile(operation);
    } else if (operation.command === "rm") {
        await deleteFile(operation);
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

const deleteFile = async (operation: FileOperation) => {
    const lines = operation.content.split('\n');
    const firstLine = lines[0];

    if (!/\/\/.+\.\w+$/.test(firstLine)) {
        throw new Error("Invalid format - Must start with '//'");
    }
    const filePath = firstLine.substring(2).trim();

    helper.deleteProjectFile(operation.id, filePath);
}

const updateFile = async (operation: FileOperation) => {
    const lines = operation.content.split('\n');
    const firstLine = lines[0];

    if (!/\/\/.+\.\w+$/.test(firstLine)) {
        throw new Error("Invalid format - Must start with '//'");
    }
    const filePath = firstLine.substring(2).trim();
    lines.shift();
    const content = lines.join('\n');

    helper.saveProjectFile(operation.id, filePath, content);
}

const clone = async (operation: FileOperation) => {
    const chatData = helper.getChat(operation.id);

    chatData.name = operation.content;
    chatData.id = `${chatData.name}_${Date.now()}`;

    helper.saveChat(chatData);
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
    const chatData = helper.getChat(operation.id);

    chatData.name = operation.content;
    
    helper.saveChat(chatData);
}
