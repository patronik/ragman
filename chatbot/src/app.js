import config from './config.js';
import express from 'express';
import session from 'express-session';
import { getSimilarDocuments } from './services/documentService.js';
import { getChatResponse } from './services/chatService.js';
import { saveChatHistory, getChatHistory, clearChatHistory } from './utils/historyManager.js';
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

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware setup
app.use(
session({
        secret: config.session.secret, 
        resave: config.session.resave ? config.session.resave == "true" : false,
        saveUninitialized: config.session.saveUninitialized ? config.session.saveUninitialized == "true" : true,
        cookie: { maxAge: config.session.maxAge || 600000 } 
    })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/chat', async (req, res) => {
    const baseUrl =  config.base_url || 'http://localhost:4000'
    const chatName = config.chat.name || 'Ragman | Demo'; 

    const scenarios = config.chat.scenarios || [{key: "default", label:"Default"}];
    const scenario =  req.session.scenario || scenarios[0].key;

    const models = config.chat.models || [{key: "gpt-4", label:"gpt-4"}];
    const model = req.session.model || models[0].key;

    const useRAG = req.session.useRAG || false;  

    const categories = config.chat.rag.categories || [{key: "general", label:"General"}];
    const category = req.session.category || categories[0].key;

    const docLimits = config.chat.rag.limits || [5, 10, 15] 
    const docLimit = req.session.docLimit || docLimits[0];

    let chatHistory = [];
    if (req.session.userId && req.session.scenario) {
        chatHistory = await getChatHistory(req.session.userId, req.session.scenario);
    }        
    res.render(
        'chat', { 
            baseUrl, 
            chatName, 
            scenarios, 
            scenario, 
            models, 
            model, 
            useRAG, 
            categories, 
            category, 
            docLimits,
            docLimit,
            chatHistory 
        }
    );
});

app.post('/chat', async (req, res) => {
    const { prompt, scenario, model, rag } = req.body;

    if (!prompt) {
        return res.status(400).send({ error: 'Missing prompt.' });
    }

    if (!scenario) {
        throw new Error('Conversation scenario is not provided.');
    }   

    if (!model) {
        throw new Error('AI model is not provided.');
    }  

    let userId = req.body.userId || req.session.id;
    if (!userId) {
        throw new Error('Failed to identify the user.');
    }   

    try {
        const chatHistory = await getChatHistory(userId, scenario);        

        let documents = [];
        if (rag.enabled) {
            documents = await getSimilarDocuments(prompt, rag.category, rag.limit);
        }

        const response = await getChatResponse({ chatHistory, prompt, documents, scenario, model });

        saveChatHistory(userId, scenario, prompt, response);        

        req.session.userId = userId;
        req.session.scenario = scenario;

        res.send({ response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/set-scenario', async (req, res) => {
    const { scenario } = req.body;

    let found = false;
    let scenarios = config.chat.scenarios || [];
    for (let element of scenarios) {
        if (element.key == scenario) {   
            found = true;         
        }
    }    

    if (!found) {
        throw new Error(`Selected scenario is not configured.`);
    }

    req.session.scenario = scenario;    
    res.send({ "response": "ok" });
});

app.post('/set-model', async (req, res) => {
    const { model } = req.body;

    let found = false;
    let models = config.chat.models || [];
    for (let element of models) {
        if (element.key == model) {   
            found = true;         
        }
    }    

    if (!found) {
        throw new Error(`Selected model is not configured.`);
    }

    req.session.model = model;    
    res.send({ "response": "ok" });
});

app.post('/set-use-rag', async (req, res) => {
    const { useRAG } = req.body;
    req.session.useRAG = useRAG;    
    res.send({ "response": "ok" });
});

app.post('/set-rag-category', async (req, res) => {
    const { category } = req.body;

    let found = false;
    let categories = config.chat.rag.categories || [];
    for (let element of categories) {
        if (element.key == category) {   
            found = true;         
        }
    }    

    if (!found) {
        throw new Error(`Selected category is not configured.`);
    }

    req.session.category = category;    
    res.send({ "response": "ok" });
});

app.post('/set-document-limit', async (req, res) => {
    const { docLimit } = req.body;
    req.session.docLimit = docLimit;    
    res.send({ "response": "ok" });
});

app.post('/clear-history', async (req, res) => {
    const { scenario } = req.body;

    if (!scenario) {
        throw new Error('Scenario is not provided.');
    }

    let userId = req.body.userId || req.session.id;
    if (!userId) {
        throw new Error('Failed to identify the user.');
    }   

    await clearChatHistory(userId, scenario);
    
    res.send({ "response": "ok" });
});

const PORT = config.port || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});