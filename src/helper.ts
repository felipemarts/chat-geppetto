
import path from "path";
import fs from "fs";
import { ChatData } from "./types";

const getChatDir = (): string => {
    const chatsDir = path.join(process.cwd(), './chats');

    if (!fs.existsSync(chatsDir)) {
        fs.mkdirSync(chatsDir);
    }
    return chatsDir;
};

const getChat = (chatId): ChatData => {
    const chatsDir = getChatDir();
    const filePath = path.join(chatsDir, `${chatId}.json`);

    if (!fs.existsSync(filePath)) {
        throw new Error("Chat not found");
    }

    const chatData: ChatData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return chatData;
};

const saveChat = (chatData: ChatData): void => {
    const chatsDir = getChatDir();
    const filePath = path.join(chatsDir, `${chatData.id}.json`);

    if (!fs.existsSync(chatsDir)) {
        fs.mkdirSync(chatsDir);
    }
    fs.writeFileSync(filePath, JSON.stringify(chatData, null, 2), 'utf8');
};

export function getProjectFile(chatId: string, filePath: string): string {
    const chatData = getChat(chatId);

    const absoluteFilePath = path.join(chatData.path, filePath);

    if (!fs.existsSync(absoluteFilePath)) {
        return `File does not exist`
    }

    const content = fs.readFileSync(absoluteFilePath, 'utf-8');
    const extension = filePath.split('.').pop();

    const language = {
        js: 'javascript',
        ts: 'typescript',
        py: 'python',
        json: 'json',
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
        yaml: 'yaml',
    }[extension] || '';
    const formattedContent = `${filePath}\n\`\`\`${language}\n${content}\n\`\`\``;
    return formattedContent;
}

function saveProjectFile(chatId: string, filePath: string, content: string): void {
    const chatData = getChat(chatId);

    const absoluteFilePath = path.join(chatData.path, filePath);
    const dirName = path.dirname(absoluteFilePath);

    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    fs.writeFileSync(absoluteFilePath, content, 'utf8');
}

const helper = {
    getChatDir,
    getChat,
    saveChat,
    getProjectFile,
    saveProjectFile,
};

export default helper;
