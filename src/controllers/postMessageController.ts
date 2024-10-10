
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Message } from '../types';
import helper from '../helper';

// Controller to post a message to a chat
export async function postMessage(req: any, res: any): Promise<any> {
    const { chatId } = req.params;
    const { message, shouldSend, files } = req.body;

    // Ensure message is provided
    if (!message) {
        return res.status(400).json({ error: 'Empty message' });
    }

    const chatData = helper.getChat(chatId);
    helper.saveChat({
        ...chatData,
        history: [...chatData.history, { role: 'user', content: message }]
    });

    if (!shouldSend) {
        return res.json({ botResponse: '' });
    }

    const sendMessages: Message[] = [];

    const newMessage: Message = { role: 'user', content: message };

    const modelFile = path.join(__dirname, '../../model.md');
    if (fs.existsSync(modelFile)) {
        const systemPrompt = fs.readFileSync(modelFile, 'utf8');
        sendMessages.push({
            role: "system",
            content: systemPrompt
        });
    }


    for (const filePath of files) {
        const formattedContent = helper.getProjectFile(chatId, filePath);
        sendMessages.push({
            role: 'user',
            content: formattedContent
        });
    }
    sendMessages.push(...chatData.history);

    sendMessages.push(newMessage);
    chatData.history.push(newMessage);
    helper.saveChat(chatData);

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: sendMessages
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const botResponse = response.data.choices[0].message.content;
        chatData.history.push({ role: 'assistant', content: botResponse });
        helper.saveChat(chatData);
        return res.json({ botResponse });
    } catch (error) {
        console.error('Error communicating with the OpenAI API:', error);
        return res.status(500).json({ error: 'Error getting response from OpenAI.' });
    }
}
