import { Configuration, OpenAIApi }  from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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