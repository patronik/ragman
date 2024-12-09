import dotenv from 'dotenv';
dotenv.config();
import { OpenAI }  from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function getChatResponse({ history, prompt, documents }) {
    const messages = [
        ...history,
        { role: 'user', content: prompt },
        { role: 'system', content: `Relevant documents: ${JSON.stringify(documents)}` },
    ];

    const response = await openai.createChatCompletion({
        model: process.env.COMPLETION_MODEL,
        messages,
    });

    return response.data.choices[0].message.content;
}

export { getChatResponse };