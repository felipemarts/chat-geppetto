import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import takeScreenshot from '../services/takeScreenshot';

// Modify the screenshot and send function to use base64 encoding
export async function screenshotAndSend(req: Request, res: Response): Promise<void> {
    try {
        // Take a screenshot
        const screenshotPath = await takeScreenshot();

        // Convert the image to a base64 string
        const base64Screenshot = fs.readFileSync(screenshotPath, 'base64');

        // Construct the API payload with a base64 encoded image
        const payload = {
            model: "gpt-4o-mini",
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: "What's in this image?" },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Screenshot}`,
                        },
                    },
                ],
            }],
        };

        // API key for OpenAI
        const apiKey = process.env.OPENAI_API_KEY;

        // Send post request to OpenAI API
        const openAIClient = axios.create({
            baseURL: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await openAIClient.post('', payload);

        // Handle OpenAI response
        const imageResponse = response.data;
        res.json({ data: imageResponse });
    } catch (err) {
        console.error('Error sending screenshot to GPT:', err);
        res.status(500).json({ error: 'Could not send screenshot to GPT.' });
    }
}
