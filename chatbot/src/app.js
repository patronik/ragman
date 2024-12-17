import config from './config.js';
import express from 'express';
import { getDocuments } from './services/documentService.js';
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
    const { userId, prompt, category } = req.body;

    if (!userId || !prompt || !category) {
        return res.status(400).send({ error: 'Missing userId or prompt.' });
    }

    try {
        const history = await getChatHistory(userId);
        const documents = await getDocuments(prompt, category);
        const chatInput = { history, prompt, documents, category };

        const response = await getChatResponse(chatInput);

        saveChatHistory(userId, prompt, response);

        res.send({ response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

const PORT = config.port || 6000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});