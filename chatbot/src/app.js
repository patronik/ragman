import config from './config.js';
import express from 'express';
import session from 'express-session';
import { getSimilarDocuments } from './services/documentService.js';
import { getChatResponse } from './services/chatService.js';
import { saveChatHistory, getChatHistory } from './utils/historyManager.js';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!config.session.secret) {
    throw new Error('Session secret is not configured.');
}

if (!config.base_url) {
    throw new Error('Base URL is not configured.');
}

// Session middleware setup
app.use(
session({
        secret: config.session.secret, 
        resave: config.session.resave 
            ? config.session.resave == "true" : false,
        saveUninitialized: config.session.saveUninitialized 
            ? config.session.saveUninitialized == "true" : true,
        cookie: { maxAge: config.session.maxAge || 600000 } 
    })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/chat', async (req, res) => {
    res.render(
        'chat', 
        {            
            baseUrl: config.base_url,
            chatbotName: config.chat.name || 'Ragman | Demo',
            scenarios: config.chat.scenarios || [{key: "default", label:"Default"}],
            categories: config.chat.rag.categories || [{key: "general", label:"General"}],
        }
    );
});

app.post('/chat', async (req, res) => {
    const { prompt, scenario, rag } = req.body;

    if (!prompt) {
        return res.status(400).send({ error: 'Missing prompt.' });
    }

    if (!scenario) {
        throw new Error('Conversation scenario is not provided.');
    }   

    let userId = req.body.userId;
    if (!userId) {
        if (req.session.id) {
            userId = req.session.id;
        } else {
            throw new Error('Failed to identify the user.');
        }
    }   

    try {
        const history = await getChatHistory(`${userId}_${scenario}`);

        let documents = [];
        if (rag.enabled) {
            documents = await getSimilarDocuments(prompt, rag.category, rag.limit);
        }

        const response = await getChatResponse({ history, prompt, documents, scenario });

        saveChatHistory(userId, prompt, response);

        res.send({ response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

const PORT = config.port || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});