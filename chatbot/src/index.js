import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { getJobDocuments } from './services/jobService.js';
import { getChatResponse } from './services/chatService.js';
import { saveChatHistory, getChatHistory } from './utils/historyManager.js';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/chat', async (req, res) => {
    res.render('chat');
});

app.post('/chat', async (req, res) => {
    const { userId, prompt } = req.body;

    if (!userId || !prompt) {
        return res.status(400).send({ error: 'Missing userId or prompt.' });
    }

    try {
        const history = getChatHistory(userId);
        const jobDocuments = await getJobDocuments(prompt);
        const chatInput = { history, prompt, jobDocuments };

        const response = await getChatResponse(chatInput);

        saveChatHistory(userId, prompt, response);

        res.send({ response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});