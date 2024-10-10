
// Interface for a chat message, defining role and content
export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

// Type for an action, with a name and associated content
export type Action = {
    name: string;
    content: string;
}

// Type defining the structure of chat data
export type ChatData = {
    id: string;
    name: string;
    path?: string;
    history: Message[];
    files: Action[];
}
