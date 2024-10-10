
import path from "path";
import fs from "fs";

// Function to get or create the chat directory
const getChatDir = (): string => {
    const chatsDir = path.join(process.cwd(), './chats');

    // Check if the directory exists, create if not
    if (!fs.existsSync(chatsDir)) {
        fs.mkdirSync(chatsDir);
    }
    return chatsDir;
};

const helper = {
    getChatDir,
};

export default helper;
